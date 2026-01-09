package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// GoogleMapsService handles Google Maps API interactions
type GoogleMapsService struct {
	apiKey            string
	client            *http.Client
	placeDetailsCache map[string]*CacheEntry
	cacheMutex        sync.RWMutex
}

// CacheEntry stores cached place details with timestamp
type CacheEntry struct {
	Data      *GooglePlaceDetailsResult
	Timestamp time.Time
}

// Google API Response Structures

// GooglePlacesAutocompleteResponse represents Google Places Autocomplete API response
type GooglePlacesAutocompleteResponse struct {
	Predictions []GooglePrediction `json:"predictions"`
	Status      string             `json:"status"`
}

// GooglePrediction represents a prediction from Google Places Autocomplete
type GooglePrediction struct {
	PlaceID              string                       `json:"place_id"`
	Description          string                       `json:"description"`
	StructuredFormatting GoogleStructuredFormatting   `json:"structured_formatting"`
	Types                []string                     `json:"types"`
}

// GoogleStructuredFormatting represents structured formatting in predictions
type GoogleStructuredFormatting struct {
	MainText      string `json:"main_text"`
	SecondaryText string `json:"secondary_text"`
}

// GooglePlaceDetailsResponse represents Google Place Details API response
type GooglePlaceDetailsResponse struct {
	Result GooglePlaceDetailsResult `json:"result"`
	Status string                   `json:"status"`
}

// GooglePlaceDetailsResult represents place details result
type GooglePlaceDetailsResult struct {
	PlaceID           string                   `json:"place_id"`
	FormattedAddress  string                   `json:"formatted_address"`
	Geometry          GoogleGeometry           `json:"geometry"`
	AddressComponents []GoogleAddressComponent `json:"address_components"`
	Types             []string                 `json:"types"`
}

// GoogleGeocodingResponse represents Google Geocoding API response
type GoogleGeocodingResponse struct {
	Results []GoogleGeocodingResult `json:"results"`
	Status  string                  `json:"status"`
}

// GoogleGeocodingResult represents a geocoding result
type GoogleGeocodingResult struct {
	PlaceID           string                   `json:"place_id"`
	FormattedAddress  string                   `json:"formatted_address"`
	Geometry          GoogleGeometry           `json:"geometry"`
	AddressComponents []GoogleAddressComponent `json:"address_components"`
	Types             []string                 `json:"types"`
}

// GoogleGeometry represents geometry information
type GoogleGeometry struct {
	Location     GoogleLocation `json:"location"`
	LocationType string         `json:"location_type"`
}

// GoogleLocation represents a location with lat/lng
type GoogleLocation struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// GoogleAddressComponent represents an address component
type GoogleAddressComponent struct {
	LongName  string   `json:"long_name"`
	ShortName string   `json:"short_name"`
	Types     []string `json:"types"`
}

// NewGoogleMapsService creates a new Google Maps service
func NewGoogleMapsService() *GoogleMapsService {
	apiKey := os.Getenv("GOOGLE_MAPS_API_KEY")
	if apiKey == "" {
		logrus.Fatal("GOOGLE_MAPS_API_KEY environment variable is required")
	}

	return &GoogleMapsService{
		apiKey: apiKey,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		placeDetailsCache: make(map[string]*CacheEntry),
	}
}

// GetPlaceAutocomplete gets autocomplete suggestions using Google Places API
func (gms *GoogleMapsService) GetPlaceAutocomplete(req *AutocompleteRequest) (*AutocompleteResponse, error) {
	// Call Google Places Autocomplete API
	baseURL := "https://maps.googleapis.com/maps/api/place/autocomplete/json"

	params := url.Values{}
	params.Add("key", gms.apiKey)
	params.Add("input", req.Input)

	// Add location bias if provided
	if req.Latitude != 0 && req.Longitude != 0 {
		params.Add("location", fmt.Sprintf("%f,%f", req.Latitude, req.Longitude))
		if req.Radius > 0 {
			params.Add("radius", fmt.Sprintf("%d", req.Radius))
		}
	}

	// Add country restriction (India)
	if req.Components != "" || req.Input != "" {
		params.Add("components", "country:in")
	}

	// Add language preference
	params.Add("language", "en")

	requestURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	resp, err := gms.client.Get(requestURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make autocomplete request: %w", err)
	}
	defer resp.Body.Close()

	var googleResult GooglePlacesAutocompleteResponse
	if err := json.NewDecoder(resp.Body).Decode(&googleResult); err != nil {
		return nil, fmt.Errorf("failed to decode autocomplete response: %w", err)
	}

	// Handle Google API errors
	if googleResult.Status != "OK" && googleResult.Status != "ZERO_RESULTS" {
		return nil, gms.handleAPIError(googleResult.Status)
	}

	// Convert Google results to our format
	return gms.convertGooglePlacesToAutocomplete(&googleResult)
}

