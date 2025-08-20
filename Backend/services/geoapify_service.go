package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
)

// GeoapifyService handles Geoapify API interactions
type GeoapifyService struct {
	apiKey string
	client *http.Client
}

// GeoapifyResponse represents the response from Geoapify API
type GeoapifyResponse struct {
	Type     string           `json:"type"`
	Features []GeoapifyFeature `json:"features"`
	Query    GeoapifyQuery    `json:"query"`
}

// GeoapifyFeature represents a feature in Geoapify response
type GeoapifyFeature struct {
	Type       string                 `json:"type"`
	Properties GeoapifyProperties     `json:"properties"`
	Geometry   GeoapifyGeometry       `json:"geometry"`
	Bbox       []float64              `json:"bbox,omitempty"`
}

// GeoapifyProperties represents properties of a Geoapify feature
type GeoapifyProperties struct {
	Datasource    GeoapifyDatasource `json:"datasource"`
	Country       string             `json:"country"`
	CountryCode   string             `json:"country_code"`
	Region        string             `json:"region,omitempty"`
	State         string             `json:"state,omitempty"`
	City          string             `json:"city,omitempty"`
	Postcode      string             `json:"postcode,omitempty"`
	Iso3166_2     string             `json:"iso3166_2,omitempty"`
	Lon           float64            `json:"lon"`
	Lat           float64            `json:"lat"`
	ResultType    string             `json:"result_type"`
	Formatted     string             `json:"formatted"`
	AddressLine1  string             `json:"address_line1"`
	AddressLine2  string             `json:"address_line2"`
	Category      string             `json:"category"`
	PlaceID       string             `json:"place_id"`
	Timezone      GeoapifyTimezone   `json:"timezone,omitempty"`
	Rank          GeoapifyRank       `json:"rank"`
}

// GeoapifyDatasource represents the data source information
type GeoapifyDatasource struct {
	Sourcename   string `json:"sourcename"`
	Attribution  string `json:"attribution"`
	License      string `json:"license"`
	URL          string `json:"url"`
}

// GeoapifyGeometry represents the geometry of a feature
type GeoapifyGeometry struct {
	Type        string    `json:"type"`
	Coordinates []float64 `json:"coordinates"`
}

// GeoapifyTimezone represents timezone information
type GeoapifyTimezone struct {
	Name              string `json:"name"`
	OffsetSTD         string `json:"offset_STD"`
	OffsetSTDSeconds  int    `json:"offset_STD_seconds"`
	OffsetDST         string `json:"offset_DST"`
	OffsetDSTSeconds  int    `json:"offset_DST_seconds"`
	AbbreviationSTD   string `json:"abbreviation_STD"`
	AbbreviationDST   string `json:"abbreviation_DST"`
}

// GeoapifyRank represents ranking information
type GeoapifyRank struct {
	Importance         float64 `json:"importance"`
	Confidence         float64 `json:"confidence"`
	ConfidenceCityLevel float64 `json:"confidence_city_level"`
	MatchType          string  `json:"match_type"`
}

// GeoapifyQuery represents the query information
type GeoapifyQuery struct {
	Text   string                 `json:"text"`
	Parsed GeoapifyParsedQuery    `json:"parsed"`
}

// GeoapifyParsedQuery represents parsed query information
type GeoapifyParsedQuery struct {
	City         string   `json:"city,omitempty"`
	ExpectedType string   `json:"expected_type"`
	Categories   []string `json:"categories"`
}

// AutocompleteResponse represents the response for autocomplete
type AutocompleteResponse struct {
	Status       string                    `json:"status"`
	ErrorMessage string                    `json:"error_message,omitempty"`
	Predictions  []AutocompletePrediction  `json:"predictions"`
}

