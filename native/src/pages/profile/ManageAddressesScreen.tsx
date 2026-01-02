import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addressService, type Address, type CreateAddressRequest, type UpdateAddressRequest } from '../../services';
import BackIcon from '../../components/icons/BackIcon';
import AddEditAddressBottomSheet from './components/AddEditAddressBottomSheet';
import AddressItem from './components/AddressItem';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

interface ManageAddressesScreenProps {
  onBack: () => void;
}

export default function ManageAddressesScreen({ onBack }: ManageAddressesScreenProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

  const loadAddresses = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load addresses. Please try again.';
      setError(errorMessage);
      if (!refresh) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddSheet(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddSheet(true);
  };

  const handleDeleteAddress = (addressId: number) => {
    setDeletingAddressId(addressId);
  };

  const confirmDelete = async () => {
    if (!deletingAddressId) return;

    try {
      await addressService.deleteAddress(deletingAddressId);
      setDeletingAddressId(null);
      Alert.alert('Success', 'Address deleted successfully!');
      loadAddresses();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete address. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSaveAddress = async (data: CreateAddressRequest | UpdateAddressRequest) => {
    try {
      if (editingAddress) {
        await addressService.updateAddress(data as UpdateAddressRequest);
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        await addressService.createAddress(data as CreateAddressRequest);
        Alert.alert('Success', 'Address added successfully!');
      }
      setShowAddSheet(false);
      setEditingAddress(null);
      loadAddresses();
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to ${editingAddress ? 'update' : 'add'} address. Please try again.`;
      Alert.alert('Error', errorMessage);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
        </View>
      );
    }

    if (error && addresses.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-4xl mb-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            ⚠️
          </Text>
          <Text
            className="text-base text-[#B3261E] mb-4 text-center"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => loadAddresses()}
            className="bg-[#055c3a] px-6 py-3 rounded-lg"
          >
            <Text
              className="text-white font-semibold"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (addresses.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-lg font-semibold text-[#4B5563] mb-2 text-center"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            No addresses found
          </Text>
          <Text
            className="text-sm text-[#6B7280] text-center"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Add your first address to get started
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadAddresses(true)}
            tintColor="#055c3a"
          />
        }
      >
        <View className="px-6 py-4">
          {addresses.map((address, index) => (
            <View key={address.id}>
              <AddressItem
                address={address}
                onEdit={() => handleEditAddress(address)}
                onDelete={() => handleDeleteAddress(address.id)}
                isLastAddress={addresses.length === 1}
              />
              {index < addresses.length - 1 && (
                <View className="h-px bg-[#E5E7EB] my-4" />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <TouchableOpacity
          onPress={onBack}
          className="mr-4 p-2 -ml-2"
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#111928" />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold text-[#111928] flex-1"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Manage Addresses
        </Text>
      </View>

      {/* Add Another Address Button */}
      <TouchableOpacity
        onPress={handleAddAddress}
        className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]"
        activeOpacity={0.7}
      >
        <Text
          className="text-base font-medium text-[#055c3a]"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          +
        </Text>
        <Text
          className="text-base font-medium text-[#055c3a] ml-2"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          Add another address
        </Text>
      </TouchableOpacity>

      {/* Content */}
      {renderContent()}

      {/* Add/Edit Address Bottom Sheet */}
      {showAddSheet && (
        <AddEditAddressBottomSheet
          address={editingAddress}
          onSave={handleSaveAddress}
          onClose={() => {
            setShowAddSheet(false);
            setEditingAddress(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingAddressId !== null && (
        <DeleteConfirmationModal
          onConfirm={confirmDelete}
          onCancel={() => setDeletingAddressId(null)}
        />
      )}
    </SafeAreaView>
  );
}