// getPlaceDetails gets detailed information for a place
func (gms *GoogleMapsService) getPlaceDetails(placeID string) (*GooglePlaceDetailsResult, error) {
	// Check cache first
	if cached, found := gms.getCachedPlaceDetails(placeID); found {
		logrus.Debugf("Cache hit for place_id: %s", placeID)
		return cached, nil
	}

	// Call Google Place Details API
	baseURL := "https://maps.googleapis.com/maps/api/place/details/json"

	params := url.Values{}
	params.Add("key", gms.apiKey)
	params.Add("place_id", placeID)
	params.Add("fields", "place_id,formatted_address,geometry,address_components,types")
	params.Add("language", "en")

	requestURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	resp, err := gms.client.Get(requestURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make place details request: %w", err)
	}
	defer resp.Body.Close()

	var googleResult GooglePlaceDetailsResponse
	if err := json.NewDecoder(resp.Body).Decode(&googleResult); err != nil {
		return nil, fmt.Errorf("failed to decode place details response: %w", err)
	}

	// Handle Google API errors
	if googleResult.Status != "OK" {
		return nil, gms.handleAPIError(googleResult.Status)
	}

	// Cache the result
	gms.cachePlaceDetails(placeID, &googleResult.Result)

	return &googleResult.Result, nil
}

// getCachedPlaceDetails retrieves cached place details
func (gms *GoogleMapsService) getCachedPlaceDetails(placeID string) (*GooglePlaceDetailsResult, bool) {
	gms.cacheMutex.RLock()
	defer gms.cacheMutex.RUnlock()

	if entry, exists := gms.placeDetailsCache[placeID]; exists {
		// Check if cache entry is still valid (24 hours)
		if time.Since(entry.Timestamp) < 24*time.Hour {
			return entry.Data, true
		}
	}
	return nil, false
}

// cachePlaceDetails stores place details in cache
func (gms *GoogleMapsService) cachePlaceDetails(placeID string, details *GooglePlaceDetailsResult) {
	gms.cacheMutex.Lock()
	defer gms.cacheMutex.Unlock()

	gms.placeDetailsCache[placeID] = &CacheEntry{
		Data:      details,
		Timestamp: time.Now(),
	}
}

// convertGooglePlacesToAutocomplete converts Google Places response to our format
func (gms *GoogleMapsService) convertGooglePlacesToAutocomplete(googleResult *GooglePlacesAutocompleteResponse) (*AutocompleteResponse, error) {
	result := &AutocompleteResponse{
		Status: "OK",
	}

	if len(googleResult.Predictions) == 0 {
		result.Predictions = []AutocompletePrediction{}
		return result, nil
	}

	// For each prediction, fetch place details to get full address components
	for _, prediction := range googleResult.Predictions {
		// Get place details (with caching)
		details, err := gms.getPlaceDetails(prediction.PlaceID)
		if err != nil {
			logrus.Warnf("Failed to get place details for %s: %v", prediction.PlaceID, err)
			// Create basic prediction without full details
			result.Predictions = append(result.Predictions, AutocompletePrediction{
				PlaceID:     prediction.PlaceID,
				Description: prediction.Description,
				StructuredFormatting: StructuredFormatting{
					MainText:      prediction.StructuredFormatting.MainText,
					SecondaryText: prediction.StructuredFormatting.SecondaryText,
				},
				Types: prediction.Types,
			})
			continue
		}

		// Extract address components
		addressComponents := gms.extractAddressComponentsFromGoogle(details.AddressComponents)

		// Create prediction with full details
		pred := AutocompletePrediction{
			PlaceID:     details.PlaceID,
			Description: prediction.Description,
			StructuredFormatting: StructuredFormatting{
				MainText:      prediction.StructuredFormatting.MainText,
				SecondaryText: prediction.StructuredFormatting.SecondaryText,
			},
			Types:         prediction.Types,
			Country:       addressComponents["country"],
			CountryCode:   addressComponents["country_code"],
			State:         addressComponents["state"],
			City:          addressComponents["city"],
			Postcode:      addressComponents["postcode"],
			Latitude:      details.Geometry.Location.Lat,
			Longitude:     details.Geometry.Location.Lng,
			AddressLine1:  addressComponents["address_line1"],
			AddressLine2:  addressComponents["address_line2"],
			Formatted:     details.FormattedAddress,
		}

		result.Predictions = append(result.Predictions, pred)
	}

	return result, nil
}

