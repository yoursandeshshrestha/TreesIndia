import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import BackIcon from '../../../components/icons/BackIcon';
import SearchIcon from '../../../components/icons/SearchIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import AddressIcon from '../../../components/icons/AddressIcon';
import {
  locationSearchService,
  LocationPrediction,
} from '../../../services/api/location-search.service';
import {
  userLocationService,
  CreateLocationRequest,
} from '../../../services/api/user-location.service';
import { addressService, type Address } from '../../../services';
import {
  searchHistoryService,
  SearchHistoryEntry,
} from '../../../services/api/search-history.service';
import MapLocationPicker from '../../../components/MapLocationPicker';

interface AddressSelectionScreenProps {
  onBack: () => void;
  onAddressSelected?: () => void;
}

// Helper function to convert SearchHistoryEntry to LocationPrediction
const convertSearchHistoryToLocationPrediction = (
  history: SearchHistoryEntry
): LocationPrediction => ({
  place_id: history.place_id,
  description: history.description,
  formatted_address: history.formatted_address,
  city: history.city,
  state: history.state,
  country: history.country,
  country_code: history.country_code,
  postcode: history.postcode,
  latitude: history.latitude,
  longitude: history.longitude,
  address_line1: history.address_line1,
  address_line2: history.address_line2,
});

