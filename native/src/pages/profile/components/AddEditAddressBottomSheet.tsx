import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { type Address, type CreateAddressRequest, type UpdateAddressRequest } from '../../../services';
import Button from '../../../components/ui/Button';
import Input from '../../../components/common/Input';
import AddressIcon from '../../../components/icons/AddressIcon';

interface AddEditAddressBottomSheetProps {
  address: Address | null;
  onSave: (data: CreateAddressRequest | UpdateAddressRequest) => Promise<void>;
  onClose: () => void;
}

const ADDRESS_LABELS = ['Home', 'Work', 'Other'];

export default function AddEditAddressBottomSheet({
  address,
  onSave,
  onClose,
}: AddEditAddressBottomSheetProps) {
  const isEditing = !!address;
  const [name, setName] = useState(address?.name || '');
  const [addressText, setAddressText] = useState(address?.address || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [pincode, setPincode] = useState(address?.postalCode || address?.postal_code || '');
  const [houseNumber, setHouseNumber] = useState(address?.houseNumber || address?.house_number || '');
  const [landmark, setLandmark] = useState(address?.landmark || '');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [fetchedLatitude, setFetchedLatitude] = useState<number | undefined>(address?.latitude);
  const [fetchedLongitude, setFetchedLongitude] = useState<number | undefined>(address?.longitude);
  const [isSaving, setIsSaving] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    houseNumber?: string;
  }>({});

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 500,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
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
      setFetchedLatitude(latitude);
      setFetchedLongitude(longitude);

      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const addressData = geocode[0];

        // Build street address from available fields
        const streetParts: string[] = [];
        if (addressData.streetNumber) streetParts.push(addressData.streetNumber);
        if (addressData.street) streetParts.push(addressData.street);
        if (addressData.district) streetParts.push(addressData.district);
        const streetAddress = streetParts.length > 0 
          ? streetParts.join(', ') 
          : addressData.name || '';

        // Populate form fields
        if (streetAddress) {
          setAddressText(streetAddress);
        }
        if (addressData.city || addressData.subAdministrativeArea) {
          setCity(addressData.city || addressData.subAdministrativeArea || '');
        }
        if (addressData.region || addressData.administrativeArea) {
          setState(addressData.region || addressData.administrativeArea || '');
        }
        if (addressData.postalCode) {
          setPincode(addressData.postalCode);
        }
        if (addressData.streetNumber) {
          setHouseNumber(addressData.streetNumber);
        }
        if (addressData.name && addressData.name !== streetAddress) {
          setLandmark(addressData.name);
        }

        // Clear any existing errors
        setErrors({});
      } else {
        Alert.alert(
          'Location Found',
          'Location coordinates retrieved, but address details could not be determined. Please fill in the address manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Location error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to get your current location. Please try again or enter the address manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLabelSelect = (label: string) => {
    if (label === 'Other') {
      // If "Other" is selected and name is already "Other", clear it
      if (name === 'Other') {
        setName('');
      } else {
        setName('Other');
      }
    } else {
      // Toggle: if already selected, deselect; otherwise select
      setName(name === label ? '' : label);
    }
    if (errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Address label is required';
    }

    if (!addressText.trim()) {
      newErrors.address = 'Street address is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    }

    if (!houseNumber.trim()) {
      newErrors.houseNumber = 'House/Flat number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const addressData = {
        ...(isEditing && { id: address.id }),
        name: name.trim(),
        address: addressText.trim(),
        city: city.trim(),
        state: state.trim(),
        country: 'India',
        postal_code: pincode.trim(),
        latitude: fetchedLatitude || 0.0,
        longitude: fetchedLongitude || 0.0,
        house_number: houseNumber.trim() || undefined,
        landmark: landmark.trim() || undefined,
        is_default: false,
      };

      await onSave(addressData as CreateAddressRequest | UpdateAddressRequest);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-1">
          <Animated.View
            className="absolute inset-0 bg-black/50"
            style={{ opacity: overlayOpacity }}
          >
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={handleClose}
            />
          </Animated.View>

          <Animated.View
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
            style={{
              transform: [{ translateY: sheetTranslateY }],
              maxHeight: '90%',
            }}
          >
            <SafeAreaView edges={['bottom']} className="flex-1">
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
                  <Text
                    className="text-xl font-semibold text-[#111928]"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    {isEditing ? 'Edit Address' : 'Add New Address'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="p-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-2xl text-[#4B5563]">×</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 20 }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="px-6 pt-6">
                    {/* Use Current Location Button */}
                    <TouchableOpacity
                      onPress={handleUseCurrentLocation}
                      disabled={isLoadingLocation}
                      className="flex-row items-center justify-center border border-[#055c3a] rounded-lg py-3 mb-6"
                      activeOpacity={0.7}
                    >
                      {isLoadingLocation ? (
                        <>
                          <ActivityIndicator size="small" color="#055c3a" />
                          <Text
                            className="text-sm font-medium text-[#055c3a] ml-2"
                            style={{ fontFamily: 'Inter-Medium' }}
                          >
                            Fetching location...
                          </Text>
                        </>
                      ) : (
                        <>
                          <AddressIcon size={18} color="#055c3a" />
                          <Text
                            className="text-sm font-medium text-[#055c3a] ml-2"
                            style={{ fontFamily: 'Inter-Medium' }}
                          >
                            Use Current Location
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Street Address */}
                    <View className="mb-4">
                      <Input
                        label="Street Address"
                        value={addressText}
                        onChangeText={(text) => {
                          setAddressText(text);
                          if (errors.address) {
                            setErrors({ ...errors, address: undefined });
                          }
                        }}
                        placeholder="Enter complete address"
                        error={errors.address}
                        required
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    {/* Pincode and City Row */}
                    <View className="flex-row mb-4">
                      <View className="flex-1 mr-2">
                        <Input
                          label="Pincode"
                          value={pincode}
                          onChangeText={(text) => {
                            const numericText = text.replace(/\D/g, '');
                            setPincode(numericText);
                            if (errors.pincode) {
                              setErrors({ ...errors, pincode: undefined });
                            }
                          }}
                          placeholder="Enter pincode"
                          keyboardType="number-pad"
                          error={errors.pincode}
                          required
                        />
                      </View>
                      <View className="flex-1 ml-2">
                        <Input
                          label="City"
                          value={city}
                          onChangeText={(text) => {
                            setCity(text);
                            if (errors.city) {
                              setErrors({ ...errors, city: undefined });
                            }
                          }}
                          placeholder="Enter city"
                          error={errors.city}
                          required
                        />
                      </View>
                    </View>

                    {/* State */}
                    <View className="mb-4">
                      <Input
                        label="State"
                        value={state}
                        onChangeText={(text) => {
                          setState(text);
                          if (errors.state) {
                            setErrors({ ...errors, state: undefined });
                          }
                        }}
                        placeholder="Enter state"
                        error={errors.state}
                        required
                      />
                    </View>

                    {/* House/Flat Number */}
                    <View className="mb-4">
                      <Input
                        label="House/Flat Number"
                        value={houseNumber}
                        onChangeText={(text) => {
                          setHouseNumber(text);
                          if (errors.houseNumber) {
                            setErrors({ ...errors, houseNumber: undefined });
                          }
                        }}
                        placeholder="Enter House/Flat Number"
                        error={errors.houseNumber}
                        required
                      />
                    </View>

                    {/* Landmark */}
                    <View className="mb-4">
                      <Input
                        label="Landmark"
                        value={landmark}
                        onChangeText={setLandmark}
                        placeholder="Enter Landmark"
                      />
                    </View>

                    {/* Address Label */}
                    <View className="mb-4">
                      <Text
                        className="text-sm font-semibold text-[#374151] mb-2"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        Address Label
                      </Text>
                      <View className="flex-row">
                        {ADDRESS_LABELS.map((label) => (
                          <TouchableOpacity
                            key={label}
                            onPress={() => handleLabelSelect(label)}
                            className={`flex-1 mx-1 py-2 px-3 rounded-lg border ${
                              name === label
                                ? 'bg-[#055c3a] border-[#055c3a]'
                                : errors.name
                                ? 'bg-white border-[#B3261E]'
                                : 'bg-white border-[#D1D5DB]'
                            }`}
                            activeOpacity={0.7}
                          >
                            <Text
                              className={`text-sm font-medium text-center ${
                                name === label ? 'text-white' : 'text-[#4B5563]'
                              }`}
                              style={{ fontFamily: 'Inter-Medium' }}
                            >
                              {label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {errors.name && (
                        <Text
                          className="text-xs text-[#B3261E] mt-1"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {errors.name}
                        </Text>
                      )}
                    </View>

                    {/* Custom label input when "Other" is selected */}
                    {name === 'Other' && (
                      <View className="mb-4">
                        <Input
                          label="Custom Label"
                          value={name}
                          onChangeText={(text) => {
                            setName(text);
                            if (errors.name) {
                              setErrors({ ...errors, name: undefined });
                            }
                          }}
                          placeholder="Enter custom label"
                          error={errors.name}
                        />
                      </View>
                    )}
                  </View>
                </ScrollView>

                {/* Save Button - Fixed at bottom */}
                <View className="px-6 pb-8 bg-white border-t border-[#E5E7EB]" style={{ paddingTop: 12 }}>
                  <Button
                    label={isSaving ? (isEditing ? 'Updating Address...' : 'Adding Address...') : (isEditing ? 'Update Address' : 'Add Address')}
                    onPress={handleSave}
                    isLoading={isSaving}
                    disabled={isSaving}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
    </Modal>
  );
}