// GeocodeAddress converts an address to coordinates using Google Geocoding API
func (gms *GoogleMapsService) GeocodeAddress(req *GeocodeRequest) (*GeocodingResponse, error) {
	baseURL := "https://maps.googleapis.com/maps/api/geocode/json"

	params := url.Values{}
	params.Add("key", gms.apiKey)
	params.Add("address", req.Address)

	// Add country restriction if provided
	if req.Components != "" {
		params.Add("components", "country:in")
	}

	// Add language preference
	if req.Language != "" {
		params.Add("language", req.Language)
	} else {
		params.Add("language", "en")
	}

	requestURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	resp, err := gms.client.Get(requestURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make geocoding request: %w", err)
	}
	defer resp.Body.Close()

	var googleResult GoogleGeocodingResponse
	if err := json.NewDecoder(resp.Body).Decode(&googleResult); err != nil {
		return nil, fmt.Errorf("failed to decode geocoding response: %w", err)
	}

	// Handle Google API errors
	if googleResult.Status != "OK" && googleResult.Status != "ZERO_RESULTS" {
		return nil, gms.handleAPIError(googleResult.Status)
	}

	// Convert Google results to our format
	return gms.convertGoogleGeocodingToResponse(&googleResult), nil
}

// ReverseGeocode converts coordinates to address using Google Geocoding API
func (gms *GoogleMapsService) ReverseGeocode(req *ReverseGeocodeRequest) (*GeocodingResponse, error) {
	baseURL := "https://maps.googleapis.com/maps/api/geocode/json"

	params := url.Values{}
	params.Add("key", gms.apiKey)
	params.Add("latlng", fmt.Sprintf("%f,%f", req.Latitude, req.Longitude))

	// Add language preference
	if req.Language != "" {
		params.Add("language", req.Language)
	} else {
		params.Add("language", "en")
	}

	requestURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	resp, err := gms.client.Get(requestURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make reverse geocoding request: %w", err)
	}
	defer resp.Body.Close()

	var googleResult GoogleGeocodingResponse
	if err := json.NewDecoder(resp.Body).Decode(&googleResult); err != nil {
		return nil, fmt.Errorf("failed to decode reverse geocoding response: %w", err)
	}

	// Handle Google API errors
	if googleResult.Status != "OK" && googleResult.Status != "ZERO_RESULTS" {
		return nil, gms.handleAPIError(googleResult.Status)
	}

	// Convert Google results to our format
	return gms.convertGoogleGeocodingToResponse(&googleResult), nil
}

