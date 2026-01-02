import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { propertyService, type Property } from '../../services';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import BackIcon from '../../components/icons/BackIcon';
import AddressIcon from '../../components/icons/AddressIcon';

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

export default function AddPropertyScreen({ onBack, onSuccess, propertyToEdit }: AddPropertyScreenProps) {
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

  // Step 2: Location Details
  const [state, setState] = useState(propertyToEdit?.state || '');
  const [city, setCity] = useState(propertyToEdit?.city || '');
  const [address, setAddress] = useState(propertyToEdit?.address || '');
  const [pincode, setPincode] = useState(propertyToEdit?.pincode || '');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Step 3: Property Profile (all optional)
  const [bedrooms, setBedrooms] = useState(propertyToEdit?.bedrooms?.toString() || '');
  const [bathrooms, setBathrooms] = useState(propertyToEdit?.bathrooms?.toString() || '');
  const [area, setArea] = useState(propertyToEdit?.area?.toString() || '');
  const [floorNumber, setFloorNumber] = useState(propertyToEdit?.floor_number?.toString() || '');
  const [age, setAge] = useState<string>(propertyToEdit?.age || '');
  const [furnishingStatus, setFurnishingStatus] = useState<string>(propertyToEdit?.furnishing_status || '');

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

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
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

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const addressData = geocode[0];
        
        if (addressData.city) setCity(addressData.city);
        if (addressData.region) setState(addressData.region);
        if (addressData.postalCode) setPincode(addressData.postalCode);
        
        const streetParts: string[] = [];
        if (addressData.streetNumber) streetParts.push(addressData.streetNumber);
        if (addressData.street) streetParts.push(addressData.street);
        if (addressData.district) streetParts.push(addressData.district);
        if (streetParts.length > 0) {
          setAddress(streetParts.join(', '));
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get location.');
    } finally {
      setIsLoadingLocation(false);
    }
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
        if (!state.trim()) newErrors.state = 'State is required';
        if (!city.trim()) newErrors.city = 'City is required';
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
      formData.append('state', state);
      formData.append('city', city);
      formData.append('price_negotiable', priceNegotiable.toString());

      if (address.trim()) formData.append('address', address);
      if (pincode.trim()) formData.append('pincode', pincode);
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
        Alert.alert(
          'Success',
          'Property updated successfully!',
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
      Alert.alert('Error', error?.message || `Failed to ${isEditing ? 'update' : 'create'} property. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    const currentStepData = steps[currentIndex];
    
    return (
      <View className="px-6 py-4 bg-white border-b border-[#E5E7EB]">
        {/* Progress bar */}
        <View className="flex-row mb-4" style={{ gap: 4 }}>
          {steps.map((_, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            
            return (
              <View
                key={index}
                className="flex-1"
                style={{
                  height: 4,
                  backgroundColor:
                    isCompleted
                      ? '#055c3a'
                      : isActive
                      ? '#055c3a'
                      : '#E5E7EB',
                  borderRadius: 2,
                }}
              />
            );
          })}
        </View>

        {/* Step info */}
        <View>
          <Text
            className="text-xs text-[#6B7280] mb-1"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Step {currentIndex + 1} of {steps.length}
          </Text>
          <Text
            className="text-sm font-bold text-[#111928]"
            style={{ fontFamily: 'Inter-Bold' }}
          >
            {currentStepData.title}
          </Text>
        </View>
      </View>
    );
  };

  const renderBasicDetails = () => (
    <View className="px-6 pt-6">
      <Text
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Basic Details
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
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
          className="text-sm font-semibold text-[#111928] mb-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Property Type {errors.propertyType && <Text className="text-[#DC2626]">*</Text>}
        </Text>
        <View className="flex-row" style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => setPropertyType('residential')}
            className={`flex-1 border rounded-lg py-2.5 px-3 items-center ${
              propertyType === 'residential'
                ? 'border-[#055c3a] bg-[#F0FDF4]'
                : 'border-[#E5E7EB] bg-white'
            }`}
            activeOpacity={0.5}
          >
            <Text
              className={`text-sm ${
                propertyType === 'residential' ? 'text-[#055c3a]' : 'text-[#111928]'
              }`}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Residential
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPropertyType('commercial')}
            className={`flex-1 border rounded-lg py-2.5 px-3 items-center ${
              propertyType === 'commercial'
                ? 'border-[#055c3a] bg-[#F0FDF4]'
                : 'border-[#E5E7EB] bg-white'
            }`}
            activeOpacity={0.5}
          >
            <Text
              className={`text-sm ${
                propertyType === 'commercial' ? 'text-[#055c3a]' : 'text-[#111928]'
              }`}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Commercial
            </Text>
          </TouchableOpacity>
        </View>
        {errors.propertyType && (
          <Text className="text-xs text-[#DC2626] mt-1">{errors.propertyType}</Text>
        )}
      </View>

      <View className="mb-4">
        <Text
          className="text-sm font-semibold text-[#111928] mb-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Listing Type {errors.listingType && <Text className="text-[#DC2626]">*</Text>}
        </Text>
        <View className="flex-row" style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              setListingType('sale');
              setSalePrice('');
              setMonthlyRent('');
            }}
            className={`flex-1 border rounded-lg py-2.5 px-3 items-center ${
              listingType === 'sale'
                ? 'border-[#055c3a] bg-[#F0FDF4]'
                : 'border-[#E5E7EB] bg-white'
            }`}
            activeOpacity={0.5}
          >
            <Text
              className={`text-sm ${
                listingType === 'sale' ? 'text-[#055c3a]' : 'text-[#111928]'
              }`}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              For Sale
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setListingType('rent');
              setSalePrice('');
              setMonthlyRent('');
            }}
            className={`flex-1 border rounded-lg py-2.5 px-3 items-center ${
              listingType === 'rent'
                ? 'border-[#055c3a] bg-[#F0FDF4]'
                : 'border-[#E5E7EB] bg-white'
            }`}
            activeOpacity={0.5}
          >
            <Text
              className={`text-sm ${
                listingType === 'rent' ? 'text-[#055c3a]' : 'text-[#111928]'
              }`}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              For Rent
            </Text>
          </TouchableOpacity>
        </View>
        {errors.listingType && (
          <Text className="text-xs text-[#DC2626] mt-1">{errors.listingType}</Text>
        )}
      </View>
    </View>
  );

  const renderLocationDetails = () => (
    <View className="px-6 pt-6">
      <Text
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Location Details
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Provide the location of your property
      </Text>

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
              Getting location...
            </Text>
          </>
        ) : (
          <>
            <AddressIcon size={20} color="#055c3a" />
            <Text
              className="text-sm font-medium text-[#055c3a] ml-2"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              Use Current Location
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View className="mb-4">
        <Input
          label="State"
          value={state}
          onChangeText={setState}
          placeholder="Enter state"
          error={errors.state}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Enter city"
          error={errors.city}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Address (Optional)"
          value={address}
          onChangeText={setAddress}
          placeholder="Enter full address"
          multiline
          numberOfLines={2}
        />
      </View>

      <View className="mb-4">
        <Input
          label="Pincode (Optional)"
          value={pincode}
          onChangeText={setPincode}
          placeholder="Enter pincode"
          keyboardType="number-pad"
        />
      </View>
    </View>
  );

  const renderPropertyProfile = () => (
    <View className="px-6 pt-6">
      <Text
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Property Profile
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
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
          className="text-sm font-semibold text-[#111928] mb-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Age
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row" style={{ gap: 8 }}>
            {ageOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setAge(age === option.value ? '' : option.value)}
                className={`border rounded-lg px-4 py-2 ${
                  age === option.value
                    ? 'bg-[#055c3a] border-[#055c3a]'
                    : 'bg-white border-[#E5E7EB]'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm ${
                    age === option.value ? 'text-white' : 'text-[#111928]'
                  }`}
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="mb-4">
        <Text
          className="text-sm font-semibold text-[#111928] mb-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Furnishing Status
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row" style={{ gap: 8 }}>
            {furnishingOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setFurnishingStatus(furnishingStatus === option.value ? '' : option.value)}
                className={`border rounded-lg px-4 py-2 ${
                  furnishingStatus === option.value
                    ? 'bg-[#055c3a] border-[#055c3a]'
                    : 'bg-white border-[#E5E7EB]'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm ${
                    furnishingStatus === option.value ? 'text-white' : 'text-[#111928]'
                  }`}
                  style={{ fontFamily: 'Inter-Medium' }}
                  numberOfLines={1}
                >
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
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Photos
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Add photos of your property (minimum 2 required) {errors.images && <Text className="text-[#DC2626]">*</Text>}
      </Text>

      <TouchableOpacity
        onPress={pickImage}
        className="border border-[#E5E7EB] rounded-lg p-4 items-center mb-4"
        activeOpacity={0.7}
      >
        <Text
          className="text-sm text-[#055c3a] font-medium"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          + Add Photos
        </Text>
      </TouchableOpacity>

      {errors.images && (
        <Text className="text-xs text-[#DC2626] mb-4">{errors.images}</Text>
      )}

      {images.length > 0 && (
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {images.map((image, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri: image.uri }}
                className="w-24 h-24 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-[#DC2626] rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-white text-xs">×</Text>
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
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Pricing
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
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

      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="text-sm font-semibold text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
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
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Review Your Property
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Please review all information before submitting
      </Text>

      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text
          className="text-base font-semibold text-[#111928] mb-3"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Basic Details
        </Text>
        <Text className="text-sm text-[#374151] mb-1">Title: {title}</Text>
        <Text className="text-sm text-[#374151] mb-1">Type: {propertyType}</Text>
        <Text className="text-sm text-[#374151]">Listing: {listingType === 'sale' ? 'For Sale' : 'For Rent'}</Text>
      </View>

      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text
          className="text-base font-semibold text-[#111928] mb-3"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Location
        </Text>
        <Text className="text-sm text-[#374151] mb-1">{city}, {state}</Text>
        {address && <Text className="text-sm text-[#374151] mb-1">{address}</Text>}
        {pincode && <Text className="text-sm text-[#374151]">Pincode: {pincode}</Text>}
      </View>

      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text
          className="text-base font-semibold text-[#111928] mb-3"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Pricing
        </Text>
        <Text className="text-sm text-[#374151] mb-1">
          {listingType === 'sale' ? `Sale Price: ₹${salePrice}` : `Monthly Rent: ₹${monthlyRent}`}
        </Text>
        <Text className="text-sm text-[#374151]">Negotiable: {priceNegotiable ? 'Yes' : 'No'}</Text>
      </View>

      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text
          className="text-base font-semibold text-[#111928] mb-3"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Photos
        </Text>
        <Text className="text-sm text-[#374151]">
          {images.length} image(s) uploaded {images.length < 2 && (
            <Text className="text-[#DC2626]">(minimum 2 required)</Text>
          )}
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
          <TouchableOpacity onPress={onBack} className="p-2 -ml-2" activeOpacity={0.7}>
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <Text
            className="text-xl font-semibold text-[#111928] ml-2"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            {isEditing ? 'Edit Property' : 'Add Property'}
          </Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView
          className="flex-1 bg-[#F9FAFB]"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View className={`px-6 pt-4 bg-white border-t border-[#E5E7EB] ${isKeyboardVisible ? 'pb-4' : 'pb-12'}`}>
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
                  label={isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Property' : 'Submit Property')}
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                />
              ) : (
                <Button
                  label="Next"
                  onPress={handleNext}
                  disabled={isSubmitting}
                />
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