// AutocompletePrediction represents an autocomplete prediction
type AutocompletePrediction struct {
	PlaceID       string                    `json:"place_id"`
	Description   string                    `json:"description"`
	StructuredFormatting StructuredFormatting `json:"structured_formatting"`
	Types         []string                  `json:"types"`
	// Enhanced fields from Geoapify API
	Country       string             `json:"country,omitempty"`
	CountryCode   string             `json:"country_code,omitempty"`
	Region        string             `json:"region,omitempty"`
	State         string             `json:"state,omitempty"`
	City          string             `json:"city,omitempty"`
	Postcode      string             `json:"postcode,omitempty"`
	Iso3166_2     string             `json:"iso3166_2,omitempty"`
	Latitude      float64            `json:"latitude,omitempty"`
	Longitude     float64            `json:"longitude,omitempty"`
	ResultType    string             `json:"result_type,omitempty"`
	Category      string             `json:"category,omitempty"`
	AddressLine1  string             `json:"address_line1,omitempty"`
	AddressLine2  string             `json:"address_line2,omitempty"`
	Formatted     string             `json:"formatted,omitempty"`
	Timezone      *GeoapifyTimezone  `json:"timezone,omitempty"`
	Rank          *GeoapifyRank      `json:"rank,omitempty"`
	Datasource    *GeoapifyDatasource `json:"datasource,omitempty"`
	Geometry      *GeoapifyGeometry  `json:"geometry,omitempty"`
	Bbox          []float64          `json:"bbox,omitempty"`
}

// StructuredFormatting represents structured formatting for autocomplete
type StructuredFormatting struct {
	MainText      string `json:"main_text"`
	SecondaryText string `json:"secondary_text"`
}

// AutocompleteRequest represents the request for autocomplete
type AutocompleteRequest struct {
	Input        string  `json:"input"`
	Latitude     float64 `json:"latitude,omitempty"`
	Longitude    float64 `json:"longitude,omitempty"`
	Radius       int     `json:"radius,omitempty"` // in meters
	Types        string  `json:"types,omitempty"`  // geocode, address, establishment, etc.
	Components   string  `json:"components,omitempty"` // country:in, etc.
	SessionToken string  `json:"session_token,omitempty"`
}

// GeocodingResponse represents the response from Geocoding API
type GeocodingResponse struct {
	Status       string            `json:"status"`
	ErrorMessage string            `json:"error_message,omitempty"`
	Results      []GeocodingResult `json:"results"`
}

// GeocodingResult represents a geocoding result
type GeocodingResult struct {
	FormattedAddress string            `json:"formatted_address"`
	Geometry         GeocodingGeometry `json:"geometry"`
	PlaceID          string            `json:"place_id"`
	Types            []string          `json:"types"`
	AddressComponents []AddressComponent `json:"address_components"`
	// Enhanced fields from Geoapify API
	Country       string             `json:"country,omitempty"`
	CountryCode   string             `json:"country_code,omitempty"`
	Region        string             `json:"region,omitempty"`
	State         string             `json:"state,omitempty"`
	City          string             `json:"city,omitempty"`
	Postcode      string             `json:"postcode,omitempty"`
	Iso3166_2     string             `json:"iso3166_2,omitempty"`
	ResultType    string             `json:"result_type,omitempty"`
	Category      string             `json:"category,omitempty"`
	AddressLine1  string             `json:"address_line1,omitempty"`
	AddressLine2  string             `json:"address_line2,omitempty"`
	Timezone      *GeoapifyTimezone  `json:"timezone,omitempty"`
	Rank          *GeoapifyRank      `json:"rank,omitempty"`
	Datasource    *GeoapifyDatasource `json:"datasource,omitempty"`
}

// GeocodingGeometry represents geometry in geocoding
type GeocodingGeometry struct {
	Location     LatLng `json:"location"`
	LocationType string `json:"location_type"`
	Bounds       *Bounds `json:"bounds,omitempty"`
	Viewport     *Bounds `json:"viewport,omitempty"`
}

// LatLng represents latitude and longitude
type LatLng struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// Bounds represents viewport bounds
type Bounds struct {
	Northeast LatLng `json:"northeast"`
	Southwest LatLng `json:"southwest"`
}

// AddressComponent represents an address component
type AddressComponent struct {
	LongName  string   `json:"long_name"`
	ShortName string   `json:"short_name"`
	Types     []string `json:"types"`
}

// GeocodeRequest represents the request for geocoding
type GeocodeRequest struct {
	Address      string `json:"address"`
	Components   string `json:"components,omitempty"`
	Bounds       string `json:"bounds,omitempty"`
	Language     string `json:"language,omitempty"`
	Region       string `json:"region,omitempty"`
}

// ReverseGeocodeRequest represents the request for reverse geocoding
type ReverseGeocodeRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Language  string  `json:"language,omitempty"`
	ResultType string `json:"result_type,omitempty"`
	LocationType string `json:"location_type,omitempty"`
}

