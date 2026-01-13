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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { vendorService, type Vendor, BUSINESS_TYPES } from '../../services/api/vendor.service';
import { type Address, type CreateAddressRequest } from '../../services';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import BackIcon from '../../components/icons/BackIcon';
import AddressIcon from '../../components/icons/AddressIcon';
import VendorIcon from '../../components/icons/VendorIcon';
import AddEditAddressBottomSheet from './components/AddEditAddressBottomSheet';
import EditIcon from '../../components/icons/EditIcon';

interface AddVendorScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
  vendorToEdit?: Vendor | null;
}

type Step = 'basic' | 'address' | 'services' | 'photos' | 'review';

interface FileInfo {
  uri: string;
  type: string;
  name: string;
}

export default function AddVendorScreen({ onBack, onSuccess, vendorToEdit }: AddVendorScreenProps) {
  const isEditing = !!vendorToEdit;
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Details
  const [vendorName, setVendorName] = useState(vendorToEdit?.vendor_name || '');
  const [businessDescription, setBusinessDescription] = useState(vendorToEdit?.business_description || '');
  const [businessType, setBusinessType] = useState<string>(vendorToEdit?.business_type || '');
  const [contactPersonName, setContactPersonName] = useState(vendorToEdit?.contact_person_name || '');
  const [contactPersonPhone, setContactPersonPhone] = useState(vendorToEdit?.contact_person_phone || '');
  const [contactPersonEmail, setContactPersonEmail] = useState(vendorToEdit?.contact_person_email || '');
  const [yearsInBusiness, setYearsInBusiness] = useState(vendorToEdit?.years_in_business?.toString() || '');

  // Step 2: Business Address - Initialize with existing vendor address if editing
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(() => {
    if (vendorToEdit && vendorToEdit.business_address) {
      const addr = vendorToEdit.business_address;
      return {
        id: Date.now(),
        name: 'Business Address',
        address: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        postal_code: addr.pincode || '',
        postalCode: addr.pincode || '',
        country: 'India',
        house_number: '',
        houseNumber: '',
        landmark: addr.landmark || '',
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

  // Step 3: Services/Products Offered
  const [servicesOffered, setServicesOffered] = useState<string[]>(vendorToEdit?.services_offered || []);
  const [serviceInput, setServiceInput] = useState('');

  // Step 4: Photos
  const [profilePicture, setProfilePicture] = useState<FileInfo | null>(
    vendorToEdit?.profile_picture ? { uri: vendorToEdit.profile_picture, type: 'image/jpeg', name: 'profile.jpg' } : null
  );
  const [businessGallery, setBusinessGallery] = useState<FileInfo[]>(
    vendorToEdit?.business_gallery?.map((img, idx) => ({
      uri: img,
      type: 'image/jpeg',
      name: `gallery_${idx}.jpg`,
    })) || []
  );

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const steps: { id: Step; title: string }[] = [
    { id: 'basic', title: 'Basic Details' },
    { id: 'address', title: 'Business Address' },
    { id: 'services', title: 'Services Selection' },
    { id: 'photos', title: 'Photos' },
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

  const pickProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const asset = result.assets[0];

        // Check file size (5MB limit)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Profile picture must be less than 5MB. Please select a smaller image or compress it.', [{ text: 'OK' }]);
          return;
        }

        setProfilePicture({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `profile_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickGalleryImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        // Validate file sizes (5MB limit per image)
        const oversizedImages: string[] = [];
        const validImages = result.assets.filter((asset, idx) => {
          if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
            oversizedImages.push(`Image ${idx + 1}`);
            return false;
          }
          return true;
        });

        if (oversizedImages.length > 0) {
          Alert.alert(
            'Some Images Too Large',
            `${oversizedImages.join(', ')} ${oversizedImages.length === 1 ? 'is' : 'are'} larger than 5MB and ${oversizedImages.length === 1 ? 'was' : 'were'} skipped. Please compress or select smaller images.`,
            [{ text: 'OK' }]
          );
        }

        if (validImages.length === 0) {
          return;
        }

        const newImages = validImages.map((asset, idx) => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `gallery_${Date.now()}_${idx}.jpg`,
        }));
        const combined = [...businessGallery, ...newImages];
        if (combined.length > 7) {
          Alert.alert('Limit Reached', 'You can only upload up to 7 gallery images.', [{ text: 'OK' }]);
          setBusinessGallery(combined.slice(0, 7));
        } else {
          setBusinessGallery(combined);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
  };

  const removeGalleryImage = (index: number) => {
    setBusinessGallery(businessGallery.filter((_, i) => i !== index));
  };

  const addService = () => {
    const trimmed = serviceInput.trim();
    if (trimmed && !servicesOffered.includes(trimmed)) {
      setServicesOffered((prev) => [...prev, trimmed]);
      setServiceInput('');
    }
  };

  const removeService = (service: string) => {
    setServicesOffered((prev) => prev.filter((s) => s !== service));
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basic':
        if (!vendorName.trim()) newErrors.vendorName = 'Vendor name is required';
        if (vendorName.trim().length < 2 || vendorName.trim().length > 100)
          newErrors.vendorName = 'Vendor name must be 2-100 characters';
        if (!contactPersonName.trim()) newErrors.contactPersonName = 'Contact person name is required';
        if (!contactPersonPhone.trim()) newErrors.contactPersonPhone = 'Contact phone is required';
        if (!businessType) newErrors.businessType = 'Business type is required';
        if (yearsInBusiness && (parseInt(yearsInBusiness) < 0 || parseInt(yearsInBusiness) > 100)) {
          newErrors.yearsInBusiness = 'Years in business must be 0-100';
        }
        break;

      case 'address':
        if (!selectedAddress) newErrors.address = 'Business address is required';
        break;

      case 'services':
        if (servicesOffered.length === 0) {
          newErrors.services = 'Add at least one product/service';
        }
        break;

      case 'photos':
        if (businessGallery.length < 2) newErrors.gallery = 'At least 2 gallery images are required';
        if (businessGallery.length > 7) newErrors.gallery = 'Maximum 7 gallery images allowed';
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
    // Validate all steps before submission
    const basicValid = validateStep('basic');
    const addressValid = validateStep('address');
    const servicesValid = validateStep('services');
    const photosValid = validateStep('photos');

    if (!basicValid || !addressValid || !servicesValid || !photosValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Required fields
      formData.append('vendor_name', vendorName);
      formData.append('contact_person_name', contactPersonName);
      formData.append('contact_person_phone', contactPersonPhone);
      formData.append('business_type', businessType);

      // Business address (as JSON string)
      if (selectedAddress) {
        const address = {
          street: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.postal_code,
          landmark: selectedAddress.landmark,
        };
        formData.append('business_address', JSON.stringify(address));
      }

      // Services offered (as JSON array string)
      formData.append('services_offered', JSON.stringify(servicesOffered));

      // Optional fields
      if (businessDescription.trim()) {
        formData.append('business_description', businessDescription);
      }
      if (contactPersonEmail.trim()) {
        formData.append('contact_person_email', contactPersonEmail);
      }
      if (yearsInBusiness.trim()) {
        const years = parseInt(yearsInBusiness);
        if (!isNaN(years)) {
          formData.append('years_in_business', years.toString());
        }
      }

      // Profile picture
      if (profilePicture && !profilePicture.uri.startsWith('http')) {
        formData.append('profile_picture', {
          uri: profilePicture.uri,
          type: profilePicture.type,
          name: profilePicture.name,
        } as any);
      }

      // Business gallery
      businessGallery.forEach((image) => {
        if (!image.uri.startsWith('http')) {
          formData.append('business_gallery', {
            uri: image.uri,
            type: image.type,
            name: image.name,
          } as any);
        }
      });

      if (isEditing && vendorToEdit) {
        await vendorService.updateVendor(vendorToEdit.id, formData);
        Alert.alert('Success', 'Vendor profile updated successfully!', [
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
        await vendorService.createVendor(formData);
        Alert.alert('Success', 'Vendor profile created successfully!', [
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
      }
    } catch (error: any) {
      let errorMessage = error?.message || `Failed to ${isEditing ? 'update' : 'create'} vendor profile.`;

      // Extract more specific error messages from backend
      if (error?.message) {
        // If error message contains validation details, show them
        if (error.message.includes('gallery')) {
          errorMessage = 'Please upload 2-7 gallery images (each under 5MB).';
        } else if (error.message.includes('5MB') || error.message.includes('file size')) {
          errorMessage = 'One or more images exceed 5MB. Please compress or select smaller images.';
        } else if (error.message.includes('business type')) {
          errorMessage = 'Please select a valid business type.';
        } else if (error.message.includes('services')) {
          errorMessage = 'Please select at least one service.';
        } else if (error.message.includes('subscription')) {
          errorMessage = 'Active subscription required to create vendor profiles.';
        }
      }

      Alert.alert('Error', errorMessage + '\n\nPlease try again.');
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
                  backgroundColor: isCompleted ? '#055c3a' : isActive ? '#055c3a' : '#E5E7EB',
                  borderRadius: 2,
                }}
              />
            );
          })}
        </View>

        {/* Step info */}
        <View>
          <Text className="text-xs text-[#6B7280] mb-1" style={{ fontFamily: 'Inter-Regular' }}>
            Step {currentIndex + 1} of {steps.length}
          </Text>
          <Text className="text-sm font-bold text-[#111928]" style={{ fontFamily: 'Inter-Bold' }}>
            {currentStepData.title}
          </Text>
        </View>
      </View>
    );
  };

  const renderBasicDetails = () => (
    <View className="px-6 pt-6">
      <Text className="text-2xl font-semibold text-[#111928] mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
        Basic Details
      </Text>
      <Text className="text-sm text-[#6B7280] mb-6" style={{ fontFamily: 'Inter-Regular' }}>
        Provide basic information about your vendor business
      </Text>

      <View className="mb-4">
        <Input
          label="Vendor Name"
          value={vendorName}
          onChangeText={setVendorName}
          placeholder="Enter vendor name"
          error={errors.vendorName}
          required
          maxLength={100}
        />
      </View>

      <View className="mb-4">
        <Input
          label="Business Description"
          value={businessDescription}
          onChangeText={setBusinessDescription}
          placeholder="Describe your business"
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-[#111928] mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
          Business Type{errors.businessType ? ' *' : ''}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row" style={{ gap: 8 }}>
            {BUSINESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setBusinessType(type.value)}
                className={`border rounded-lg px-4 py-2 ${
                  businessType === type.value ? 'bg-[#055c3a] border-[#055c3a]' : 'bg-white border-[#E5E7EB]'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm ${businessType === type.value ? 'text-white' : 'text-[#111928]'}`}
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {errors.businessType && <Text className="text-xs text-[#DC2626] mt-1">{errors.businessType}</Text>}
      </View>

      <View className="mb-4">
        <Input
          label="Contact Person Name"
          value={contactPersonName}
          onChangeText={setContactPersonName}
          placeholder="Enter contact person name"
          error={errors.contactPersonName}
          required
          maxLength={100}
        />
      </View>

      <View className="mb-4">
        <Input
          label="Contact Person Phone"
          value={contactPersonPhone}
          onChangeText={setContactPersonPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.contactPersonPhone}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Contact Person Email (Optional)"
          value={contactPersonEmail}
          onChangeText={setContactPersonEmail}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-4">
        <Input
          label="Years in Business (Optional)"
          value={yearsInBusiness}
          onChangeText={setYearsInBusiness}
          placeholder="0-100"
          keyboardType="number-pad"
          error={errors.yearsInBusiness}
        />
      </View>
    </View>
  );

  const renderBusinessAddress = () => (
    <View className="px-6 pt-6">
      <Text className="text-2xl font-semibold text-[#111928] mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
        Business Address
      </Text>
      <Text className="text-sm text-[#6B7280] mb-6" style={{ fontFamily: 'Inter-Regular' }}>
        Select address for your business
      </Text>

      {selectedAddress ? (
        <View className="mb-4">
          <View className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#111928] mb-1" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {selectedAddress.name}
                </Text>
                <Text className="text-sm text-[#374151] mb-1">
                  {selectedAddress.house_number && `${selectedAddress.house_number}, `}
                  {selectedAddress.address}
                </Text>
                <Text className="text-sm text-[#374151]">
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                </Text>
                {selectedAddress.landmark && (
                  <Text className="text-xs text-[#6B7280] mt-1">
                    Landmark: {selectedAddress.landmark}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowAddressSheet(true)}
                className="ml-2 p-2"
                activeOpacity={0.7}
              >
                <EditIcon size={20} color="#055c3a" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAddressSheet(true)}
          className="flex-row items-center justify-center border-2 border-dashed border-[#D1D5DB] rounded-xl py-6 mb-4"
          activeOpacity={0.7}
        >
          <AddressIcon size={24} color="#6B7280" />
          <Text
            className="text-base font-medium text-[#6B7280] ml-2"
            style={{ fontFamily: 'Inter-Medium' }}
          >
            Add Business Address
          </Text>
        </TouchableOpacity>
      )}

      {errors.address && (
        <Text className="text-xs text-[#DC2626] mt-1 mb-4">{errors.address}</Text>
      )}
    </View>
  );

  const renderServicesSelection = () => {
    return (
      <View className="px-6 pt-6">
        <Text className="text-2xl font-semibold text-[#111928] mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
          Products/Services Offered
        </Text>
        <Text className="text-sm text-[#6B7280] mb-6" style={{ fontFamily: 'Inter-Regular' }}>
          Add the products or services you offer (e.g., Cement, Paint, Steel, etc.){errors.services ? ' *' : ''}
        </Text>

        {errors.services && <Text className="text-xs text-[#DC2626] mb-4">{errors.services}</Text>}

        {/* Display added services */}
        {servicesOffered.length > 0 && (
          <View className="flex-row flex-wrap mb-6" style={{ gap: 8 }}>
            {servicesOffered.map((service, index) => (
              <View
                key={`service-${index}`}
                className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-4 py-2 flex-row items-center"
                style={{ gap: 8 }}
              >
                <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
                  {service}
                </Text>
                <TouchableOpacity
                  onPress={() => removeService(service)}
                  className="ml-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-[#DC2626] text-sm font-bold">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add Service Input */}
        <View className="flex-row mb-4" style={{ gap: 8, alignItems: 'center' }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Input
              placeholder="Add product/service (e.g., Cement)"
              value={serviceInput}
              onChangeText={setServiceInput}
              onSubmitEditing={addService}
            />
          </View>
          <TouchableOpacity
            onPress={addService}
            className="bg-[#055c3a] rounded-lg px-4 py-3 justify-center items-center"
            style={{ minWidth: 70 }}
            activeOpacity={0.7}
            disabled={!serviceInput.trim()}
          >
            <Text className="text-white font-medium" style={{ fontFamily: 'Inter-Medium' }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {servicesOffered.length > 0 && (
          <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            {servicesOffered.length} product{servicesOffered.length === 1 ? '' : 's'}/service{servicesOffered.length === 1 ? '' : 's'} added
          </Text>
        )}
      </View>
    );
  };

  const renderPhotos = () => (
    <View className="px-6 pt-6">
      <Text className="text-2xl font-semibold text-[#111928] mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
        Photos
      </Text>
      <Text className="text-sm text-[#6B7280] mb-6" style={{ fontFamily: 'Inter-Regular' }}>
        Add photos of your business (minimum 2 gallery images required){errors.gallery ? ' *' : ''}
      </Text>

      {/* Profile Picture Section */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-[#111928] mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
          Profile Picture (Optional)
        </Text>
        {profilePicture ? (
          <View className="relative">
            <Image source={{ uri: profilePicture.uri }} className="w-24 h-24 rounded-lg" resizeMode="cover" />
            <TouchableOpacity
              onPress={removeProfilePicture}
              className="absolute -top-2 -right-2 w-6 h-6 bg-[#DC2626] rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Text className="text-white text-xs">×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={pickProfilePicture}
            className="border border-[#E5E7EB] rounded-lg p-4 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-sm text-[#055c3a] font-medium" style={{ fontFamily: 'Inter-Medium' }}>
              + Add Profile Picture
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Business Gallery Section */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-[#111928] mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
          Business Gallery (2-7 images)
        </Text>
        <TouchableOpacity
          onPress={pickGalleryImages}
          disabled={businessGallery.length >= 7}
          className="border border-[#E5E7EB] rounded-lg p-4 items-center mb-4"
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-medium ${businessGallery.length >= 7 ? 'text-[#9CA3AF]' : 'text-[#055c3a]'}`}
            style={{ fontFamily: 'Inter-Medium' }}
          >
            {businessGallery.length >= 7 ? 'Maximum Reached' : '+ Add Gallery Photos'}
          </Text>
        </TouchableOpacity>

        {errors.gallery && <Text className="text-xs text-[#DC2626] mb-4">{errors.gallery}</Text>}

        {businessGallery.length > 0 && (
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {businessGallery.map((image, index) => (
              <View key={index} className="relative">
                <Image source={{ uri: image.uri }} className="w-24 h-24 rounded-lg" resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => removeGalleryImage(index)}
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
    </View>
  );

  const renderReview = () => (
    <View className="px-6 pt-6">
      <Text className="text-2xl font-semibold text-[#111928] mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
        Review Your Information
      </Text>
      <Text className="text-sm text-[#6B7280] mb-6" style={{ fontFamily: 'Inter-Regular' }}>
        Please review all information before submitting
      </Text>

      {/* Basic Details Card */}
      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text className="text-base font-semibold text-[#111928] mb-3" style={{ fontFamily: 'Inter-SemiBold' }}>
          Basic Details
        </Text>
        <Text className="text-sm text-[#374151] mb-1">Vendor: {vendorName}</Text>
        <Text className="text-sm text-[#374151] mb-1">
          Business Type: {BUSINESS_TYPES.find((t) => t.value === businessType)?.label}
        </Text>
        <Text className="text-sm text-[#374151] mb-1">
          Contact: {contactPersonName} ({contactPersonPhone})
        </Text>
        {yearsInBusiness && <Text className="text-sm text-[#374151]">Experience: {yearsInBusiness} years</Text>}
      </View>

      {/* Address Card */}
      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text className="text-base font-semibold text-[#111928] mb-3" style={{ fontFamily: 'Inter-SemiBold' }}>
          Business Address
        </Text>
        {selectedAddress ? (
          <>
            <Text className="text-sm text-[#374151] font-semibold mb-1">{selectedAddress.name}</Text>
            <Text className="text-sm text-[#374151] mb-1">
              {selectedAddress.house_number && `${selectedAddress.house_number}, `}
              {selectedAddress.address}
            </Text>
            <Text className="text-sm text-[#374151]">
              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
            </Text>
            {selectedAddress.landmark && (
              <Text className="text-xs text-[#6B7280] mt-1">Landmark: {selectedAddress.landmark}</Text>
            )}
          </>
        ) : (
          <Text className="text-sm text-[#6B7280]">No address selected</Text>
        )}
      </View>

      {/* Services Card */}
      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text className="text-base font-semibold text-[#111928] mb-3" style={{ fontFamily: 'Inter-SemiBold' }}>
          Products/Services ({servicesOffered.length})
        </Text>
        <Text className="text-sm text-[#374151]">
          {servicesOffered.join(', ') || 'None added'}
        </Text>
      </View>

      {/* Photos Card */}
      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text className="text-base font-semibold text-[#111928] mb-3" style={{ fontFamily: 'Inter-SemiBold' }}>
          Photos
        </Text>
        <Text className="text-sm text-[#374151] mb-1">
          {profilePicture ? '✓ Profile picture added' : '○ No profile picture'}
        </Text>
        <Text className="text-sm text-[#374151]">
          {businessGallery.length} gallery image{businessGallery.length === 1 ? '' : 's'}
          {businessGallery.length < 2 ? ' ' : ''}
          {businessGallery.length < 2 && (
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
      case 'address':
        return renderBusinessAddress();
      case 'services':
        return renderServicesSelection();
      case 'photos':
        return renderPhotos();
      case 'review':
        return renderReview();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView behavior="padding" className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
          <TouchableOpacity onPress={onBack} className="p-2 -ml-2" activeOpacity={0.7}>
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-[#111928] ml-2" style={{ fontFamily: 'Inter-SemiBold' }}>
            {isEditing ? 'Edit Vendor Profile' : 'Add Vendor Profile'}
          </Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView className="flex-1 bg-[#F9FAFB]" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View className={`px-6 pt-4 bg-white border-t border-[#E5E7EB] ${isKeyboardVisible ? 'pb-4' : 'pb-12'}`}>
          <View className="flex-row" style={{ gap: 12 }}>
            {currentStep !== 'basic' && (
              <View className="flex-1">
                <Button label="Previous" onPress={handlePrevious} variant="outline" disabled={isSubmitting} />
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
                      ? 'Update Vendor'
                      : 'Submit Vendor'
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
