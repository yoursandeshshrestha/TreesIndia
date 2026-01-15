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
import {
  workerApplicationService,
  type UserApplicationResponse,
  type Address,
  type CreateAddressRequest,
} from '../../services';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import BackIcon from '../../components/icons/BackIcon';
import AddressIcon from '../../components/icons/AddressIcon';
import AddEditAddressBottomSheet from './components/AddEditAddressBottomSheet';
import EditIcon from '../../components/icons/EditIcon';

interface ApplyForWorkerScreenProps {
  onBack: () => void;
  onSubmitSuccess?: () => Promise<void>;
}

type Step = 'personal' | 'documents' | 'address' | 'skills' | 'banking' | 'review';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  alternative_number: string;
}

interface BankingInfo {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
}

interface FileInfo {
  uri: string;
  type: string;
  name: string;
}

export default function ApplyForWorkerScreen({
  onBack,
  onSubmitSuccess,
}: ApplyForWorkerScreenProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<
    UserApplicationResponse['data'] | null
  >(null);

  // Form data
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    email: '',
    phone: user?.phone || '',
    alternative_number: '',
  });
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [bankingInfo, setBankingInfo] = useState<BankingInfo>({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
  });
  const [experienceYears, setExperienceYears] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const predefinedSkills = [
    'Construction',
    'Plumbing',
    'Electrical Work',
    'Carpentry',
    'Painting',
    'Masonry',
    'Roofing',
    'Tile Installation',
    'Welding',
    'HVAC',
    'Landscaping',
    'General Labor',
    'Cleaning',
    'Gardening',
    'Security',
    'Cooking',
    'Driving',
    'Appliance Repair',
    'Maintenance',
  ];

  // Files
  const [aadharCard, setAadharCard] = useState<FileInfo | null>(null);
  const [panCard, setPanCard] = useState<FileInfo | null>(null);
  const [profilePic, setProfilePic] = useState<FileInfo | null>(null);
  const [policeVerification, setPoliceVerification] = useState<FileInfo | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const steps: { id: Step; title: string }[] = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'documents', title: 'Document Upload' },
    { id: 'address', title: 'Address Information' },
    { id: 'skills', title: 'Skills & Experience' },
    { id: 'banking', title: 'Banking Information' },
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
      const response = await workerApplicationService.getUserApplication();
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

  const pickImage = async (type: 'aadhar' | 'pan' | 'profile' | 'police') => {
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
          case 'police':
            setPoliceVerification(fileInfo);
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
        if (
          contactInfo.alternative_number.trim() &&
          !/^\+?[0-9]{10,20}$/.test(contactInfo.alternative_number.replace(/\s/g, ''))
        ) {
          newErrors.alternative_number = 'Please enter a valid phone number';
        }
        break;

      case 'documents':
        if (!aadharCard) newErrors.aadhar_card = 'Aadhar card is required';
        if (!panCard) newErrors.pan_card = 'PAN card is required';
        if (!profilePic) newErrors.profile_pic = 'Profile picture is required';
        if (!policeVerification) newErrors.police_verification = 'Police verification is required';
        break;

      case 'address':
        if (!selectedAddress) newErrors.address = 'Address is required';
        break;

      case 'skills':
        if (!experienceYears || parseInt(experienceYears) < 0) {
          newErrors.experience_years = 'Experience years is required';
        }
        if (skills.length === 0) {
          newErrors.skills = 'At least one skill is required';
        }
        break;

      case 'banking':
        if (!bankingInfo.account_holder_name.trim()) {
          newErrors.account_holder_name = 'Account holder name is required';
        }
        if (!bankingInfo.account_number.trim()) {
          newErrors.account_number = 'Account number is required';
        }
        if (!bankingInfo.ifsc_code.trim()) {
          newErrors.ifsc_code = 'IFSC code is required';
        }
        if (!bankingInfo.bank_name.trim()) {
          newErrors.bank_name = 'Bank name is required';
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

  const handleToggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      handleRemoveSkill(skill);
    } else {
      setSkills([...skills, skill]);
      if (errors.skills) {
        const newErrors = { ...errors };
        delete newErrors.skills;
        setErrors(newErrors);
      }
    }
  };

  const handleAddSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
      if (errors.skills) {
        const newErrors = { ...errors };
        delete newErrors.skills;
        setErrors(newErrors);
      }
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    if (!validateStep('review')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const addressData = selectedAddress
        ? {
            street: selectedAddress.address,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.postal_code,
            landmark: selectedAddress.landmark,
          }
        : null;

      const applicationData = {
        experience_years: parseInt(experienceYears),
        skills: JSON.stringify(skills),
        contact_info: JSON.stringify(contactInfo),
        address: JSON.stringify(addressData),
        banking_info: JSON.stringify(bankingInfo),
        aadhar_card: aadharCard!,
        pan_card: panCard!,
        profile_pic: profilePic!,
        police_verification: policeVerification!,
      };

      await workerApplicationService.submitApplication(applicationData);

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
                  backgroundColor: isCompleted
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

  const renderPersonalInfo = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Personal Information
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
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
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Documents
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Please upload the required documents
      </Text>

      <View>
        <View className="mb-4">
          <Text
            className="mb-2 font-semibold text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Aadhar Card {errors.aadhar_card && <Text className="text-[#DC2626]">*</Text>}
          </Text>
          <TouchableOpacity
            onPress={() => pickImage('aadhar')}
            className="flex-row items-center rounded-lg border border-[#E5E7EB] p-4"
            activeOpacity={0.7}>
            {aadharCard && (
              <Image
                source={{ uri: aadharCard.uri }}
                className="mr-3 h-12 w-12 rounded-lg"
                resizeMode="cover"
              />
            )}
            <Text
              className={`flex-1 text-sm ${aadharCard ? 'text-[#111928]' : 'text-[#6B7280]'}`}
              style={{ fontFamily: 'Inter-Regular' }}>
              {aadharCard ? 'Change Aadhar Card' : 'Upload Aadhar Card'}
            </Text>
          </TouchableOpacity>
          {errors.aadhar_card && (
            <Text className="mt-1 text-xs text-[#DC2626]">{errors.aadhar_card}</Text>
          )}
        </View>

        <View className="mb-4">
          <Text
            className="mb-2 font-semibold text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            PAN Card {errors.pan_card && <Text className="text-[#DC2626]">*</Text>}
          </Text>
          <TouchableOpacity
            onPress={() => pickImage('pan')}
            className="flex-row items-center rounded-lg border border-[#E5E7EB] p-4"
            activeOpacity={0.7}>
            {panCard && (
              <Image
                source={{ uri: panCard.uri }}
                className="mr-3 h-12 w-12 rounded-lg"
                resizeMode="cover"
              />
            )}
            <Text
              className={`flex-1 text-sm ${panCard ? 'text-[#111928]' : 'text-[#6B7280]'}`}
              style={{ fontFamily: 'Inter-Regular' }}>
              {panCard ? 'Change PAN Card' : 'Upload PAN Card'}
            </Text>
          </TouchableOpacity>
          {errors.pan_card && (
            <Text className="mt-1 text-xs text-[#DC2626]">{errors.pan_card}</Text>
          )}
        </View>

        <View className="mb-4">
          <Text
            className="mb-2 font-semibold text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Profile Picture {errors.profile_pic && <Text className="text-[#DC2626]">*</Text>}
          </Text>
          <TouchableOpacity
            onPress={() => pickImage('profile')}
            className="flex-row items-center rounded-lg border border-[#E5E7EB] p-4"
            activeOpacity={0.7}>
            {profilePic && (
              <Image
                source={{ uri: profilePic.uri }}
                className="mr-3 h-12 w-12 rounded-lg"
                resizeMode="cover"
              />
            )}
            <Text
              className={`flex-1 text-sm ${profilePic ? 'text-[#111928]' : 'text-[#6B7280]'}`}
              style={{ fontFamily: 'Inter-Regular' }}>
              {profilePic ? 'Change Profile Picture' : 'Upload Profile Picture'}
            </Text>
          </TouchableOpacity>
          {errors.profile_pic && (
            <Text className="mt-1 text-xs text-[#DC2626]">{errors.profile_pic}</Text>
          )}
        </View>

        <View className="mb-4">
          <Text
            className="mb-2 font-semibold text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Police Verification{' '}
            {errors.police_verification && <Text className="text-[#DC2626]">*</Text>}
          </Text>
          <TouchableOpacity
            onPress={() => pickImage('police')}
            className="flex-row items-center rounded-lg border border-[#E5E7EB] p-4"
            activeOpacity={0.7}>
            {policeVerification && (
              <Image
                source={{ uri: policeVerification.uri }}
                className="mr-3 h-12 w-12 rounded-lg"
                resizeMode="cover"
              />
            )}
            <Text
              className={`flex-1 text-sm ${policeVerification ? 'text-[#111928]' : 'text-[#6B7280]'}`}
              style={{ fontFamily: 'Inter-Regular' }}>
              {policeVerification ? 'Change Police Verification' : 'Upload Police Verification'}
            </Text>
          </TouchableOpacity>
          {errors.police_verification && (
            <Text className="mt-1 text-xs text-[#DC2626]">{errors.police_verification}</Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderAddress = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Address Information
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Select your residential address
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
            Add Your Address
          </Text>
        </TouchableOpacity>
      )}

      {errors.address && <Text className="mb-4 mt-1 text-xs text-[#DC2626]">{errors.address}</Text>}
    </View>
  );

  const renderSkills = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Skills & Experience
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Please provide your experience and skills
      </Text>

      <View className="mb-4">
        <Input
          label="Years of Experience"
          value={experienceYears}
          onChangeText={setExperienceYears}
          placeholder="Enter years of experience"
          keyboardType="number-pad"
          error={errors.experience_years}
          required
        />
      </View>

      <View className="mt-4">
        <Text
          className="mb-2 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Skills {errors.skills && <Text className="text-[#DC2626]">*</Text>}
        </Text>

        {/* Predefined Skills */}
        <View className="mb-4">
          <Text className="mb-3 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Select from available skills:
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {predefinedSkills.map((skill) => {
              const isSelected = skills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  onPress={() => handleToggleSkill(skill)}
                  className={`rounded-lg border px-3 py-2 ${
                    isSelected ? 'border-[#055c3a] bg-[#055c3a]' : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`text-sm ${isSelected ? 'text-white' : 'text-[#111928]'}`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Skills */}
        {skills.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
              Selected skills:
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {skills.map((skill) => (
                <View
                  key={skill}
                  className="flex-row items-center rounded-lg bg-[#F3F4F6] px-3 py-2">
                  <Text
                    className="mr-2 text-sm text-[#111928]"
                    style={{ fontFamily: 'Inter-Regular' }}>
                    {skill}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                    <Text className="text-sm text-[#DC2626]">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Custom Skill Input */}
        <View>
          <Text className="mb-2 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Or add a custom skill:
          </Text>
          <View className="flex-row" style={{ gap: 8 }}>
            <View className="flex-1">
              <Input
                value={customSkill}
                onChangeText={setCustomSkill}
                placeholder="Add a custom skill"
              />
            </View>
            <TouchableOpacity
              onPress={handleAddSkill}
              className="justify-center rounded-lg bg-[#055c3a] px-4"
              activeOpacity={0.7}>
              <Text className="font-semibold text-white" style={{ fontFamily: 'Inter-SemiBold' }}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {errors.skills && <Text className="mt-1 text-xs text-[#DC2626]">{errors.skills}</Text>}
      </View>
      <View className="pb-8" />
    </View>
  );

  const renderBanking = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Banking Information
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Please provide your banking details
      </Text>

      <View className="mb-4">
        <Input
          label="Account Holder Name"
          value={bankingInfo.account_holder_name}
          onChangeText={(text) => setBankingInfo({ ...bankingInfo, account_holder_name: text })}
          placeholder="Enter account holder name"
          error={errors.account_holder_name}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Account Number"
          value={bankingInfo.account_number}
          onChangeText={(text) => setBankingInfo({ ...bankingInfo, account_number: text })}
          placeholder="Enter account number"
          keyboardType="number-pad"
          error={errors.account_number}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="IFSC Code"
          value={bankingInfo.ifsc_code}
          onChangeText={(text) => setBankingInfo({ ...bankingInfo, ifsc_code: text.toUpperCase() })}
          placeholder="Enter IFSC code"
          autoCapitalize="characters"
          error={errors.ifsc_code}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Bank Name"
          value={bankingInfo.bank_name}
          onChangeText={(text) => setBankingInfo({ ...bankingInfo, bank_name: text })}
          placeholder="Enter bank name"
          error={errors.bank_name}
          required
        />
      </View>
    </View>
  );

  const renderReview = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Review Your Application
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Please review all information before submitting
      </Text>

      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-base text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Personal Information
        </Text>
        <Text className="mb-1 text-sm text-[#374151]">Name: {contactInfo.name}</Text>
        <Text className="mb-1 text-sm text-[#374151]">Email: {contactInfo.email}</Text>
        <Text className="mb-1 text-sm text-[#374151]">Phone: {contactInfo.phone}</Text>
        <Text className="text-sm text-[#374151]">Alt. Phone: {contactInfo.alternative_number}</Text>
      </View>

      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-base text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Address
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
          Skills & Experience
        </Text>
        <Text className="mb-2 text-sm text-[#374151]">Experience: {experienceYears} years</Text>
        <Text className="text-sm text-[#374151]">Skills: {skills.join(', ')}</Text>
      </View>

      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-base text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Banking Information
        </Text>
        <Text className="mb-1 text-sm text-[#374151]">
          Account Holder: {bankingInfo.account_holder_name}
        </Text>
        <Text className="mb-1 text-sm text-[#374151]">
          Account Number: {bankingInfo.account_number}
        </Text>
        <Text className="mb-1 text-sm text-[#374151]">IFSC: {bankingInfo.ifsc_code}</Text>
        <Text className="text-sm text-[#374151]">Bank: {bankingInfo.bank_name}</Text>
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
      case 'skills':
        return renderSkills();
      case 'banking':
        return renderBanking();
      case 'review':
        return renderReview();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text className="mt-4 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
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
        <View className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
          <TouchableOpacity onPress={onBack} className="-ml-2 p-2" activeOpacity={0.7}>
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <Text
            className="ml-2 font-semibold text-xl text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Apply for Worker
          </Text>
        </View>

        <ScrollView className="flex-1 bg-[#F9FAFB]">
          <View className="px-6 pt-6">
            <View className="items-center rounded-xl border border-[#E5E7EB] bg-white p-6">
              <View
                className="mb-4 rounded-lg px-4 py-2"
                style={{
                  backgroundColor: `${statusColors[existingApplication.status] || '#6B7280'}20`,
                }}>
                <Text
                  className="font-semibold text-sm capitalize"
                  style={{
                    color: statusColors[existingApplication.status] || '#6B7280',
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {existingApplication.status}
                </Text>
              </View>
              <Text
                className="text-center text-base text-[#374151]"
                style={{ fontFamily: 'Inter-Regular' }}>
                {existingApplication.status === 'pending' &&
                  'Your application is under review. We will notify you once it is processed.'}
                {existingApplication.status === 'approved' &&
                  'Congratulations! Your application has been approved.'}
                {existingApplication.status === 'rejected' && existingApplication.rejection_reason
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Header */}
        <View className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
          <TouchableOpacity onPress={onBack} className="-ml-2 p-2" activeOpacity={0.7}>
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <Text
            className="ml-2 font-semibold text-xl text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Apply for Worker
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
