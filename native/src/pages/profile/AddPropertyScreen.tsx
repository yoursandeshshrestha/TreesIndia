import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  propertyService,
  type Property,
  type Address,
  type CreateAddressRequest,
} from '../../services';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import BackIcon from '../../components/icons/BackIcon';
import AddressIcon from '../../components/icons/AddressIcon';
import AddEditAddressBottomSheet from './components/AddEditAddressBottomSheet';
import EditIcon from '../../components/icons/EditIcon';

interface AddPropertyScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
  propertyToEdit?: Property | null;
}

type Step = 'basic' | 'location' | 'profile' | 'photos' | 'pricing' | 'review';

interface FileInfo {
  uri: string;
  type: string;
  name: string;
}

export default function AddPropertyScreen({
  onBack,
  onSuccess,
  propertyToEdit,
}: AddPropertyScreenProps) {
  const isEditing = !!propertyToEdit;
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Details
  const [title, setTitle] = useState(propertyToEdit?.title || '');
  const [description, setDescription] = useState(propertyToEdit?.description || '');
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>(
    (propertyToEdit?.property_type as 'residential' | 'commercial') || 'residential'
  );
  const [listingType, setListingType] = useState<'sale' | 'rent'>(
    (propertyToEdit?.listing_type as 'sale' | 'rent') || 'sale'
  );

  // Step 2: Location Details - Initialize with existing property address if editing
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(() => {
    if (propertyToEdit && propertyToEdit.city && propertyToEdit.state) {
      return {
        id: Date.now(),
        name: 'Property Address',
        address: propertyToEdit.address || '',
        city: propertyToEdit.city,
        state: propertyToEdit.state,
        postal_code: propertyToEdit.pincode || '',
        postalCode: propertyToEdit.pincode || '',
        country: 'India',
        house_number: '',
        houseNumber: '',
        landmark: '',
        latitude: 0,
        longitude: 0,
        is_default: false,
        isDefault: false,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Address;
    }
    return null;
  });
  const [showAddressSheet, setShowAddressSheet] = useState(false);

  // Step 3: Property Profile (all optional)
  const [bedrooms, setBedrooms] = useState(propertyToEdit?.bedrooms?.toString() || '');
  const [bathrooms, setBathrooms] = useState(propertyToEdit?.bathrooms?.toString() || '');
  const [area, setArea] = useState(propertyToEdit?.area?.toString() || '');
  const [floorNumber, setFloorNumber] = useState(propertyToEdit?.floor_number?.toString() || '');
  const [age, setAge] = useState<string>(propertyToEdit?.age || '');
  const [furnishingStatus, setFurnishingStatus] = useState<string>(
    propertyToEdit?.furnishing_status || ''
  );

  // Step 4: Photos
  const [images, setImages] = useState<FileInfo[]>(
    propertyToEdit?.images?.map((img, idx) => ({
      uri: img,
      type: 'image/jpeg',
      name: `image_${idx}.jpg`,
    })) || []
  );

  // Step 5: Pricing
  const [salePrice, setSalePrice] = useState(propertyToEdit?.sale_price?.toString() || '');
  const [monthlyRent, setMonthlyRent] = useState(propertyToEdit?.monthly_rent?.toString() || '');
  const [priceNegotiable, setPriceNegotiable] = useState(propertyToEdit?.price_negotiable ?? true);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const ageOptions = [
    { value: 'under_1_year', label: 'Under 1 year' },
    { value: '1_2_years', label: '1-2 years' },
    { value: '2_5_years', label: '2-5 years' },
    { value: '5_10_years', label: '5-10 years' },
    { value: '10_plus_years', label: '10+ years' },
  ];

  const furnishingOptions = [
    { value: 'furnished', label: 'Furnished' },
    { value: 'semi_furnished', label: 'Semi-Furnished' },
    { value: 'unfurnished', label: 'Unfurnished' },
  ];

  const steps: { id: Step; title: string }[] = [
    { id: 'basic', title: 'Basic Details' },
    { id: 'location', title: 'Location Details' },
    { id: 'profile', title: 'Property Profile' },
    { id: 'photos', title: 'Photos' },
    { id: 'pricing', title: 'Pricing' },
    { id: 'review', title: 'Review & Submit' },
  ];

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleAddressSave = async (addressData: CreateAddressRequest) => {
    // Convert CreateAddressRequest to Address format
    const address: Address = {
      id: Date.now(),
      name: addressData.name,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      postalCode: addressData.postal_code,
      country: addressData.country || 'India',
      house_number: addressData.house_number,
      houseNumber: addressData.house_number,
      landmark: addressData.landmark,
      latitude: addressData.latitude || 0,
      longitude: addressData.longitude || 0,
      is_default: false,
      isDefault: false,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Address;
    setSelectedAddress(address);
    setShowAddressSheet(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `property_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
        }));
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basic':
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!propertyType) newErrors.propertyType = 'Property type is required';
        if (!listingType) newErrors.listingType = 'Listing type is required';
        break;

      case 'location':
        if (!selectedAddress) newErrors.location = 'Property address is required';
        break;

      case 'profile':
        // All fields are optional
        break;

      case 'photos':
        if (images.length < 2) newErrors.images = 'At least 2 images are required';
        break;

      case 'pricing':
        if (listingType === 'sale') {
          if (!salePrice.trim()) {
            newErrors.salePrice = 'Sale price is required';
          } else if (parseFloat(salePrice) <= 0) {
            newErrors.salePrice = 'Sale price must be greater than 0';
          }
        } else if (listingType === 'rent') {
          if (!monthlyRent.trim()) {
            newErrors.monthlyRent = 'Monthly rent is required';
          } else if (parseFloat(monthlyRent) <= 0) {
            newErrors.monthlyRent = 'Monthly rent must be greater than 0';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
      setErrors({});
    }
  };

  const handlePrevious = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('review')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Basic fields
      formData.append('title', title);
      formData.append('description', description);
      formData.append('property_type', propertyType);
      formData.append('listing_type', listingType);
      formData.append('price_negotiable', priceNegotiable.toString());

      // Address fields from selectedAddress
      if (selectedAddress) {
        formData.append('state', selectedAddress.state);
        formData.append('city', selectedAddress.city);
        formData.append('address', selectedAddress.address);
        if (selectedAddress.postal_code) {
          formData.append('pincode', selectedAddress.postal_code);
        }
      }
      if (bedrooms.trim()) formData.append('bedrooms', bedrooms);
      if (bathrooms.trim()) formData.append('bathrooms', bathrooms);
      if (area.trim()) formData.append('area', area);
      if (floorNumber.trim()) formData.append('floor_number', floorNumber);
      if (age) formData.append('age', age);
      if (furnishingStatus) formData.append('furnishing_status', furnishingStatus);

      if (listingType === 'sale' && salePrice.trim()) {
        formData.append('sale_price', salePrice);
      }
      if (listingType === 'rent' && monthlyRent.trim()) {
        formData.append('monthly_rent', monthlyRent);
      }

      // Add images
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `property_image_${index}.jpg`,
        } as any);
      });

      if (isEditing && propertyToEdit) {
        const propertyId = propertyToEdit.id || (propertyToEdit as any).ID;
        if (!propertyId) {
          Alert.alert('Error', 'Property ID is missing. Cannot update property.');
          return;
        }
        await propertyService.updateProperty(propertyId, formData);
        Alert.alert('Success', 'Property updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              } else {
                onBack();
              }
            },
          },
        ]);
      } else {
        await propertyService.createProperty(formData);
        Alert.alert(
          'Success',
          'Property created successfully! It will be reviewed before being published.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) {
                  onSuccess();
                } else {
                  onBack();
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || `Failed to ${isEditing ? 'update' : 'create'} property. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    const currentStepData = steps[currentIndex];

    return (
      <View className="border-b border-[#E5E7EB] bg-white px-6 py-4">
        {/* Progress bar */}
        <View className="mb-4 flex-row" style={{ gap: 4 }}>
          {steps.map((_, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <View
                key={index}
                className="flex-1"
                style={{
                  height: 4,
                  backgroundColor: isCompleted ? '#055c3a' : isActive ? '#055c3a' : '#E5E7EB',
                  borderRadius: 2,
                }}
              />
            );
          })}
        </View>

        {/* Step info */}
        <View>
          <Text className="mb-1 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Step {currentIndex + 1} of {steps.length}
          </Text>
          <Text className="font-bold text-sm text-[#111928]" style={{ fontFamily: 'Inter-Bold' }}>
            {currentStepData.title}
          </Text>
        </View>
      </View>
    );
  };

  const renderBasicDetails = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Basic Details
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Provide basic information about your property
      </Text>

      <View className="mb-4">
        <Input
          label="Property Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter property title"
          error={errors.title}
          required
          maxLength={100}
        />
      </View>

      <View className="mb-4">
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your property"
          error={errors.description}
          required
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </View>

      <View className="mb-4">
        <Text
          className="mb-2 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Property Type {errors.propertyType && <Text className="text-[#DC2626]">*</Text>}
        </Text>
        <View className="flex-row" style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => setPropertyType('residential')}
            className={`flex-1 items-center rounded-lg border px-3 py-2.5 ${
              propertyType === 'residential'
                ? 'border-[#055c3a] bg-[#F0FDF4]'
                : 'border-[#E5E7EB] bg-white'
            }`}
            activeOpacity={0.5}>
            <Text
              className={`text-sm ${
                propertyType === 'residential' ? 'text-[#055c3a]' : 'text-[#111928]'
              }`}
              style={{ fontFamily: 'Inter-Regular' }}>
              Residential
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPropertyType('commercial')}
            className={`flex-1 items-center rounded-lg border px-3 py-2.5 ${
              propertyType === 'commercial'
                ? 'border-[#055c3a] bg-[#F0FDF4]'
                : 'border-[#E5E7EB] bg-white'
            }`}
            activeOpacity={0.5}>
            <Text
              className={`text-sm ${
                propertyType === 'commercial' ? 'text-[#055c3a]' : 'text-[#111928]'
              }`}
              style={{ fontFamily: 'Inter-Regular' }}>
              Commercial
            </Text>
          </TouchableOpacity>
        </View>
        {errors.propertyType && (
          <Text className="mt-1 text-xs text-[#DC2626]">{errors.propertyType}</Text>
        )}
      </View>

      <View className="mb-4">
        <Text
          className="mb-2 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Listing Type {errors.listingType && <Text className="text-[#DC2626]">*</Text>}
        </Text>
        <View className="flex-row" style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              setListingType('sale');
              setSalePrice('');
              setMonthlyRent('');
            }}
            className={`flex-1 items-center rounded-lg border px-3 py-2.5 ${
              listingType === 'sale' ? 'border-[#055c3a] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-white'
            }`}
            activeOpacity={0.5}>
            <Text
              className={`text-sm ${listingType === 'sale' ? 'text-[#055c3a]' : 'text-[#111928]'}`}
              style={{ fontFamily: 'Inter-Regular' }}>
              For Sale
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setListingType('rent');
              setSalePrice('');
              setMonthlyRent('');
            }}
            className={`flex-1 items-center rounded-lg border px-3 py-2.5 ${
              listingType === 'rent' ? 'border-[#055c3a] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-white'
            }`}
            activeOpacity={0.5}>
            <Text
              className={`text-sm ${listingType === 'rent' ? 'text-[#055c3a]' : 'text-[#111928]'}`}
              style={{ fontFamily: 'Inter-Regular' }}>
              For Rent
            </Text>
          </TouchableOpacity>
        </View>
        {errors.listingType && (
          <Text className="mt-1 text-xs text-[#DC2626]">{errors.listingType}</Text>
        )}
      </View>
    </View>
  );

  const renderLocationDetails = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Location Details
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Select address for your property
      </Text>

      {selectedAddress ? (
        <View className="mb-4">
          <View className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <View className="mb-2 flex-row items-start justify-between">
              <View className="flex-1">
                <Text
                  className="mb-1 font-semibold text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  {selectedAddress.name}
                </Text>
                <Text className="mb-1 text-sm text-[#374151]">
                  {selectedAddress.house_number && `${selectedAddress.house_number}, `}
                  {selectedAddress.address}
                </Text>
                <Text className="text-sm text-[#374151]">
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                </Text>
                {selectedAddress.landmark && (
                  <Text className="mt-1 text-xs text-[#6B7280]">
                    Landmark: {selectedAddress.landmark}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowAddressSheet(true)}
                className="ml-2 p-2"
                activeOpacity={0.7}>
                <EditIcon size={20} color="#055c3a" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAddressSheet(true)}
          className="mb-4 flex-row items-center justify-center rounded-xl border-2 border-dashed border-[#D1D5DB] py-6"
          activeOpacity={0.7}>
          <AddressIcon size={24} color="#6B7280" />
          <Text
            className="ml-2 font-medium text-base text-[#6B7280]"
            style={{ fontFamily: 'Inter-Medium' }}>
            Add Property Address
          </Text>
        </TouchableOpacity>
      )}

      {errors.location && (
        <Text className="mb-4 mt-1 text-xs text-[#DC2626]">{errors.location}</Text>
      )}
    </View>
  );

  const renderPropertyProfile = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Property Profile
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Provide additional details about your property (all optional)
      </Text>

      <View className="mb-4">
        <Input
          label="Bedrooms"
          value={bedrooms}
          onChangeText={setBedrooms}
          placeholder="Enter number of bedrooms"
          keyboardType="number-pad"
        />
      </View>

      <View className="mb-4">
        <Input
          label="Bathrooms"
          value={bathrooms}
          onChangeText={setBathrooms}
          placeholder="Enter number of bathrooms"
          keyboardType="number-pad"
        />
      </View>

      <View className="mb-4">
        <Input
          label="Area (sq ft)"
          value={area}
          onChangeText={setArea}
          placeholder="Enter area in square feet"
          keyboardType="number-pad"
        />
      </View>

      <View className="mb-4">
        <Input
          label="Floor Number"
          value={floorNumber}
          onChangeText={setFloorNumber}
          placeholder="Enter floor number"
          keyboardType="number-pad"
        />
      </View>

      <View className="mb-4">
        <Text
          className="mb-2 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Age
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row" style={{ gap: 8 }}>
            {ageOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setAge(age === option.value ? '' : option.value)}
                className={`rounded-lg border px-4 py-2 ${
                  age === option.value
                    ? 'border-[#055c3a] bg-[#055c3a]'
                    : 'border-[#E5E7EB] bg-white'
                }`}
                activeOpacity={0.7}>
                <Text
                  className={`text-sm ${age === option.value ? 'text-white' : 'text-[#111928]'}`}
                  style={{ fontFamily: 'Inter-Medium' }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="mb-4">
        <Text
          className="mb-2 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Furnishing Status
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row" style={{ gap: 8 }}>
            {furnishingOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() =>
                  setFurnishingStatus(furnishingStatus === option.value ? '' : option.value)
                }
                className={`rounded-lg border px-4 py-2 ${
                  furnishingStatus === option.value
                    ? 'border-[#055c3a] bg-[#055c3a]'
                    : 'border-[#E5E7EB] bg-white'
                }`}
                activeOpacity={0.7}>
                <Text
                  className={`text-sm ${
                    furnishingStatus === option.value ? 'text-white' : 'text-[#111928]'
                  }`}
                  style={{ fontFamily: 'Inter-Medium' }}
                  numberOfLines={1}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderPhotos = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Photos
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Add photos of your property (minimum 2 required){' '}
        {errors.images && <Text className="text-[#DC2626]">*</Text>}
      </Text>

      <TouchableOpacity
        onPress={pickImage}
        className="mb-4 items-center rounded-lg border border-[#E5E7EB] p-4"
        activeOpacity={0.7}>
        <Text className="font-medium text-sm text-[#055c3a]" style={{ fontFamily: 'Inter-Medium' }}>
          + Add Photos
        </Text>
      </TouchableOpacity>

      {errors.images && <Text className="mb-4 text-xs text-[#DC2626]">{errors.images}</Text>}

      {images.length > 0 && (
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {images.map((image, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri: image.uri }}
                className="h-24 w-24 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-[#DC2626]"
                activeOpacity={0.7}>
                <Text className="text-xs text-white">×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPricing = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Pricing
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Set the price for your property
      </Text>

      {listingType === 'sale' ? (
        <View className="mb-4">
          <Input
            label="Sale Price (₹)"
            value={salePrice}
            onChangeText={setSalePrice}
            placeholder="Enter sale price"
            keyboardType="number-pad"
            error={errors.salePrice}
            required
          />
        </View>
      ) : (
        <View className="mb-4">
          <Input
            label="Monthly Rent (₹)"
            value={monthlyRent}
            onChangeText={setMonthlyRent}
            placeholder="Enter monthly rent"
            keyboardType="number-pad"
            error={errors.monthlyRent}
            required
          />
        </View>
      )}

      <View className="mb-4 flex-row items-center justify-between">
        <Text
          className="font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Price Negotiable
        </Text>
        <Switch
          value={priceNegotiable}
          onValueChange={setPriceNegotiable}
          trackColor={{ false: '#D1D5DB', true: '#055c3a' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );

  const renderReview = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Review Your Property
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Please review all information before submitting
      </Text>

      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-base text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Basic Details
        </Text>
        <Text className="mb-1 text-sm text-[#374151]">Title: {title}</Text>
        <Text className="mb-1 text-sm text-[#374151]">Type: {propertyType}</Text>
        <Text className="text-sm text-[#374151]">
          Listing: {listingType === 'sale' ? 'For Sale' : 'For Rent'}
        </Text>
      </View>

      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-base text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Location
        </Text>
        {selectedAddress ? (
          <>
            <Text className="mb-1 font-semibold text-sm text-[#374151]">
              {selectedAddress.name}
            </Text>
            <Text className="mb-1 text-sm text-[#374151]">
              {selectedAddress.house_number && `${selectedAddress.house_number}, `}
              {selectedAddress.address}
            </Text>
            <Text className="text-sm text-[#374151]">
              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
            </Text>
            {selectedAddress.landmark && (
              <Text className="mt-1 text-xs text-[#6B7280]">
                Landmark: {selectedAddress.landmark}
              </Text>
            )}
          </>
        ) : (
          <Text className="text-sm text-[#6B7280]">No address selected</Text>
        )}
      </View>

      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-base text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Pricing
        </Text>
        <Text className="mb-1 text-sm text-[#374151]">
          {listingType === 'sale' ? `Sale Price: ₹${salePrice}` : `Monthly Rent: ₹${monthlyRent}`}
        </Text>
        <Text className="text-sm text-[#374151]">Negotiable: {priceNegotiable ? 'Yes' : 'No'}</Text>
      </View>

      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-base text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Photos
        </Text>
        <Text className="text-sm text-[#374151]">
          {images.length} image(s) uploaded{' '}
          {images.length < 2 && <Text className="text-[#DC2626]">(minimum 2 required)</Text>}
        </Text>
      </View>
      <View className="pb-8" />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicDetails();
      case 'location':
        return renderLocationDetails();
      case 'profile':
        return renderPropertyProfile();
      case 'photos':
        return renderPhotos();
      case 'pricing':
        return renderPricing();
      case 'review':
        return renderReview();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Header */}
        <View className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
          <TouchableOpacity onPress={onBack} className="-ml-2 p-2" activeOpacity={0.7}>
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <Text
            className="ml-2 font-semibold text-xl text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            {isEditing ? 'Edit Property' : 'Add Property'}
          </Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView
          className="flex-1 bg-[#F9FAFB]"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View
          className={`border-t border-[#E5E7EB] bg-white px-6 pt-4 ${isKeyboardVisible ? 'pb-4' : 'pb-12'}`}>
          <View className="flex-row" style={{ gap: 12 }}>
            {currentStep !== 'basic' && (
              <View className="flex-1">
                <Button
                  label="Previous"
                  onPress={handlePrevious}
                  variant="outline"
                  disabled={isSubmitting}
                />
              </View>
            )}
            <View className="flex-1">
              {currentStep === 'review' ? (
                <Button
                  label={
                    isSubmitting
                      ? isEditing
                        ? 'Updating...'
                        : 'Submitting...'
                      : isEditing
                        ? 'Update Property'
                        : 'Submit Property'
                  }
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                />
              ) : (
                <Button label="Next" onPress={handleNext} disabled={isSubmitting} />
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Address Bottom Sheet */}
      {showAddressSheet && (
        <AddEditAddressBottomSheet
          address={selectedAddress}
          onSave={handleAddressSave}
          onClose={() => setShowAddressSheet(false)}
          visible={showAddressSheet}
          requireLabel={false}
          showOptionalFields={false}
        />
      )}
    </SafeAreaView>
  );
}