export default function AddressSelectionScreen({
  onBack,
  onAddressSelected,
}: AddressSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationPrediction[]>([]);
  const [recentSearches, setRecentSearches] = useState<LocationPrediction[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Load recent searches and saved addresses on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      await Promise.all([loadRecentSearches(), loadSavedAddresses()]);
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const histories = await searchHistoryService.getRecentSearches(10);
      const predictions = histories.map(convertSearchHistoryToLocationPrediction);
      setRecentSearches(predictions);
    } catch (error) {
      // Error handling
      setRecentSearches([]);
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const addresses = await addressService.getAddresses();
      setSavedAddresses(addresses);
    } catch (error) {
      // Error handling
      setSavedAddresses([]);
    }
  };

  const saveRecentSearch = async (location: LocationPrediction) => {
    try {
      await searchHistoryService.saveSearchHistory({
        place_id: location.place_id,
        description: location.description,
        formatted_address: location.formatted_address,
        city: location.city,
        state: location.state,
        country: location.country,
        country_code: location.country_code,
        postcode: location.postcode,
        latitude: location.latitude,
        longitude: location.longitude,
        address_line1: location.address_line1,
        address_line2: location.address_line2,
      });

      // Reload recent searches after saving
      await loadRecentSearches();
    } catch (error) {
      // Error handling
    }
  };

  const handleSelectSavedAddress = async (address: Address) => {
    try {
      const locationData: CreateLocationRequest = {
        city: address.city || '',
        state: address.state || '',
        country: address.country || 'India',
        address: address.address || undefined,
        postal_code: address.postalCode || address.postal_code || undefined,
        latitude: address.latitude || 0,
        longitude: address.longitude || 0,
      };

      await saveLocation(locationData);
    } catch (error: any) {
      // Error handling
      Alert.alert('Error', error.message || 'Failed to save location. Please try again.');
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await locationSearchService.searchLocations(
        query,
        currentLocation?.lat,
        currentLocation?.lng
      );
      setSearchResults(results);
    } catch (error) {
      // Error handling
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });

      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const addressData = geocode[0];

        // Build address components
        const streetParts: string[] = [];
        if (addressData.streetNumber) streetParts.push(addressData.streetNumber);
        if (addressData.street) streetParts.push(addressData.street);
        const streetAddress =
          streetParts.length > 0 ? streetParts.join(', ') : addressData.name || '';

        const city = addressData.city || addressData.subregion || '';
        const state = addressData.region || addressData.district || '';
        const postalCode = addressData.postalCode || '';
        const country = addressData.country || 'India';

        // Validate required fields
        if (!city.trim() || !state.trim() || !country.trim()) {
          Alert.alert(
            'Error',
            'Could not determine complete location information. Please try searching manually.',
            [{ text: 'OK' }]
          );
          setIsLoadingLocation(false);
          return;
        }

        // Create location
        const locationDataToSave: CreateLocationRequest = {
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          address: streetAddress.trim() || undefined,
          postal_code: postalCode.trim() || undefined,
          latitude: latitude,
          longitude: longitude,
        };

        await saveLocation(locationDataToSave);
      } else {
        Alert.alert(
          'Error',
          'Could not determine address from location. Please try searching manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      // Error handling
      Alert.alert(
        'Error',
        error.message ||
          'Failed to get your current location. Please try again or search manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const saveLocation = async (locationData: CreateLocationRequest) => {
    try {
      // Save/update user location (one per user)
      await userLocationService.createOrUpdateLocation(locationData);
      onAddressSelected?.();
      onBack();
    } catch (error: any) {
      // Error handling
      Alert.alert('Error', error.message || 'Failed to save location. Please try again.');
    }
  };

  const handleSelectLocation = async (location: LocationPrediction) => {
    try {
      // Save to recent searches
      await saveRecentSearch(location);

      // Extract location components - backend requires: city, state, country (address and postal_code are optional)
      const city = location.city || '';
      const state = location.state || '';
      const country = location.country || 'India';
      const address =
        location.address_line1 || location.formatted_address || location.description || '';
      const postalCode = location.postcode || '';

      // Validate required fields - backend requires: city, state, country
      if (!city.trim() || !state.trim()) {
        Alert.alert(
          'Error',
          'City and state information is required. Please select a different location.'
        );
        return;
      }

      if (!country.trim()) {
        Alert.alert(
          'Error',
          'Country information is required. Please select a different location.'
        );
        return;
      }

      const locationData: CreateLocationRequest = {
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        address: address.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
      };

      await saveLocation(locationData);
    } catch (error: any) {
      // Error handling
      Alert.alert('Error', error.message || 'Failed to save location. Please try again.');
    }
  };

  const handleMapLocationSelected = async (locationData: any) => {
    try {
      // Close map picker
      setShowMapPicker(false);

      // Validate required fields
      if (!locationData.city?.trim() || !locationData.state?.trim()) {
        Alert.alert(
          'Error',
          'City and state information is required. Please try a different location.'
        );
        return;
      }

      if (!locationData.country?.trim()) {
        Alert.alert('Error', 'Country information is required. Please try a different location.');
        return;
      }

      const createLocationData: CreateLocationRequest = {
        city: locationData.city.trim(),
        state: locationData.state.trim(),
        country: locationData.country.trim(),
        address: locationData.address?.trim() || undefined,
        postal_code: locationData.postcode?.trim() || undefined,
        latitude: locationData.latitude || 0,
        longitude: locationData.longitude || 0,
      };

      await saveLocation(createLocationData);
    } catch (error: any) {
      // Error handling
      Alert.alert('Error', error.message || 'Failed to save location. Please try again.');
    }
  };

  const renderLocationItem = (item: LocationPrediction, isRecent: boolean = false) => (
    <TouchableOpacity
      onPress={() => handleSelectLocation(item)}
      activeOpacity={0.7}
      className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
      <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]">
        {isRecent ? (
          <SearchIcon size={18} color="#6B7280" />
        ) : (
          <LocationIcon size={18} color="#6B7280" />
        )}
      </View>
      <View className="flex-1">
        <Text
          className="mb-1 font-medium text-base text-[#111928]"
          style={{ fontFamily: 'Inter-Medium' }}
          numberOfLines={1}>
          {item.description || item.formatted_address}
        </Text>
        {(item.city || item.state) && (
          <Text
            className="text-sm text-[#6B7280]"
            style={{ fontFamily: 'Inter-Regular' }}
            numberOfLines={1}>
            {[item.city, item.state].filter(Boolean).join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSavedAddressItem = (address: Address, index: number, total: number) => (
    <TouchableOpacity
      onPress={() => handleSelectSavedAddress(address)}
      activeOpacity={0.7}
      className="py-4">
      <View className="flex-row items-start">
        <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]">
          <AddressIcon size={18} color="#6B7280" />
        </View>
        <View className="flex-1">
          <Text
            className="mb-1 font-bold text-base text-[#111928]"
            style={{ fontFamily: 'Inter-Bold' }}
            numberOfLines={1}>
            {address.name}
          </Text>
          <Text
            className="text-sm text-[#4B5563]"
            style={{ fontFamily: 'Inter-Regular' }}
            numberOfLines={2}>
            {address.fullAddress ||
              `${address.address}, ${address.city}, ${address.state} ${address.postalCode || address.postal_code || ''}`.trim()}
          </Text>
        </View>
      </View>
      {index < total - 1 && <View className="mt-4 h-px bg-[#E5E7EB]" />}
    </TouchableOpacity>
  );

  const renderSkeletonLoader = () => {
    return (
      <View className="px-6 py-4">
        {/* Skeleton for Saved Addresses */}
        <View className="mb-8">
          <View className="mb-4 h-3 w-32 rounded bg-gray-200" />
          <View className="rounded-xl bg-white">
            {[1, 2].map((index) => (
              <View key={index} className="py-4">
                <View className="flex-row items-start">
                  <View className="mr-3 h-8 w-8 rounded-full bg-gray-200" />
                  <View className="flex-1">
                    <View className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                    <View className="h-3 w-full rounded bg-gray-200" />
                  </View>
                </View>
                {index < 2 && <View className="mt-4 h-px bg-[#E5E7EB]" />}
              </View>
            ))}
          </View>
        </View>

        {/* Skeleton for Recent Searches */}
        <View className="mb-8">
          <View className="mb-4 h-3 w-32 rounded bg-gray-200" />
          <View className="rounded-xl bg-white">
            {[1, 2, 3].map((index) => (
              <View key={index} className="py-3">
                <View className="flex-row items-start">
                  <View className="mr-3 h-8 w-8 rounded-full bg-gray-200" />
                  <View className="flex-1">
                    <View className="mb-2 h-4 w-2/3 rounded bg-gray-200" />
                    <View className="h-3 w-1/2 rounded bg-gray-200" />
                  </View>
                </View>
                {index < 3 && <View className="mt-3 h-px bg-[#E5E7EB]" />}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    // Show skeleton loader during initial load
    if (isInitialLoading && searchQuery.trim().length === 0) {
      return renderSkeletonLoader();
    }

    // Show searching state
    if (isSearching) {
      return (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color="#00a871" />
          <Text className="mt-4 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Searching...
          </Text>
        </View>
      );
    }

    // Typing but less than 2 characters
    if (searchQuery.trim().length > 0 && searchQuery.trim().length < 2) {
      return (
        <View className="items-center justify-center py-20">
          <Text
            className="mb-2 font-medium text-base text-[#6B7280]"
            style={{ fontFamily: 'Inter-Medium' }}>
            Type at least 2 characters
          </Text>
          <Text
            className="px-6 text-center text-sm text-[#9CA3AF]"
            style={{ fontFamily: 'Inter-Regular' }}>
            Continue typing to see location suggestions
          </Text>
        </View>
      );
    }

    // No results found after search
    if (searchResults.length === 0 && searchQuery.trim().length >= 2) {
      return (
        <View className="items-center justify-center py-20">
          <Text
            className="mb-2 font-medium text-base text-[#6B7280]"
            style={{ fontFamily: 'Inter-Medium' }}>
            No locations found
          </Text>
          <Text
            className="px-6 text-center text-sm text-[#9CA3AF]"
            style={{ fontFamily: 'Inter-Regular' }}>
            Try searching with a different term
          </Text>
        </View>
      );
    }

    // Show search results
    if (searchResults.length > 0) {
      return (
        <>
          {searchResults.map((item) => (
            <View key={item.place_id || `${item.latitude}-${item.longitude}`}>
              {renderLocationItem(item, false)}
            </View>
          ))}
        </>
      );
    }

    // Default view: Show saved addresses and recent searches
    return (
      <View className="px-6 py-4">
        {/* Saved Addresses Section */}
        {savedAddresses.length > 0 && (
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Saved Addresses
            </Text>
            <View className="rounded-xl bg-white">
              {savedAddresses.map((address, index) => (
                <View key={address.id}>
                  {renderSavedAddressItem(address, index, savedAddresses.length)}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Searches Section */}
        {recentSearches.length > 0 && (
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Recent Searches
            </Text>
            <View className="rounded-xl bg-white">
              {recentSearches.map((item, index) => (
                <View key={item.place_id || `${item.latitude}-${item.longitude}`}>
                  <TouchableOpacity
                    onPress={() => handleSelectLocation(item)}
                    activeOpacity={0.7}
                    className="py-3">
                    <View className="flex-row items-start">
                      <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]">
                        <SearchIcon size={18} color="#6B7280" />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="mb-1 font-bold text-base text-[#111928]"
                          style={{ fontFamily: 'Inter-Bold' }}
                          numberOfLines={1}>
                          {item.description || item.formatted_address}
                        </Text>
                        {(item.city || item.state) && (
                          <Text
                            className="text-sm text-[#4B5563]"
                            style={{ fontFamily: 'Inter-Regular' }}
                            numberOfLines={2}>
                            {[item.city, item.state].filter(Boolean).join(', ')}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                  {index < recentSearches.length - 1 && <View className="h-px bg-[#E5E7EB]" />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {savedAddresses.length === 0 && recentSearches.length === 0 && (
          <View className="items-center justify-center py-20">
            <SearchIcon size={64} color="#9CA3AF" />
            <Text
              className="mb-2 mt-4 font-medium text-base text-[#6B7280]"
              style={{ fontFamily: 'Inter-Medium' }}>
              Start typing to search
            </Text>
            <Text
              className="px-6 text-center text-sm text-[#9CA3AF]"
              style={{ fontFamily: 'Inter-Regular' }}>
              Enter your location to see suggestions
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header - Fixed at top with safe area */}
      <View style={{ paddingTop: insets.top, backgroundColor: 'white' }}>
        <View className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
          <TouchableOpacity onPress={onBack} className="-ml-2 mr-4 p-2" activeOpacity={0.7}>
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
            <SearchIcon size={20} color="#6B7280" />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for a location..."
              placeholderTextColor="#9CA3AF"
              className="ml-3 flex-1 text-base text-[#111928]"
              style={{
                fontFamily: 'Inter-Regular',
                paddingVertical: 0,
                margin: 0,
                fontSize: 16,
                lineHeight: Platform.OS === 'ios' ? 20 : 22,
                textAlignVertical: 'center',
                ...(Platform.OS === 'android' && {
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                }),
              }}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchQuery.trim().length >= 2) {
                  performSearch(searchQuery);
                }
              }}
            />
          </View>
        </View>
      </View>

      {/* Location Actions - Fixed below header */}
      <View className="border-b border-[#E5E7EB] px-6 py-4">
        {/* Use Current Location Button */}
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          disabled={isLoadingLocation}
          className="mb-3 flex-row items-center"
          activeOpacity={0.7}>
          {isLoadingLocation ? (
            <>
              <ActivityIndicator size="small" color="#055c3a" />
              <Text
                className="ml-3 font-medium text-base text-[#055c3a]"
                style={{ fontFamily: 'Inter-Medium' }}>
                Getting your location...
              </Text>
            </>
          ) : (
            <>
              <AddressIcon size={20} color="#055c3a" />
              <Text
                className="ml-3 font-medium text-base text-[#055c3a]"
                style={{ fontFamily: 'Inter-Medium' }}>
                Use current location
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Select on Map Button */}
        <TouchableOpacity
          onPress={() => setShowMapPicker(true)}
          className="flex-row items-center"
          activeOpacity={0.7}>
          <LocationIcon size={20} color="#00a871" />
          <Text
            className="ml-3 font-medium text-base text-[#00a871]"
            style={{ fontFamily: 'Inter-Medium' }}>
            Select on map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Results - Scrollable content area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}>
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Map Location Picker Modal */}
      <Modal visible={showMapPicker} animationType="slide" presentationStyle="fullScreen">
        <MapLocationPicker
          initialLocation={
            currentLocation
              ? {
                  latitude: currentLocation.lat,
                  longitude: currentLocation.lng,
                }
              : undefined
          }
          onLocationSelected={handleMapLocationSelected}
          onClose={() => setShowMapPicker(false)}
        />
      </Modal>
    </View>
  );
}
