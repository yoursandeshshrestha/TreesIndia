import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addressService, bookingService, type Address } from '../../../services';
import AddEditAddressBottomSheet from '../../profile/components/AddEditAddressBottomSheet';
import Button from '../../../components/ui/Button';
import AddressIcon from '../../../components/icons/AddressIcon';
import CheckmarkIcon from '../../../components/icons/CheckmarkIcon';
import { Service } from '../../../services/api/service.service';
import { bookingLogger } from '../../../utils/logger';

interface AddressSelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
  selectedAddressId?: number;
  service?: Service;
}

export default function AddressSelectionBottomSheet({
  visible,
  onClose,
  onSelectAddress,
  selectedAddressId,
  service,
}: AddressSelectionBottomSheetProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | undefined>(selectedAddressId);
  const [showAddAddressSheet, setShowAddAddressSheet] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [checkingAddressId, setCheckingAddressId] = useState<number | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%'], []);

  useEffect(() => {
    if (visible) {
      // Reset states when opening
      setIsClosing(false);
      setIsCheckingAvailability(false);
      setCheckingAddressId(null);
      setIsServiceAvailable(null);
      setShowAddAddressSheet(false);

      bookingLogger.debug('Address selection modal opened');
      fetchAddresses();

      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    }
  }, [visible]);

  useEffect(() => {
    setSelectedId(selectedAddressId);
  }, [selectedAddressId]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const fetchAddresses = async () => {
    bookingLogger.debug('Fetching user addresses');
    setIsLoading(true);
    try {
      const data = await addressService.getAddresses();
      bookingLogger.info('Addresses fetched successfully', {
        count: data.length,
      });
      setAddresses(data);
    } catch (error) {
      bookingLogger.error('Failed to fetch addresses', error);
      setAddresses([]);
      Alert.alert('Error', 'Failed to load your addresses. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    bottomSheetRef.current?.dismiss();
  };

  // Extract pincode from address (matching web implementation)
  const extractPincode = (address: Address): string | undefined => {
    bookingLogger.debug('Extracting pincode from address', {
      address_id: address.id,
      postal_code: address.postal_code,
      has_city: !!address.city,
      has_state: !!address.state,
    });

    // First try postal_code if valid (6-digit format)
    if (address.postal_code) {
      const cleanPostalCode = address.postal_code.trim();
      if (/^\d{6}$/.test(cleanPostalCode)) {
        bookingLogger.debug('Pincode extracted from postal_code field', {
          pincode: cleanPostalCode,
        });
        return cleanPostalCode;
      }
    }

    // Try to extract 6-digit number from address string
    const addressText = address.address || '';
    const pincodeMatches = addressText.match(/\b\d{6}\b/g);
    if (pincodeMatches && pincodeMatches.length > 0) {
      const extractedPincode = pincodeMatches[pincodeMatches.length - 1];
      bookingLogger.debug('Pincode extracted from address string', {
        pincode: extractedPincode,
      });
      return extractedPincode;
    }

    // Try to extract from city field
    const cityMatches = address.city?.match(/\b\d{6}\b/g);
    if (cityMatches && cityMatches.length > 0) {
      const extractedPincode = cityMatches[0];
      bookingLogger.debug('Pincode extracted from city field', {
        pincode: extractedPincode,
      });
      return extractedPincode;
    }

    // Try to extract from state field
    const stateMatches = address.state?.match(/\b\d{6}\b/g);
    if (stateMatches && stateMatches.length > 0) {
      const extractedPincode = stateMatches[0];
      bookingLogger.debug('Pincode extracted from state field', {
        pincode: extractedPincode,
      });
      return extractedPincode;
    }

    bookingLogger.warn('No pincode found in address', {
      address_id: address.id,
      postal_code: address.postal_code,
      address: addressText,
    });

    return undefined;
  };

  const handleSelectAddress = async (address: Address) => {
    bookingLogger.info('Address selection initiated', {
      address_id: address.id,
      address_name: address.name,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
    });

    setSelectedId(address.id);
    setIsServiceAvailable(null);
    setCheckingAddressId(address.id);

    // If no service provided, just select without checking
    if (!service) {
      bookingLogger.debug('No service provided, skipping availability check');
      setCheckingAddressId(null);
      return;
    }

    try {
      setIsCheckingAvailability(true);

      const pincode = extractPincode(address);
      const serviceId = service.id || service.ID || 0;

      bookingLogger.flow('Service availability check', 'start', {
        service_id: serviceId,
        service_name: service.name,
        address_id: address.id,
        city: address.city,
        state: address.state,
        pincode: pincode || 'none',
      });

      const isAvailable = await bookingService.checkServiceAvailability(
        serviceId,
        address.city,
        address.state,
        pincode
      );

      bookingLogger.flow('Service availability check', 'success', {
        is_available: isAvailable,
        service_id: serviceId,
        address_id: address.id,
      });

      setIsServiceAvailable(isAvailable);

      if (!isAvailable) {
        const locationInfo = pincode
          ? `${address.city}, ${address.state} (Pincode: ${pincode})`
          : `${address.city}, ${address.state}`;

        bookingLogger.warn('Service not available at selected address', {
          service_id: serviceId,
          address_id: address.id,
          location_info: locationInfo,
        });

        Alert.alert(
          'Service Not Available',
          `This service is not available in your selected location (${locationInfo}).\n\nPlease select another address or contact support for availability in your area.`,
          [{ text: 'OK' }]
        );
        setSelectedId(undefined);
      } else {
        bookingLogger.info('Service available at selected address', {
          service_id: serviceId,
          address_id: address.id,
        });
      }
    } catch (error) {
      bookingLogger.error('Failed to check service availability', error, {
        service_id: service.id || service.ID,
        address_id: address.id,
      });

      setIsServiceAvailable(false);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to check service availability. Please try again.';

      Alert.alert(
        'Error',
        `Unable to verify service availability: ${errorMessage}\n\nPlease try again or contact support.`,
        [{ text: 'OK' }]
      );
      setSelectedId(undefined);
    } finally {
      setIsCheckingAvailability(false);
      setCheckingAddressId(null);
    }
  };

  const handleConfirm = () => {
    const selected = addresses.find((addr) => addr.id === selectedId);
    if (selected) {
      bookingLogger.info('Address confirmed for booking', {
        address_id: selected.id,
        address_name: selected.name,
        city: selected.city,
        state: selected.state,
        postal_code: selected.postal_code,
        is_service_available: isServiceAvailable,
      });
      onSelectAddress(selected);
      handleClose();
    } else {
      bookingLogger.warn('Attempted to confirm without selecting an address');
    }
  };

  const handleAddAddress = async (data: {
    name: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
    house_number?: string;
    landmark?: string;
    is_default?: boolean;
  }) => {
    bookingLogger.info('Adding new address', {
      name: data.name,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
    });

    try {
      await addressService.createAddress(data);
      bookingLogger.info('Address created successfully, refreshing list');
      await fetchAddresses();
      setShowAddAddressSheet(false);
      bookingLogger.debug('Add address modal closed');
    } catch (error) {
      bookingLogger.error('Failed to create address', error);
      // Close the modal even on error so user isn't stuck
      setShowAddAddressSheet(false);

      // Show error to user
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create address. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!visible) return null;

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <Text
              className="font-semibold text-xl text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Select Address
            </Text>
          </View>

          {/* Content */}
          <BottomSheetScrollView className="px-6 py-4" style={{ maxHeight: 400 }}>
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#055c3a" />
              </View>
            ) : addresses.length === 0 ? (
              <View className="items-center py-8">
                <AddressIcon size={48} color="#9CA3AF" />
                <Text className="mt-4 text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                  No addresses found
                </Text>
                <Text
                  className="mt-2 text-center text-[#9CA3AF]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Add your first address to continue with booking
                </Text>
              </View>
            ) : (
              addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  className={`mb-3 rounded-xl border p-4 ${
                    selectedId === address.id
                      ? 'border-[#055c3a] bg-[#F0FDF4]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  onPress={() => handleSelectAddress(address)}
                  disabled={isCheckingAvailability}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <AddressIcon
                          size={16}
                          color={selectedId === address.id ? '#055c3a' : '#6B7280'}
                        />
                        <Text
                          className={`ml-2 font-semibold ${
                            selectedId === address.id ? 'text-[#055c3a]' : 'text-[#111928]'
                          }`}
                          style={{ fontFamily: 'Inter-SemiBold' }}>
                          {address.name}
                        </Text>
                      </View>
                      <Text className="mt-2 text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                        {address.house_number ? `${address.house_number}, ` : ''}
                        {address.address}
                      </Text>
                      <Text className="text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                        {address.city}, {address.state} - {address.postal_code}
                      </Text>
                      {address.landmark && (
                        <Text
                          className="mt-1 text-sm text-[#9CA3AF]"
                          style={{ fontFamily: 'Inter-Regular' }}>
                          Landmark: {address.landmark}
                        </Text>
                      )}
                      {checkingAddressId === address.id && isCheckingAvailability && (
                        <Text
                          className="mt-2 text-xs text-[#055c3a]"
                          style={{ fontFamily: 'Inter-Medium' }}>
                          Checking availability...
                        </Text>
                      )}
                    </View>
                    {checkingAddressId === address.id && isCheckingAvailability ? (
                      <View className="ml-3">
                        <ActivityIndicator size="small" color="#055c3a" />
                      </View>
                    ) : (
                      selectedId === address.id && (
                        <View className="ml-3">
                          <CheckmarkIcon size={24} color="#055c3a" />
                        </View>
                      )
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </BottomSheetScrollView>

          {/* Footer */}
          <SafeAreaView edges={['bottom']} className="border-t border-[#E5E7EB] bg-white">
            <View className="gap-3 px-6 pb-4 pt-4">
              <TouchableOpacity
                className="items-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"
                onPress={() => {
                  bookingLogger.info('Opening add address modal');
                  setShowAddAddressSheet(true);
                }}>
                <Text
                  className="font-semibold text-[#055c3a]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  + Add New Address
                </Text>
              </TouchableOpacity>
              <Button
                label="Confirm"
                onPress={handleConfirm}
                disabled={!selectedId || isLoading || isCheckingAvailability}
                isLoading={isCheckingAvailability}
              />
            </View>
          </SafeAreaView>
        </View>
      </BottomSheetModal>

      {/* Add Address Bottom Sheet */}
      <AddEditAddressBottomSheet
        visible={showAddAddressSheet}
        address={null}
        onSave={handleAddAddress}
        onClose={() => {
          bookingLogger.info('Closing add address modal without saving');
          setShowAddAddressSheet(false);
        }}
        requireLabel={true}
      />
    </>
  );
}
