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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAppSelector } from '../../store/hooks';
import { brokerApplicationService, type UserApplicationResponse, type Address, type CreateAddressRequest } from '../../services';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import BackIcon from '../../components/icons/BackIcon';
import AddressIcon from '../../components/icons/AddressIcon';
import AddEditAddressBottomSheet from './components/AddEditAddressBottomSheet';
import EditIcon from '../../components/icons/EditIcon';

interface ApplyForBrokerScreenProps {
  onBack: () => void;
  onSubmitSuccess?: () => Promise<void>;
}

type Step = 'personal' | 'documents' | 'address' | 'brokerDetails' | 'review';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  alternative_number: string;
}


interface BrokerDetails {
  license: string;
  agency: string;
}

interface FileInfo {
  uri: string;
  type: string;
  name: string;
}

export default function ApplyForBrokerScreen({ onBack, onSubmitSuccess }: ApplyForBrokerScreenProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<UserApplicationResponse['data'] | null>(null);

  // Form data
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    email: '',
    phone: user?.phone || '',
    alternative_number: '',
  });
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [brokerDetails, setBrokerDetails] = useState<BrokerDetails>({
    license: '',
    agency: '',
  });

  // Files
  const [aadharCard, setAadharCard] = useState<FileInfo | null>(null);
  const [panCard, setPanCard] = useState<FileInfo | null>(null);
  const [profilePic, setProfilePic] = useState<FileInfo | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const steps: { id: Step; title: string }[] = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'documents', title: 'Document Upload' },
    { id: 'address', title: 'Address Information' },
    { id: 'brokerDetails', title: 'Broker Details' },
    { id: 'review', title: 'Review & Submit' },
  ];

  useEffect(() => {
    loadExistingApplication();
  }, []);

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

  useEffect(() => {
    if (user) {
      setContactInfo((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const loadExistingApplication = async () => {
    try {
      setIsLoading(true);
      const response = await brokerApplicationService.getUserApplication();
      if (response.data) {
        setExistingApplication(response.data);
      }
    } catch (error: any) {
      // If application not found (404), it's normal - user hasn't applied yet
    } finally {
      setIsLoading(false);
    }
  };

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

  const pickImage = async (type: 'aadhar' | 'pan' | 'profile') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileInfo: FileInfo = {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `${type}_${Date.now()}.jpg`,
        };

        switch (type) {
          case 'aadhar':
            setAadharCard(fileInfo);
            break;
          case 'pan':
            setPanCard(fileInfo);
            break;
          case 'profile':
            setProfilePic(fileInfo);
            break;
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'personal':
        if (!contactInfo.name.trim()) {
          newErrors.name = 'Full name is required';
        }
        if (!contactInfo.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (contactInfo.alternative_number.trim() && !/^\+?[0-9]{10,20}$/.test(contactInfo.alternative_number.replace(/\s/g, ''))) {
          newErrors.alternative_number = 'Please enter a valid phone number';
        }
        break;

      case 'documents':
        if (!aadharCard) newErrors.aadhar_card = 'Aadhar card is required';
        if (!panCard) newErrors.pan_card = 'PAN card is required';
        if (!profilePic) newErrors.profile_pic = 'Profile picture is required';
        break;

      case 'address':
        if (!selectedAddress) newErrors.address = 'Address is required';
        break;

      case 'brokerDetails':
        if (!brokerDetails.license.trim()) {
          newErrors.license = 'License number is required';
        }
        if (!brokerDetails.agency.trim()) {
          newErrors.agency = 'Agency name is required';
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
      const addressData = selectedAddress ? {
        street: selectedAddress.address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.postal_code,
        landmark: selectedAddress.landmark,
      } : null;

      const applicationData = {
        license: brokerDetails.license,
        agency: brokerDetails.agency,
        contact_info: JSON.stringify(contactInfo),
        address: JSON.stringify(addressData),
        aadhar_card: aadharCard!,
        pan_card: panCard!,
        profile_pic: profilePic!,
      };

      await brokerApplicationService.submitApplication(applicationData);

      // Refresh user data in Redux if callback provided
      if (onSubmitSuccess) {
        await onSubmitSuccess();
      }

      Alert.alert(
        'Success',
        'Your application has been submitted successfully. We will review it and get back to you soon.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit application. Please try again.');
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
                      ? '#055c3a' // Button color - completed
                      : isActive
                      ? '#055c3a' // Button color - active
                      : '#E5E7EB', // gray-200 - pending
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

  const renderPersonalInfo = () => (
    <View className="px-6 pt-6">
      <Text
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Personal Information
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Please provide your contact information
      </Text>

      <View className="mb-4">
        <Input
          label="Full Name"
          value={contactInfo.name}
          onChangeText={(text) => setContactInfo({ ...contactInfo, name: text })}
          placeholder="Enter your full name"
          error={errors.name}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Email Address"
          value={contactInfo.email}
          onChangeText={(text) => setContactInfo({ ...contactInfo, email: text })}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Phone Number"
          value={contactInfo.phone}
          editable={false}
          placeholder="Phone number"
        />
      </View>

      <View className="mb-4">
        <Input
          label="Alternative Phone Number"
          value={contactInfo.alternative_number}
          onChangeText={(text) => setContactInfo({ ...contactInfo, alternative_number: text })}
          placeholder="Enter alternative phone number"
          keyboardType="phone-pad"
          error={errors.alternative_number}
        />
      </View>
    </View>
  );

  const renderDocuments = () => (
    <View className="px-6 pt-6">
      <Text
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Documents
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Please upload the required documents
      </Text>

      <View>
        <View className="mb-4">
          <Text
            className="text-sm font-semibold text-[#111928] mb-2"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Aadhar Card {errors.aadhar_card && <Text className="text-[#DC2626]">*</Text>}
          </Text>
          <TouchableOpacity
            onPress={() => pickImage('aadhar')}
            className="border border-[#E5E7EB] rounded-lg p-4 flex-row items-center"
            activeOpacity={0.7}
          >
            {aadharCard && (
              <Image
                source={{ uri: aadharCard.uri }}
                className="w-12 h-12 rounded-lg mr-3"
                resizeMode="cover"
              />
            )}
            <Text
              className={`flex-1 text-sm ${aadharCard ? 'text-[#111928]' : 'text-[#6B7280]'}`}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              {aadharCard ? 'Change Aadhar Card' : 'Upload Aadhar Card'}
            </Text>
          </TouchableOpacity>
          {errors.aadhar_card && (
            <Text className="text-xs text-[#DC2626] mt-1">{errors.aadhar_card}</Text>
          )}
        </View>

        <View className="mb-4">
          <Text
            className="text-sm font-semibold text-[#111928] mb-2"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            PAN Card {errors.pan_card && <Text className="text-[#DC2626]">*</Text>}
          </Text>
          <TouchableOpacity
            onPress={() => pickImage('pan')}
            className="border border-[#E5E7EB] rounded-lg p-4 flex-row items-center"
            activeOpacity={0.7}
          >
            {panCard && (
              <Image
                source={{ uri: panCard.uri }}
                className="w-12 h-12 rounded-lg mr-3"
                resizeMode="cover"
              />
            )}
            <Text
              className={`flex-1 text-sm ${panCard ? 'text-[#111928]' : 'text-[#6B7280]'}`}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              {panCard ? 'Change PAN Card' : 'Upload PAN Card'}
            </Text>
          </TouchableOpacity>
          {errors.pan_card && (
            <Text className="text-xs text-[#DC2626] mt-1">{errors.pan_card}</Text>
          )}
        </View>

        <View className="mb-4">
          <Text
            className="text-sm font-semibold text-[#111928] mb-2"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Profile Picture {errors.profile_pic && <Text className="text-[#DC2626]">*</Text>}
          </Text>
          <TouchableOpacity
            onPress={() => pickImage('profile')}
            className="border border-[#E5E7EB] rounded-lg p-4 flex-row items-center"
            activeOpacity={0.7}
          >
            {profilePic && (
              <Image
                source={{ uri: profilePic.uri }}
                className="w-12 h-12 rounded-lg mr-3"
                resizeMode="cover"
              />
            )}
            <Text
              className={`flex-1 text-sm ${profilePic ? 'text-[#111928]' : 'text-[#6B7280]'}`}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              {profilePic ? 'Change Profile Picture' : 'Upload Profile Picture'}
            </Text>
          </TouchableOpacity>
          {errors.profile_pic && (
            <Text className="text-xs text-[#DC2626] mt-1">{errors.profile_pic}</Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderAddress = () => (
    <View className="px-6 pt-6">
      <Text
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Address Information
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Select your residential address
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
            Add Your Address
          </Text>
        </TouchableOpacity>
      )}

      {errors.address && (
        <Text className="text-xs text-[#DC2626] mt-1 mb-4">{errors.address}</Text>
      )}
    </View>
  );

  const renderBrokerDetails = () => (
    <View className="px-6 pt-6">
      <Text
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Broker Details
      </Text>
      <Text
        className="text-sm text-[#6B7280] mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Enter your broker license and agency information
      </Text>

      <View className="mb-4">
        <Input
          label="License Number"
          value={brokerDetails.license}
          onChangeText={(text) => setBrokerDetails({ ...brokerDetails, license: text })}
          placeholder="Enter your broker license number"
          error={errors.license}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Agency Name"
          value={brokerDetails.agency}
          onChangeText={(text) => setBrokerDetails({ ...brokerDetails, agency: text })}
          placeholder="Enter your broker agency name"
          error={errors.agency}
          required
        />
      </View>

      {/* Info Box */}
      <View className="bg-white rounded-xl border border-[#E5E7EB] mt-4 overflow-hidden">
        <View className="px-4 py-4 border-b border-[#E5E7EB]">
          <Text
            className="text-base font-semibold text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Important Information
          </Text>
        </View>
        <View className="px-4 py-4">
          <View className="flex-row items-start mb-2">
            <View
              className="w-1 h-1 rounded-full bg-[#9CA3AF] mt-2 mr-3"
              style={{ marginTop: 8 }}
            />
            <Text
              className="flex-1 text-sm text-[#374151]"
              style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
            >
              Ensure your broker license is valid and active
            </Text>
          </View>
          <View className="flex-row items-start mb-2">
            <View
              className="w-1 h-1 rounded-full bg-[#9CA3AF] mt-2 mr-3"
              style={{ marginTop: 8 }}
            />
            <Text
              className="flex-1 text-sm text-[#374151]"
              style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
            >
              Agency name must match official registration
            </Text>
          </View>
          <View className="flex-row items-start">
            <View
              className="w-1 h-1 rounded-full bg-[#9CA3AF] mt-2 mr-3"
              style={{ marginTop: 8 }}
            />
            <Text
              className="flex-1 text-sm text-[#374151]"
              style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
            >
              All details will be verified before approval
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderReview = () => (
    <View className="px-6 pt-6">
      <Text
        className="text-2xl font-semibold text-[#111928] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        Review Your Application
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
          Personal Information
        </Text>
        <Text className="text-sm text-[#374151] mb-1">Name: {contactInfo.name}</Text>
        <Text className="text-sm text-[#374151] mb-1">Email: {contactInfo.email}</Text>
        <Text className="text-sm text-[#374151] mb-1">Phone: {contactInfo.phone}</Text>
        <Text className="text-sm text-[#374151]">Alt. Phone: {contactInfo.alternative_number}</Text>
      </View>

      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text
          className="text-base font-semibold text-[#111928] mb-3"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Address
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

      <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
        <Text
          className="text-base font-semibold text-[#111928] mb-3"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Broker Details
        </Text>
        <Text className="text-sm text-[#374151] mb-1">License Number: {brokerDetails.license}</Text>
        <Text className="text-sm text-[#374151]">Agency Name: {brokerDetails.agency}</Text>
      </View>
      <View className="pb-8" />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return renderPersonalInfo();
      case 'documents':
        return renderDocuments();
      case 'address':
        return renderAddress();
      case 'brokerDetails':
        return renderBrokerDetails();
      case 'review':
        return renderReview();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text
            className="text-sm text-[#6B7280] mt-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (existingApplication) {
    const statusColors: Record<string, string> = {
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#EF4444',
    };

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
          <TouchableOpacity onPress={onBack} className="p-2 -ml-2" activeOpacity={0.7}>
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <Text
            className="text-xl font-semibold text-[#111928] ml-2"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Apply for Broker
          </Text>
        </View>

        <ScrollView className="flex-1 bg-[#F9FAFB]">
          <View className="px-6 pt-6">
            <View className="bg-white rounded-xl border border-[#E5E7EB] p-6 items-center">
              <View
                className="px-4 py-2 rounded-lg mb-4"
                style={{ backgroundColor: `${statusColors[existingApplication.status] || '#6B7280'}20` }}
              >
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{
                    color: statusColors[existingApplication.status] || '#6B7280',
                    fontFamily: 'Inter-SemiBold',
                  }}
                >
                  {existingApplication.status}
                </Text>
              </View>
              <Text
                className="text-base text-[#374151] text-center"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                {existingApplication.status === 'pending' &&
                  'Your application is under review. We will notify you once it is processed.'}
                {existingApplication.status === 'approved' &&
                  'Congratulations! Your application has been approved.'}
                {existingApplication.status === 'rejected' &&
                  existingApplication.rejection_reason
                    ? `Your application was rejected: ${existingApplication.rejection_reason}`
                    : 'Your application was rejected. Please contact support for more information.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
            Apply for Broker
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
            {currentStep !== 'personal' && (
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
                  label={isSubmitting ? 'Submitting...' : 'Submit Application'}
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