// convertGoogleGeocodingToResponse converts Google Geocoding response to our format
func (gms *GoogleMapsService) convertGoogleGeocodingToResponse(googleResult *GoogleGeocodingResponse) *GeocodingResponse {
	result := &GeocodingResponse{
		Status: "OK",
	}

	for _, googleRes := range googleResult.Results {
		// Extract address components
		addressComponents := gms.extractAddressComponentsFromGoogle(googleRes.AddressComponents)

		// Build address component array for response
		addressComponentArray := []AddressComponent{}
		for _, comp := range googleRes.AddressComponents {
			addressComponentArray = append(addressComponentArray, AddressComponent{
				LongName:  comp.LongName,
				ShortName: comp.ShortName,
				Types:     comp.Types,
			})
		}

		geocodeResult := GeocodingResult{
			FormattedAddress: googleRes.FormattedAddress,
			PlaceID:          googleRes.PlaceID,
			Types:            googleRes.Types,
			Geometry: GeocodingGeometry{
				Location: LatLng{
					Lat: googleRes.Geometry.Location.Lat,
					Lng: googleRes.Geometry.Location.Lng,
				},
				LocationType: googleRes.Geometry.LocationType,
			},
			AddressComponents: addressComponentArray,
			Country:           addressComponents["country"],
			CountryCode:       addressComponents["country_code"],
			State:             addressComponents["state"],
			City:              addressComponents["city"],
			Postcode:          addressComponents["postcode"],
			AddressLine1:      addressComponents["address_line1"],
			AddressLine2:      addressComponents["address_line2"],
		}

		result.Results = append(result.Results, geocodeResult)
	}

	return result
}

// extractAddressComponentsFromGoogle extracts address components from Google's format
func (gms *GoogleMapsService) extractAddressComponentsFromGoogle(components []GoogleAddressComponent) map[string]string {
	extracted := make(map[string]string)

	var streetNumber string
	var route string
	var sublocality string

	for _, component := range components {
		for _, componentType := range component.Types {
			switch componentType {
			case "street_number":
				streetNumber = component.LongName
			case "route":
				route = component.LongName
			case "sublocality", "sublocality_level_1":
				if sublocality == "" {
					sublocality = component.LongName
				}
			case "locality":
				extracted["city"] = component.LongName
			case "administrative_area_level_1":
				extracted["state"] = component.LongName
				extracted["state_code"] = component.ShortName
			case "administrative_area_level_2":
				if extracted["city"] == "" {
					extracted["city"] = component.LongName
				}
			case "country":
				extracted["country"] = component.LongName
				extracted["country_code"] = component.ShortName
			case "postal_code":
				extracted["postcode"] = component.LongName
			case "neighborhood":
				if extracted["address_line1"] == "" && sublocality == "" {
					extracted["address_line1"] = component.LongName
				}
			}
		}
	}

	// Build address_line1 from sublocality or neighborhood
	if sublocality != "" {
		extracted["address_line1"] = sublocality
	}

	// Build address_line2 from street number and route
	if streetNumber != "" && route != "" {
		extracted["address_line2"] = streetNumber + " " + route
	} else if route != "" {
		extracted["address_line2"] = route
	} else if streetNumber != "" {
		extracted["address_line2"] = streetNumber
	}

	return extracted
}

// ExtractAddressComponents extracts address components from geocoding result
func (gms *GoogleMapsService) ExtractAddressComponents(result *GeocodingResult) map[string]string {
	components := make(map[string]string)

	for _, component := range result.AddressComponents {
		for _, componentType := range component.Types {
			switch componentType {
			case "street_number":
				components["street_number"] = component.LongName
			case "route":
				components["route"] = component.LongName
			case "locality":
				components["city"] = component.LongName
			case "administrative_area_level_1":
				components["state"] = component.LongName
			case "postal_code":
				components["postal_code"] = component.LongName
			case "country":
				components["country"] = component.LongName
			case "sublocality":
				components["sublocality"] = component.LongName
			case "neighborhood":
				components["neighborhood"] = component.LongName
			}
		}
	}

	return components
}

// handleAPIError handles Google API error codes
func (gms *GoogleMapsService) handleAPIError(status string) error {
	switch status {
	case "ZERO_RESULTS":
		return fmt.Errorf("no results found")
	case "OVER_QUERY_LIMIT":
		logrus.Error("Google Maps API rate limit exceeded")
		return fmt.Errorf("API rate limit exceeded - please try again later")
	case "REQUEST_DENIED":
		logrus.Error("Google Maps API request denied - check API key and permissions")
		return fmt.Errorf("API request denied - please contact support")
	case "INVALID_REQUEST":
		return fmt.Errorf("invalid request parameters")
	case "UNKNOWN_ERROR":
		logrus.Warn("Google Maps API returned unknown error")
		return fmt.Errorf("service temporarily unavailable - please try again")
	default:
		return fmt.Errorf("unexpected API error: %s", status)
	}
}
