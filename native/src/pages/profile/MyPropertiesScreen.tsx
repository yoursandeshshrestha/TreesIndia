import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { propertyService, type Property } from '../../services';
import BackIcon from '../../components/icons/BackIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import PropertyIcon from '../../components/icons/PropertyIcon';
import PropertyCard from './components/PropertyCard';
import PropertyDeleteConfirmationBottomSheet from './components/PropertyDeleteConfirmationBottomSheet';
import PropertyDetailBottomSheet from './components/PropertyDetailBottomSheet';

interface MyPropertiesScreenProps {
  onBack: () => void;
  onAddProperty?: (property?: Property) => void;
}

export default function MyPropertiesScreen({ onBack, onAddProperty }: MyPropertiesScreenProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(null);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: number; title: string } | null>(
    null
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  const loadProperties = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await propertyService.getUserProperties();

      if (response.data && Array.isArray(response.data)) {
        setProperties(response.data);
      } else {
        setProperties([]);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load properties. Please try again.';
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
    loadProperties();
  }, [loadProperties]);

  const handleDeleteProperty = (propertyId: number, propertyTitle: string) => {
    setPropertyToDelete({ id: propertyId, title: propertyTitle });
    setShowDeleteSheet(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      setDeletingPropertyId(propertyToDelete.id);
      await propertyService.deleteProperty(propertyToDelete.id);
      setShowDeleteSheet(false);
      setPropertyToDelete(null);
      Alert.alert('Success', 'Property deleted successfully!');
      loadProperties();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete property. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setDeletingPropertyId(null);
    }
  };

  const handleAddProperty = () => {
    if (onAddProperty) {
      onAddProperty();
    } else {
      Alert.alert('Coming Soon', 'Add property feature will be available soon.');
    }
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <PropertyIcon size={64} color="#D1D5DB" />
      <Text
        className="mb-2 mt-4 text-center font-semibold text-lg text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        No Properties Yet
      </Text>
      <Text
        className="mb-6 text-center text-sm text-[#6B7280]"
        style={{ fontFamily: 'Inter-Regular' }}>
        Click the + button to add your first property
      </Text>
      <TouchableOpacity
        onPress={handleAddProperty}
        className="flex-row items-center rounded-lg bg-[#055c3a] px-6 py-3"
        activeOpacity={0.7}>
        <PlusIcon size={20} color="#FFFFFF" />
        <Text className="ml-2 font-semibold text-white" style={{ fontFamily: 'Inter-SemiBold' }}>
          Add Property
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text className="mb-4 text-4xl">⚠️</Text>
      <Text
        className="mb-2 text-center font-semibold text-lg text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Error Loading Properties
      </Text>
      <Text
        className="mb-6 text-center text-sm text-[#6B7280]"
        style={{ fontFamily: 'Inter-Regular' }}>
        {error}
      </Text>
      <TouchableOpacity
        onPress={() => loadProperties()}
        className="rounded-lg bg-[#055c3a] px-6 py-3"
        activeOpacity={0.7}>
        <Text className="font-semibold text-white" style={{ fontFamily: 'Inter-SemiBold' }}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (isLoading && properties.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text className="mt-4 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Loading properties...
          </Text>
        </View>
      );
    }

    if (error && properties.length === 0) {
      return renderErrorState();
    }

    if (properties.length === 0) {
      return renderEmptyState();
    }

    return (
      <>
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onPress={() => {
              setSelectedProperty(property);
              setShowDetailSheet(true);
            }}
            onDelete={() => handleDeleteProperty(property.id, property.title)}
            isDeleting={deletingPropertyId === property.id}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
        <TouchableOpacity onPress={onBack} className="-ml-2 p-2" activeOpacity={0.7}>
          <BackIcon size={24} color="#111928" />
        </TouchableOpacity>
        <Text
          className="ml-2 font-semibold text-xl text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          My Properties
        </Text>
      </View>

      {/* Add Property Button - Always visible */}
      <View className="border-b border-[#F3F4F6] px-6 py-4">
        <TouchableOpacity
          onPress={handleAddProperty}
          className="flex-row items-center"
          activeOpacity={0.7}>
          <PlusIcon size={20} color="#055c3a" />
          <Text
            className="ml-4 font-medium text-[#055c3a]"
            style={{ fontFamily: 'Inter-Medium', fontSize: 16 }}>
            Add Property
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 bg-[#F9FAFB]"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadProperties(true)}
            tintColor="#055c3a"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}>
        {renderContent()}
      </ScrollView>

      {/* Delete Confirmation Bottom Sheet */}
      <PropertyDeleteConfirmationBottomSheet
        visible={showDeleteSheet}
        onClose={() => {
          setShowDeleteSheet(false);
          setPropertyToDelete(null);
        }}
        onConfirm={confirmDelete}
        propertyTitle={propertyToDelete?.title || ''}
        isDeleting={deletingPropertyId !== null}
      />

      {/* Property Detail Bottom Sheet */}
      {selectedProperty && (
        <PropertyDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => {
            setShowDetailSheet(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          onEdit={() => {
            setShowDetailSheet(false);
            setSelectedProperty(null);
            if (onAddProperty) {
              // Pass the property to edit
              onAddProperty(selectedProperty);
            }
          }}
          onDelete={() => {
            setShowDetailSheet(false);
            setSelectedProperty(null);
            const propertyId = selectedProperty.id || (selectedProperty as any).ID;
            handleDeleteProperty(propertyId, selectedProperty.title);
          }}
          isDeleting={deletingPropertyId === (selectedProperty.id || (selectedProperty as any).ID)}
        />
      )}
    </SafeAreaView>
  );
}
