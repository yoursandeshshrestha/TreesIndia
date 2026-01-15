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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { getWorkerProfile, updateWorkerProfile } from '../../store/slices/authSlice';
import type { Address, CreateAddressRequest } from '../../services';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import BackIcon from '../../components/icons/BackIcon';
import AddressIcon from '../../components/icons/AddressIcon';
import AddEditAddressBottomSheet from './components/AddEditAddressBottomSheet';
import EditIcon from '../../components/icons/EditIcon';

interface EditWorkerProfileScreenProps {
  onBack: () => void;
}

type Step = 'contact' | 'address' | 'skills' | 'banking' | 'review';

interface FormData {
  contactInfo: {
    alternative_number: string;
  };
  address: Address | null;
  skills: string[];
  experienceYears: string;
  bankingInfo: {
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    bank_name: string;
  };
}

export default function EditWorkerProfileScreen({ onBack }: EditWorkerProfileScreenProps) {
  const dispatch = useAppDispatch();
  const { workerProfile } = useAppSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState<Step>('contact');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  // Form data
  const [formData, setFormData] = useState<FormData>({
    contactInfo: {
      alternative_number: '',
    },
    address: null,
    skills: [],
    experienceYears: '',
    bankingInfo: {
      account_holder_name: '',
      account_number: '',
      ifsc_code: '',
      bank_name: '',
    },
  });

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

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: { id: Step; title: string }[] = [
    { id: 'contact', title: 'Contact Information' },
    { id: 'address', title: 'Address' },
    { id: 'skills', title: 'Skills & Experience' },
    { id: 'banking', title: 'Banking Information' },
    { id: 'review', title: 'Review & Update' },
  ];

  useEffect(() => {
    loadWorkerProfile();
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

  const loadWorkerProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await dispatch(getWorkerProfile()).unwrap();

      if (profile) {
        const newFormData = {
          contactInfo: {
            alternative_number:
              profile.alternative_number || profile.contact_info?.alternative_number || '',
          },
          address: profile.address
            ? {
                id: 0,
                name: '',
                house_number: '',
                street: profile.address.street || '',
                city: profile.address.city || '',
                state: profile.address.state || '',
                pincode: profile.address.pincode || '',
                landmark: profile.address.landmark || '',
                lat: profile.address.lat,
                lng: profile.address.lng,
              }
            : null,
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          experienceYears: profile.experience_years?.toString() || '0',
          bankingInfo: profile.banking_info
            ? {
                account_holder_name: profile.banking_info.account_holder_name || '',
                account_number: profile.banking_info.account_number || '',
                ifsc_code: profile.banking_info.ifsc_code || '',
                bank_name: profile.banking_info.bank_name || '',
              }
            : {
                account_holder_name: '',
                account_number: '',
                ifsc_code: '',
                bank_name: '',
              },
        };

        setFormData(newFormData);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load worker profile');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 'contact':
        if (
          formData.contactInfo.alternative_number &&
          formData.contactInfo.alternative_number.length < 10
        ) {
          newErrors.alternative_number = 'Alternative number must be at least 10 digits';
        }
        break;

      case 'address':
        if (!formData.address) {
          newErrors.address = 'Address is required';
        }
        break;

      case 'skills':
        if (formData.skills.length === 0) {
          newErrors.skills = 'At least one skill is required';
        }
        if (!formData.experienceYears) {
          newErrors.experience_years = 'Experience years is required';
        } else if (
          parseInt(formData.experienceYears) < 0 ||
          parseInt(formData.experienceYears) > 70
        ) {
          newErrors.experience_years = 'Experience must be between 0 and 70 years';
        }
        break;

      case 'banking':
        if (!formData.bankingInfo.account_holder_name) {
          newErrors.account_holder_name = 'Account holder name is required';
        }
        if (!formData.bankingInfo.account_number) {
          newErrors.account_number = 'Account number is required';
        }
        if (!formData.bankingInfo.ifsc_code) {
          newErrors.ifsc_code = 'IFSC code is required';
        } else if (formData.bankingInfo.ifsc_code.length !== 11) {
          newErrors.ifsc_code = 'IFSC code must be 11 characters';
        }
        if (!formData.bankingInfo.bank_name) {
          newErrors.bank_name = 'Bank name is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!formData.address) {
      Alert.alert('Error', 'Address is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData = {
        contact_info: {
          alternative_number: formData.contactInfo.alternative_number,
        },
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          pincode: formData.address.pincode,
          landmark: formData.address.landmark,
          lat: formData.address.lat,
          lng: formData.address.lng,
        },
        skills: formData.skills,
        experience_years: parseInt(formData.experienceYears),
        banking_info: {
          account_number: formData.bankingInfo.account_number,
          ifsc_code: formData.bankingInfo.ifsc_code.toUpperCase(),
          bank_name: formData.bankingInfo.bank_name,
          account_holder_name: formData.bankingInfo.account_holder_name,
        },
      };

      await dispatch(updateWorkerProfile(updateData)).unwrap();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => onBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()],
      }));
      setCustomSkill('');
    }
  };

  const handleAddressSave = (address: CreateAddressRequest) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        id: 0,
        name: address.name || '',
        house_number: address.house_number || '',
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
        lat: address.lat,
        lng: address.lng,
      },
    }));
    setShowAddressSheet(false);
    setErrors((prev) => ({ ...prev, address: '' }));
  };

  const renderStepIndicator = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);

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
          <Text
            className="font-semibold text-lg text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            {steps[currentIndex].title}
          </Text>
        </View>
      </View>
    );
  };

  const renderContactInfo = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Contact Information
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Update your contact details
      </Text>

      <View className="mb-4">
        <Input
          label="Alternative Phone Number"
          value={formData.contactInfo.alternative_number}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              contactInfo: { alternative_number: text },
            }))
          }
          placeholder="Enter alternative phone number"
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.alternative_number}
        />
        <Text className="mt-1 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
          Optional - Provide an alternative contact number
        </Text>
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
        Update your residential address
      </Text>

      {formData.address ? (
        <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1">
              <Text
                className="font-semibold text-sm text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                {formData.address.street}
              </Text>
              <Text className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                {formData.address.city}, {formData.address.state} - {formData.address.pincode}
              </Text>
              {formData.address.landmark && (
                <Text
                  className="mt-1 text-xs text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Landmark: {formData.address.landmark}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowAddressSheet(true)}
              className="p-2"
              activeOpacity={0.7}>
              <EditIcon size={20} color="#055c3a" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAddressSheet(true)}
          className="mb-4 items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white p-6"
          activeOpacity={0.7}>
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6]">
            <AddressIcon size={24} color="#6B7280" />
          </View>
          <Text
            className="mb-1 font-medium text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-Medium' }}>
            Add Address
          </Text>
          <Text
            className="text-center text-xs text-[#6B7280]"
            style={{ fontFamily: 'Inter-Regular' }}>
            Tap to add your residential address
          </Text>
        </TouchableOpacity>
      )}

      {errors.address && (
        <Text className="mt-2 text-sm text-[#DC2626]" style={{ fontFamily: 'Inter-Regular' }}>
          {errors.address}
        </Text>
      )}
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
        Update your experience and skills
      </Text>

      <View className="mb-4">
        <Input
          label="Years of Experience"
          value={formData.experienceYears}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, experienceYears: text }))}
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
              const isSelected = formData.skills.includes(skill);
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
        {formData.skills.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
              Selected skills:
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {formData.skills.map((skill) => (
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
        <View className="mb-8 mt-4">
          <Text className="mb-2 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Or add a custom skill:
          </Text>
          <View className="flex-row" style={{ gap: 8 }}>
            <View className="flex-1">
              <Input
                value={customSkill}
                onChangeText={setCustomSkill}
                placeholder="Enter custom skill"
              />
            </View>
            <Button
              label="Add"
              onPress={handleAddCustomSkill}
              disabled={!customSkill.trim()}
              className="px-6"
            />
          </View>
        </View>

        {errors.skills && (
          <Text className="mt-2 text-sm text-[#DC2626]" style={{ fontFamily: 'Inter-Regular' }}>
            {errors.skills}
          </Text>
        )}
      </View>
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
        Update your banking details for payments
      </Text>

      <View className="mb-4">
        <Input
          label="Account Holder Name"
          value={formData.bankingInfo.account_holder_name}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              bankingInfo: { ...prev.bankingInfo, account_holder_name: text },
            }))
          }
          placeholder="Enter account holder name"
          error={errors.account_holder_name}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Account Number"
          value={formData.bankingInfo.account_number}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              bankingInfo: { ...prev.bankingInfo, account_number: text },
            }))
          }
          placeholder="Enter account number"
          keyboardType="number-pad"
          error={errors.account_number}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="IFSC Code"
          value={formData.bankingInfo.ifsc_code}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              bankingInfo: {
                ...prev.bankingInfo,
                ifsc_code: text.toUpperCase(),
              },
            }))
          }
          placeholder="Enter IFSC code"
          maxLength={11}
          autoCapitalize="characters"
          error={errors.ifsc_code}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Bank Name"
          value={formData.bankingInfo.bank_name}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              bankingInfo: { ...prev.bankingInfo, bank_name: text },
            }))
          }
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
        Review Your Changes
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Please review your information before updating
      </Text>

      {/* Contact Info */}
      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Contact Information
        </Text>
        <View className="mb-2">
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Alternative Number
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.contactInfo.alternative_number || 'Not provided'}
          </Text>
        </View>
      </View>

      {/* Address */}
      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Address
        </Text>
        {formData.address && (
          <>
            <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Regular' }}>
              {formData.address.street}
            </Text>
            <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
              {formData.address.city}, {formData.address.state} - {formData.address.pincode}
            </Text>
          </>
        )}
      </View>

      {/* Skills & Experience */}
      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Skills & Experience
        </Text>
        <View className="mb-3">
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Experience
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.experienceYears} years
          </Text>
        </View>
        <View>
          <Text className="mb-2 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Skills
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {formData.skills.map((skill) => (
              <View key={skill} className="rounded-lg bg-[#F3F4F6] px-3 py-1">
                <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Regular' }}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Banking Info */}
      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Banking Information
        </Text>
        <View className="mb-2">
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Account Holder
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.bankingInfo.account_holder_name}
          </Text>
        </View>
        <View className="mb-2">
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Account Number
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.bankingInfo.account_number}
          </Text>
        </View>
        <View className="mb-2">
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            IFSC Code
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.bankingInfo.ifsc_code}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Bank Name
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.bankingInfo.bank_name}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'contact':
        return renderContactInfo();
      case 'address':
        return renderAddress();
      case 'skills':
        return renderSkills();
      case 'banking':
        return renderBanking();
      case 'review':
        return renderReview();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text className="mt-4 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Loading profile...
          </Text>
        </View>
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
            Edit Worker Profile
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
          className={`border-t border-[#E5E7EB] bg-white px-6 pt-4 ${
            isKeyboardVisible ? 'pb-4' : 'pb-12'
          }`}>
          <View className="flex-row" style={{ gap: 12 }}>
            {currentStep !== 'contact' && (
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
                  label={isSubmitting ? 'Updating...' : 'Update Profile'}
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
          address={formData.address}
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