// NewGeoapifyService creates a new Geoapify service
func NewGeoapifyService() *GeoapifyService {
	apiKey := os.Getenv("GEOAPIFY_API_KEY")
	if apiKey == "" {
		// Fallback to the provided Geoapify key for development
		apiKey = "6d4a996f94e94b2eb9df2f33aad8ee94"
	}

	return &GeoapifyService{
		apiKey: apiKey,
		client: &http.Client{},
	}
}

// GetPlaceAutocomplete gets autocomplete suggestions using Geoapify API
func (gps *GeoapifyService) GetPlaceAutocomplete(req *AutocompleteRequest) (*AutocompleteResponse, error) {
	// Use Geoapify API for autocomplete
	baseURL := "https://api.geoapify.com/v1/geocode/autocomplete"
	
	params := url.Values{}
	params.Add("apiKey", gps.apiKey)
	params.Add("text", req.Input)
	params.Add("limit", "10") // Limit results to 10
	
	// Add country filter if needed (optional)
	if req.Components != "" {
		params.Add("country", "in") // Restrict to India
	}
	
	// Add location bias if provided
	if req.Latitude != 0 && req.Longitude != 0 {
		params.Add("lat", fmt.Sprintf("%f", req.Latitude))
		params.Add("lon", fmt.Sprintf("%f", req.Longitude))
		params.Add("radius", strconv.Itoa(req.Radius))
	}
	
	// Add language preference
	params.Add("lang", "en")
	
	url := fmt.Sprintf("%s?%s", baseURL, params.Encode())
	
	fmt.Printf("Making request to: %s\n", url)
	
	resp, err := gps.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	fmt.Printf("Response status: %s\n", resp.Status)

	var geoapifyResult GeoapifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&geoapifyResult); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Debug: Print the raw response
	fmt.Printf("Geoapify Response: %+v\n", geoapifyResult)
	fmt.Printf("Features count: %d\n", len(geoapifyResult.Features))

	// Convert Geoapify results to autocomplete format
	return gps.convertGeoapifyToAutocomplete(&geoapifyResult), nil
}

// convertGeoapifyToAutocomplete converts Geoapify results to autocomplete format
func (gps *GeoapifyService) convertGeoapifyToAutocomplete(geoapifyResult *GeoapifyResponse) *AutocompleteResponse {
	result := &AutocompleteResponse{
		Status: "OK",
	}
	
	// Check if features exist
	if geoapifyResult.Features == nil || len(geoapifyResult.Features) == 0 {
		result.Predictions = []AutocompletePrediction{}
		return result
	}
	
	for _, feature := range geoapifyResult.Features {
		props := feature.Properties
		
		prediction := AutocompletePrediction{
			PlaceID:     props.PlaceID,
			Description: props.Formatted,
			StructuredFormatting: StructuredFormatting{
				MainText:      props.AddressLine1,
				SecondaryText: props.AddressLine2,
			},
			Types: []string{props.Category, props.ResultType},
			// Enhanced fields from Geoapify API
			Country:       props.Country,
			CountryCode:   props.CountryCode,
			Region:        props.Region,
			State:         props.State,
			City:          props.City,
			Postcode:      props.Postcode,
			Iso3166_2:     props.Iso3166_2,
			Latitude:      props.Lat,
			Longitude:     props.Lon,
			ResultType:    props.ResultType,
			Category:      props.Category,
			AddressLine1:  props.AddressLine1,
			AddressLine2:  props.AddressLine2,
			Formatted:     props.Formatted,
			Timezone:      &props.Timezone,
			Rank:          &props.Rank,
			Datasource:    &props.Datasource,
			Geometry:      &feature.Geometry,
			Bbox:          feature.Bbox,
		}
		
		result.Predictions = append(result.Predictions, prediction)
	}
	
	return result
}

// GeocodeAddress converts an address to coordinates using Geoapify
func (gps *GeoapifyService) GeocodeAddress(req *GeocodeRequest) (*GeocodingResponse, error) {
	baseURL := "https://api.geoapify.com/v1/geocode/search"
	
	params := url.Values{}
	params.Add("apiKey", gps.apiKey)
	params.Add("text", req.Address)
	params.Add("limit", "1")
	
	if req.Components != "" {
		params.Add("country", "in")
	}
	
	if req.Language != "" {
		params.Add("lang", req.Language)
	}

	url := fmt.Sprintf("%s?%s", baseURL, params.Encode())
	
	resp, err := gps.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	var geoapifyResult GeoapifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&geoapifyResult); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Convert Geoapify results to geocoding format
	return gps.convertGeoapifyToGeocoding(&geoapifyResult), nil
}

