import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vendorService, type Vendor } from '../../services/api/vendor.service';
import BackIcon from '../../components/icons/BackIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import VendorIcon from '../../components/icons/VendorIcon';
import VendorCard from './components/VendorCard';
import VendorDeleteConfirmationBottomSheet from './components/VendorDeleteConfirmationBottomSheet';
import VendorDetailBottomSheet from './components/VendorDetailBottomSheet';

interface MyVendorProfileScreenProps {
  onBack: () => void;
  onAddVendor?: (vendor?: Vendor) => void;
}

export default function MyVendorProfileScreen({ onBack, onAddVendor }: MyVendorProfileScreenProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<number | null>(null);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{ id: number; name: string } | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  const loadVendors = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await vendorService.getUserVendors();

      if (response.data && Array.isArray(response.data)) {
        setVendors(response.data);
      } else {
        setVendors([]);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load vendor profiles. Please try again.';
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
    loadVendors();
  }, [loadVendors]);

  const handleDeleteVendor = (vendorId: number, vendorName: string) => {
    setVendorToDelete({ id: vendorId, name: vendorName });
    setShowDeleteSheet(true);
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;

    try {
      setDeletingVendorId(vendorToDelete.id);
      await vendorService.deleteVendor(vendorToDelete.id);
      setShowDeleteSheet(false);
      setVendorToDelete(null);
      Alert.alert('Success', 'Vendor profile deleted successfully!');
      loadVendors();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete vendor profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setDeletingVendorId(null);
    }
  };

  const handleAddVendor = () => {
    if (onAddVendor) {
      onAddVendor();
    } else {
      Alert.alert('Coming Soon', 'Add vendor profile feature will be available soon.');
    }
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <VendorIcon size={64} color="#D1D5DB" />
      <Text
        className="text-lg font-semibold text-[#111928] mt-4 mb-2 text-center"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        No Vendor Profiles Yet
      </Text>
      <Text
        className="text-sm text-[#6B7280] text-center mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Click the + button to add your first vendor profile
      </Text>
      <TouchableOpacity
        onPress={handleAddVendor}
        className="bg-[#055c3a] rounded-lg px-6 py-3 flex-row items-center"
        activeOpacity={0.7}
      >
        <PlusIcon size={20} color="#FFFFFF" />
        <Text
          className="text-white font-semibold ml-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Add Vendor Profile
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text className="text-4xl mb-4">⚠️</Text>
      <Text
        className="text-lg font-semibold text-[#111928] mb-2 text-center"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Error Loading Vendor Profiles
      </Text>
      <Text
        className="text-sm text-[#6B7280] text-center mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        {error}
      </Text>
      <TouchableOpacity
        onPress={() => loadVendors()}
        className="bg-[#055c3a] rounded-lg px-6 py-3"
        activeOpacity={0.7}
      >
        <Text
          className="text-white font-semibold"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (isLoading && vendors.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text
            className="text-sm text-[#6B7280] mt-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading vendor profiles...
          </Text>
        </View>
      );
    }

    if (error && vendors.length === 0) {
      return renderErrorState();
    }

    if (vendors.length === 0) {
      return renderEmptyState();
    }

    return (
      <>
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onPress={() => {
              setSelectedVendor(vendor);
              setShowDetailSheet(true);
            }}
            onDelete={() => handleDeleteVendor(vendor.id, vendor.vendor_name)}
            isDeleting={deletingVendorId === vendor.id}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <TouchableOpacity onPress={onBack} className="p-2 -ml-2" activeOpacity={0.7}>
          <BackIcon size={24} color="#111928" />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold text-[#111928] ml-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          My Vendor Profile
        </Text>
      </View>

      {/* Add Vendor Button - Always visible */}
      <View className="px-6 py-4 border-b border-[#F3F4F6]">
        <TouchableOpacity
          onPress={handleAddVendor}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <PlusIcon size={20} color="#055c3a" />
          <Text
            className="text-[#055c3a] font-medium ml-4"
            style={{ fontFamily: 'Inter-Medium', fontSize: 16 }}
          >
            Add Vendor Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 bg-[#F9FAFB]"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadVendors(true)}
            tintColor="#055c3a"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {renderContent()}
      </ScrollView>

      {/* Delete Confirmation Bottom Sheet */}
      <VendorDeleteConfirmationBottomSheet
        visible={showDeleteSheet}
        onClose={() => {
          setShowDeleteSheet(false);
          setVendorToDelete(null);
        }}
        onConfirm={confirmDelete}
        vendorName={vendorToDelete?.name || ''}
        isDeleting={deletingVendorId !== null}
      />

      {/* Vendor Detail Bottom Sheet */}
      {selectedVendor && (
        <VendorDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => {
            setShowDetailSheet(false);
            setSelectedVendor(null);
          }}
          vendor={selectedVendor}
          onEdit={() => {
            setShowDetailSheet(false);
            setSelectedVendor(null);
            if (onAddVendor) {
              // Pass the vendor to edit
              onAddVendor(selectedVendor);
            }
          }}
          onDelete={() => {
            setShowDetailSheet(false);
            setSelectedVendor(null);
            handleDeleteVendor(selectedVendor.id, selectedVendor.vendor_name);
          }}
          isDeleting={deletingVendorId === selectedVendor.id}
        />
      )}
    </SafeAreaView>
  );
}
