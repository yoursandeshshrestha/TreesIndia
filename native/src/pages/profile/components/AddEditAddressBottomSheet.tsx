import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  Easing,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Address, type CreateAddressRequest, type UpdateAddressRequest } from '../../../services';
import Button from '../../../components/ui/Button';
import Input from '../../../components/common/Input';
import MapLocationPicker from '../../../components/MapLocationPicker';
import CancelIcon from '../../../components/icons/CancelIcon';

interface AddEditAddressBottomSheetProps {
  address: Address | null;
  onSave: (data: CreateAddressRequest | UpdateAddressRequest) => Promise<void>;
  onClose: () => void;
  visible?: boolean;
  requiredFields?: {
    houseNumber?: boolean;
    landmark?: boolean;
  };
  requireLabel?: boolean; // Whether to show and require address label (Home/Work/Other)
  showOptionalFields?: boolean; // Whether to show optional fields (house number, landmark)
}

const ADDRESS_LABELS = ['Home', 'Work', 'Other'];

export default function AddEditAddressBottomSheet({
  address,
  onSave,
  onClose,
  visible = true,
  requiredFields = {},
  requireLabel = false,
  showOptionalFields = true,
}: AddEditAddressBottomSheetProps) {
  const isEditing = !!address;
  const [name, setName] = useState(address?.name || '');
  const [addressText, setAddressText] = useState(address?.address || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [pincode, setPincode] = useState(address?.postalCode || address?.postal_code || '');
  const [houseNumber, setHouseNumber] = useState(address?.houseNumber || address?.house_number || '');
  const [landmark, setLandmark] = useState(address?.landmark || '');
  const [fetchedLatitude, setFetchedLatitude] = useState<number | undefined>(address?.latitude);
  const [fetchedLongitude, setFetchedLongitude] = useState<number | undefined>(address?.longitude);
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const houseNumberRef = useRef<View>(null);
  const addressRef = useRef<View>(null);
  const cityRef = useRef<View>(null);
  const stateRef = useRef<View>(null);

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    houseNumber?: string;
    landmark?: string;
  }>({});

  useEffect(() => {
    if (visible) {
      // Reset states when opening
      setIsClosing(false);
      setIsSaving(false);

      // Reset animated values to start position
      overlayOpacity.setValue(0);
      translateY.setValue(500);

      // Start animations
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Calculate max height based on keyboard state
  const maxSheetHeight = '70%';

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    onClose();
  };

  const handleMapLocationSelected = (locationData: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
    formatted_address: string;
  }) => {
    // Set coordinates
    setFetchedLatitude(locationData.latitude);
    setFetchedLongitude(locationData.longitude);

    // Populate form fields
    if (locationData.address) {
      setAddressText(locationData.address);
    }
    if (locationData.city) {
      setCity(locationData.city);
    }
    if (locationData.state) {
      setState(locationData.state);
    }
    if (locationData.postcode) {
      setPincode(locationData.postcode);
    }

    // Clear any existing errors
    setErrors({});
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
    let firstErrorRef: React.RefObject<View | null> | null = null;

    // Only validate label if it's required
    if (requireLabel && !name.trim()) {
      newErrors.name = 'Address label is required';
    }

    // Validate house number if required
    if (requiredFields.houseNumber && !houseNumber.trim()) {
      newErrors.houseNumber = 'House/Flat number is required';
      if (!firstErrorRef) firstErrorRef = houseNumberRef;
    }

    if (!addressText.trim()) {
      newErrors.address = 'Street address is required';
      if (!firstErrorRef) firstErrorRef = addressRef;
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
      if (!firstErrorRef) firstErrorRef = cityRef;
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      if (!firstErrorRef) firstErrorRef = cityRef;
    }

    if (!state.trim()) {
      newErrors.state = 'State is required';
      if (!firstErrorRef) firstErrorRef = stateRef;
    }

    // Validate landmark if required
    if (requiredFields.landmark && !landmark.trim()) {
      newErrors.landmark = 'Landmark is required';
    }

    setErrors(newErrors);

    // Scroll to first error field
    if (firstErrorRef && firstErrorRef.current) {
      setTimeout(() => {
        firstErrorRef.current?.measureLayout(
          scrollViewRef.current as any,
          (_x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
          },
          () => {}
        );
      }, 100);
    }

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
        name: name.trim() || 'Address', // Default to 'Address' if no label provided
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
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-1">
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: overlayOpacity,
            }}
          >
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={handleClose}
            />
          </Animated.View>

          {/* Floating Close Button - At top of bottom sheet */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: '70%',
              right: 16,
              transform: [{ translateY }],
              zIndex: 30,
            }}
          >
            <TouchableOpacity
              onPress={handleClose}
              className="w-12 h-12 bg-white rounded-full items-center justify-center"
              style={{
                marginTop: -56,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: maxSheetHeight,
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              transform: [{ translateY }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 20,
              overflow: 'hidden',
            }}
          >
            <View className="flex-1 bg-white">
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Map Section */}
                <View style={{ height: 380, overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                  <MapLocationPicker
                    initialLocation={fetchedLatitude && fetchedLongitude ? {
                      latitude: fetchedLatitude,
                      longitude: fetchedLongitude,
                    } : undefined}
                    onLocationSelected={handleMapLocationSelected}
                    embedded={true}
                  />
                </View>

                {/* Form Section */}
                <View className="px-5">
                    {/* Address Label Section - Only show if requireLabel is true */}
                    {requireLabel && (
                      <>
                        <View className="mb-5">
                          <Text className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter-SemiBold' }}>
                            Save as
                          </Text>
                          <View className="flex-row gap-3">
                            {ADDRESS_LABELS.map((label) => (
                              <TouchableOpacity
                                key={label}
                                onPress={() => handleLabelSelect(label)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                                  name === label
                                    ? 'bg-[#00a871] border-[#00a871]'
                                    : 'bg-white border-[#E5E7EB]'
                                }`}
                                activeOpacity={0.7}
                                style={{
                                  shadowColor: name === label ? '#00a871' : 'transparent',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.15,
                                  shadowRadius: 4,
                                  elevation: name === label ? 3 : 0,
                                }}
                              >
                                <Text
                                  className={`text-sm font-semibold text-center ${
                                    name === label ? 'text-white' : 'text-[#374151]'
                                  }`}
                                  style={{ fontFamily: 'Inter-SemiBold' }}
                                >
                                  {label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {errors.name && (
                            <Text className="text-xs text-[#EF4444] mt-2" style={{ fontFamily: 'Inter-Medium' }}>
                              {errors.name}
                            </Text>
                          )}
                        </View>

                        {/* Custom label input when "Other" is selected */}
                        {name === 'Other' && (
                          <View className="mb-5">
                            <Input
                              label="Custom Label"
                              value={name}
                              onChangeText={(text) => {
                                setName(text);
                                if (errors.name) {
                                  setErrors({ ...errors, name: undefined });
                                }
                              }}
                              placeholder="e.g., Office, Friend's Place"
                              error={errors.name}
                            />
                          </View>
                        )}
                      </>
                    )}

                    {/* Address Details Section */}
                    <View className="mb-5">
                      <Text className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter-SemiBold' }}>
                        Address Details
                      </Text>

                      {/* House/Flat Number and Landmark - Only show if showOptionalFields is true */}
                      {showOptionalFields && (
                        <View className="flex-row mb-4 gap-3">
                          <View className="flex-1" ref={houseNumberRef}>
                            <Input
                              label={requiredFields.houseNumber ? "House/Flat No." : "House/Flat No. (Optional)"}
                              value={houseNumber}
                              onChangeText={(text) => {
                                setHouseNumber(text);
                                if (errors.houseNumber) {
                                  setErrors({ ...errors, houseNumber: undefined });
                                }
                              }}
                              placeholder="e.g., 123"
                              error={errors.houseNumber}
                              required={requiredFields.houseNumber}
                            />
                          </View>
                          <View className="flex-1">
                            <Input
                              label={requiredFields.landmark ? "Landmark" : "Landmark (Optional)"}
                              value={landmark}
                              onChangeText={(text) => {
                                setLandmark(text);
                                if (errors.landmark) {
                                  setErrors({ ...errors, landmark: undefined });
                                }
                              }}
                              placeholder="Optional"
                              error={errors.landmark}
                              required={requiredFields.landmark}
                            />
                          </View>
                        </View>
                      )}

                      {/* Street Address */}
                      <View className="mb-4" ref={addressRef}>
                        <Input
                          label="Street Address"
                          value={addressText}
                          onChangeText={(text) => {
                            setAddressText(text);
                            if (errors.address) {
                              setErrors({ ...errors, address: undefined });
                            }
                          }}
                          placeholder="Building name, street name, area"
                          error={errors.address}
                          required
                          multiline
                          numberOfLines={2}
                        />
                      </View>

                      {/* City and Pincode */}
                      <View className="flex-row mb-4 gap-3">
                        <View className="flex-[1.5]" ref={cityRef}>
                          <Input
                            label="City"
                            value={city}
                            onChangeText={(text) => {
                              setCity(text);
                              if (errors.city) {
                                setErrors({ ...errors, city: undefined });
                              }
                            }}
                            placeholder="City name"
                            error={errors.city}
                            required
                          />
                        </View>
                        <View className="flex-1">
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
                            placeholder="000000"
                            keyboardType="number-pad"
                            error={errors.pincode}
                            required
                            maxLength={6}
                          />
                        </View>
                      </View>

                      {/* State */}
                      <View className="mb-4" ref={stateRef}>
                        <Input
                          label="State"
                          value={state}
                          onChangeText={(text) => {
                            setState(text);
                            if (errors.state) {
                              setErrors({ ...errors, state: undefined });
                            }
                          }}
                          placeholder="State name"
                          error={errors.state}
                          required
                        />
                      </View>
                    </View>
                  </View>
              </ScrollView>

              {/* Save Button - Sticky at bottom */}
              <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'white' }}>
                <View
                  className={`bg-white pt-4 ${keyboardHeight > 0 ? 'pb-4' : 'pb-10'}`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <View className="px-5">
                    <Button
                      label={isSaving ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Address' : 'Save Address')}
                      onPress={handleSave}
                      isLoading={isSaving}
                      disabled={isSaving}
                    />
                  </View>
                </View>
              </SafeAreaView>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