// convertGeoapifyToGeocoding converts Geoapify results to geocoding format
func (gps *GeoapifyService) convertGeoapifyToGeocoding(geoapifyResult *GeoapifyResponse) *GeocodingResponse {
	result := &GeocodingResponse{
		Status: "OK",
	}
	
	for _, feature := range geoapifyResult.Features {
		props := feature.Properties
		
		// Extract address components from Geoapify properties
		addressComponents := gps.extractAddressComponents(props)
		
		geocodeResult := GeocodingResult{
			FormattedAddress: props.Formatted,
			PlaceID:          props.PlaceID,
			Types:            []string{props.Category, props.ResultType},
			Geometry: GeocodingGeometry{
				Location: LatLng{
					Lat: props.Lat,
					Lng: props.Lon,
				},
				LocationType: props.ResultType,
			},
			AddressComponents: addressComponents,
			// Enhanced fields from Geoapify API
			Country:       props.Country,
			CountryCode:   props.CountryCode,
			Region:        props.Region,
			State:         props.State,
			City:          props.City,
			Postcode:      props.Postcode,
			Iso3166_2:     props.Iso3166_2,
			ResultType:    props.ResultType,
			Category:      props.Category,
			AddressLine1:  props.AddressLine1,
			AddressLine2:  props.AddressLine2,
			Timezone:      &props.Timezone,
			Rank:          &props.Rank,
			Datasource:    &props.Datasource,
		}
		
		result.Results = append(result.Results, geocodeResult)
	}
	
	return result
}

// extractAddressComponents extracts address components from Geoapify properties
func (gps *GeoapifyService) extractAddressComponents(props GeoapifyProperties) []AddressComponent {
	var components []AddressComponent
	
	// Add country
	if props.Country != "" {
		components = append(components, AddressComponent{
			LongName:  props.Country,
			ShortName: props.CountryCode,
			Types:     []string{"country", "political"},
		})
	}
	
	// Add state/region
	if props.State != "" {
		components = append(components, AddressComponent{
			LongName:  props.State,
			ShortName: props.Iso3166_2,
			Types:     []string{"administrative_area_level_1", "political"},
		})
	}
	
	// Add region
	if props.Region != "" {
		components = append(components, AddressComponent{
			LongName:  props.Region,
			ShortName: props.Region,
			Types:     []string{"administrative_area_level_2", "political"},
		})
	}
	
	// Add city
	if props.City != "" {
		components = append(components, AddressComponent{
			LongName:  props.City,
			ShortName: props.City,
			Types:     []string{"locality", "political"},
		})
	}
	
	// Add postcode
	if props.Postcode != "" {
		components = append(components, AddressComponent{
			LongName:  props.Postcode,
			ShortName: props.Postcode,
			Types:     []string{"postal_code"},
		})
	}
	
	return components
}

// ReverseGeocode converts coordinates to address using Geoapify
func (gps *GeoapifyService) ReverseGeocode(req *ReverseGeocodeRequest) (*GeocodingResponse, error) {
	baseURL := "https://api.geoapify.com/v1/geocode/reverse"
	
	params := url.Values{}
	params.Add("apiKey", gps.apiKey)
	params.Add("lat", fmt.Sprintf("%f", req.Latitude))
	params.Add("lon", fmt.Sprintf("%f", req.Longitude))
	params.Add("limit", "1")
	
	if req.Language != "" {
		params.Add("lang", req.Language)
	}

	url := fmt.Sprintf("%s?%s", baseURL, params.Encode())
	
	resp, err := gps.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	var geoapifyResult GeoapifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&geoapifyResult); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Convert Geoapify results to geocoding format
	return gps.convertGeoapifyToGeocoding(&geoapifyResult), nil
}

// ExtractAddressComponents extracts address components from geocoding result
func (gps *GeoapifyService) ExtractAddressComponents(result *GeocodingResult) map[string]string {
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
