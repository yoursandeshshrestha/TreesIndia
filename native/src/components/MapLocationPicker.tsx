import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BackIcon from './icons/BackIcon';
import SearchIcon from './icons/SearchIcon';
import LocationIcon from './icons/LocationIcon';
import AddressIcon from './icons/AddressIcon';
import { locationSearchService, LocationPrediction } from '../services/api/location-search.service';

interface MapLocationPickerProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  onLocationSelected: (location: LocationData) => void;
  onClose?: () => void;
  embedded?: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  formatted_address: string;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function MapLocationPicker({
  initialLocation,
  onLocationSelected,
  onClose,
  embedded = false,
}: MapLocationPickerProps) {
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 12.9716,
    longitude: initialLocation?.longitude || 77.5946,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationPrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapRef = useRef<MapView>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const geocodingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation();
    } else {
      reverseGeocodeLocation(region.latitude, region.longitude);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      searchDebounceRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
      reverseGeocodeLocation(newRegion.latitude, newRegion.longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleRegionChangeComplete = (newRegion: typeof region) => {
    setRegion(newRegion);

    // Debounce geocoding to avoid too many API calls
    if (geocodingTimeoutRef.current) {
      clearTimeout(geocodingTimeoutRef.current);
    }

    geocodingTimeoutRef.current = setTimeout(() => {
      reverseGeocodeLocation(newRegion.latitude, newRegion.longitude);

      // Auto-update in embedded mode
      if (embedded && city && state) {
        const locationData: LocationData = {
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
          address: streetAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          postcode: postcode.trim(),
          formatted_address: currentAddress,
        };
        onLocationSelected(locationData);
      }
    }, 500);
  };

  const reverseGeocodeLocation = async (latitude: number, longitude: number) => {
    setIsGeocodingAddress(true);
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const addressData = geocode[0];

        const streetParts: string[] = [];
        if (addressData.streetNumber) streetParts.push(addressData.streetNumber);
        if (addressData.street) streetParts.push(addressData.street);
        if (addressData.name) streetParts.push(addressData.name);
        const street = streetParts.join(', ');

        const cityValue = addressData.city || addressData.subregion || '';
        const stateValue = addressData.region || addressData.district || '';
        const postcodeValue = addressData.postalCode || '';
        const countryValue = addressData.country || 'India';

        setStreetAddress(street);
        setCity(cityValue);
        setState(stateValue);
        setPostcode(postcodeValue);
        setCountry(countryValue);

        const addressParts = [street, cityValue, stateValue, postcodeValue]
          .filter(Boolean)
          .join(', ');
        setCurrentAddress(addressParts);

        // Auto-update in embedded mode after geocoding completes
        if (embedded && cityValue && stateValue) {
          const locationData: LocationData = {
            latitude,
            longitude,
            address: street.trim(),
            city: cityValue.trim(),
            state: stateValue.trim(),
            country: countryValue.trim(),
            postcode: postcodeValue.trim(),
            formatted_address: addressParts,
          };
          onLocationSelected(locationData);
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await locationSearchService.searchLocations(
        query,
        region.latitude,
        region.longitude
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultSelect = (result: LocationPrediction) => {
    const newRegion = {
      latitude: result.latitude || region.latitude,
      longitude: result.longitude || region.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };

    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 500);

    setShowSearchSheet(false);
    setSearchQuery('');
    setSearchResults([]);

    reverseGeocodeLocation(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirmLocation = () => {
    if (!city.trim() || !state.trim()) {
      Alert.alert(
        'Incomplete Address',
        'Unable to determine city and state. Please try a different location.'
      );
      return;
    }

    const locationData: LocationData = {
      latitude: region.latitude,
      longitude: region.longitude,
      address: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      postcode: postcode.trim(),
      formatted_address: currentAddress,
    };

    onLocationSelected(locationData);
  };

  return (
    <View style={styles.container}>
      {/* Header - Only show in full screen mode */}
      {!embedded && (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <BackIcon size={24} color="#111928" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Location</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
      )}

      {/* Map - Full height */}
      <View style={[styles.mapContainer, embedded && styles.mapContainerEmbedded]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
        />

        {/* Fixed Pin in Center */}
        <View style={styles.centerMarker} pointerEvents="none">
          <View style={styles.pinContainer}>
            <View style={styles.pinDot} />
            <View style={styles.pinStick} />
          </View>
        </View>

        {/* Tooltip */}
        {embedded && (
          <View style={styles.tooltipContainer} pointerEvents="none">
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Place the pin accurately on map</Text>
              {/* Downward pointer */}
              <View style={styles.tooltipPointer} />
            </View>
          </View>
        )}

        {/* Geocoding indicator */}
        {isGeocodingAddress && (
          <View style={styles.geocodingOverlay}>
            <ActivityIndicator size="small" color="#00a871" />
          </View>
        )}
      </View>

      {/* Address Details - Fixed at bottom */}
      {!embedded && (
        <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
          {/* Address Display */}
          <View style={styles.addressContainer}>
            <View style={styles.addressHeader}>
              <LocationIcon size={18} color="#00a871" />
              <Text style={styles.addressLabel}>Selected Location</Text>
            </View>
            <Text style={styles.addressText} numberOfLines={2}>
              {currentAddress || 'Move the map to select a location'}
            </Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => setShowSearchSheet(true)}
              activeOpacity={0.7}
            >
              <SearchIcon size={18} color="#00a871" />
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!city || !state || isGeocodingAddress) && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirmLocation}
              activeOpacity={0.7}
              disabled={isGeocodingAddress || !city || !state}
            >
              <Text style={styles.confirmButtonText}>
                {isGeocodingAddress ? 'Loading...' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Embedded mode bottom section */}
      {embedded && (
        <View style={styles.embeddedAddressContainer}>
          <View style={styles.embeddedAddressContent}>
            <View style={styles.embeddedAddressTextContainer}>
              <Text style={styles.embeddedAddressText} numberOfLines={2}>
                {currentAddress || 'Move the map to select location'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSearchSheet(true)}
              activeOpacity={0.7}
              style={styles.embeddedChangeButton}
            >
              <Text style={styles.embeddedChangeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Sheet Modal */}
      <Modal
        visible={showSearchSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSearchSheet(false)}
      >
        <View style={styles.searchSheetContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Search Sheet Header */}
          <View style={styles.searchHeader}>
            <Text style={styles.searchHeaderTitle}>Search Location</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <SearchIcon size={18} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search area, street name..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              autoFocus
            />
          </View>

          {/* Use Current Location Button */}
          <TouchableOpacity
            onPress={() => {
              getCurrentLocation();
              setShowSearchSheet(false);
            }}
            disabled={isLoadingLocation}
            style={styles.currentLocationButton}
            activeOpacity={0.7}
          >
            <View style={styles.currentLocationIconContainer}>
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#00a871" />
              ) : (
                <AddressIcon size={18} color="#00a871" />
              )}
            </View>
            <View style={styles.currentLocationTextContainer}>
              <Text style={styles.currentLocationTitle}>
                {isLoadingLocation ? 'Getting location...' : 'Use current location'}
              </Text>
              <Text style={styles.currentLocationSubtitle}>
                {isLoadingLocation ? 'Please wait' : 'Using GPS'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Search Results */}
          <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00a871" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <Text style={styles.resultsHeader}>Search Results</Text>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.place_id || `${result.latitude}-${result.longitude}`}
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultSelect(result)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultIconContainer}>
                      <LocationIcon size={16} color="#6B7280" />
                    </View>
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {result.description || result.formatted_address}
                      </Text>
                      {(result.city || result.state) && (
                        <Text style={styles.resultSubtitle}>
                          {[result.city, result.state].filter(Boolean).join(', ')}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : searchQuery.trim().length >= 2 ? (
              <View style={styles.emptyContainer}>
                <LocationIcon size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No locations found</Text>
                <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111928',
    fontFamily: 'Inter-SemiBold',
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapContainerEmbedded: {
    height: 280,
    flex: 0,
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00a871',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#00a871',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  pinStick: {
    width: 2,
    height: 22,
    backgroundColor: '#00a871',
    marginTop: -2,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: '80%',
    alignItems: 'center',
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  tooltipPointer: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.75)',
  },
  geocodingOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 15,
    color: '#111928',
    lineHeight: 20,
    fontFamily: 'Inter-Medium',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  changeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00a871',
    backgroundColor: 'white',
  },
  changeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00a871',
    marginLeft: 6,
    fontFamily: 'Inter-SemiBold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#00a871',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
  searchSheetContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111928',
    fontFamily: 'Inter-Bold',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#111928',
    fontFamily: 'Inter-Regular',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  currentLocationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  currentLocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  currentLocationSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  searchResults: {
    flex: 1,
  },
  resultsHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  resultIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111928',
    marginBottom: 3,
    fontFamily: 'Inter-Medium',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
    fontFamily: 'Inter-Medium',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  embeddedAddressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  embeddedAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  embeddedAddressTextContainer: {
    flex: 1,
  },
  embeddedAddressText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    fontFamily: 'Inter-Medium',
  },
  embeddedChangeButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  embeddedChangeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00a871',
    fontFamily: 'Inter-SemiBold',
  },
});
