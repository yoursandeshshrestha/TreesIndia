import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Note: Install expo-image-picker: npx expo install expo-image-picker
// @ts-ignore - expo-image-picker needs to be installed
import * as ImagePicker from 'expo-image-picker';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { getCurrentUser, updateAvatar } from '../../store/slices/authSlice';
import { userService, type UserProfile } from '../../services';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import BackIcon from '../../components/icons/BackIcon';
import AvatarPicker from './components/AvatarPicker';
import GenderSelector from './components/GenderSelector';

interface EditProfileScreenProps {
  onBack: () => void;
}

export default function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setGender((profile.gender as 'male' | 'female') || 'male');
      setAvatarUrl(profile.avatar || null);
    } else if (user) {
      // Fallback to auth user data
      setName(user.name || '');
      setEmail(user.email || '');
      setGender('male');
    }
  }, [profile, user]);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profileData = await userService.getUserProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Continue with auth user data if profile load fails
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    try {
      await userService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        gender: gender,
      });

      // Refresh user data
      await dispatch(getCurrentUser()).unwrap();
      
      // Reload profile to get updated data
      await loadUserProfile();

      Alert.alert('Success', 'Profile updated successfully!');
      onBack();
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.status === 409
          ? 'This email is already registered'
          : 'Failed to update profile. Please try again.';
      
      if (error?.status === 409) {
        setErrors({ email: 'This email is already registered' });
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photos to upload a profile picture.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploadingAvatar(true);

        try {
          const response = await userService.uploadAvatar(
            asset.uri,
            asset.fileName || 'avatar.jpg'
          );

          // Update avatar URL from response
          if (response.avatar) {
            setAvatarUrl(response.avatar);
            // Immediately update Redux state with new avatar
            dispatch(updateAvatar(response.avatar));
          }

          // Refresh user data in Redux to ensure everything is in sync
          await dispatch(getCurrentUser()).unwrap();

          // Reload profile to get updated avatar
          await loadUserProfile();

          Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error: any) {
          const errorMessage =
            error?.message || 'Failed to upload avatar. Please try again.';
          Alert.alert('Error', errorMessage);
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text
            className="text-base text-[#6B7280]"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header - Fixed at top */}
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
            Edit Profile
          </Text>
        </View>

        <View className="flex-1">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 pt-6">
              {/* Avatar Section */}
              <View className="items-center mb-8">
                <AvatarPicker
                  avatarUrl={avatarUrl}
                  name={name}
                  isLoading={isUploadingAvatar}
                  onPress={handlePickImage}
                />
              </View>

              {/* Profile Information Section */}
              <View className="mb-6">
                {/* Full Name Field */}
                <View className="mb-6">
                  <Input
                    label="Full Name"
                    value={name}
                    onChangeText={(text: string) => {
                      setName(text);
                      if (errors.name) {
                        setErrors({ ...errors, name: undefined });
                      }
                    }}
                    placeholder="Enter your full name"
                    error={errors.name}
                    required
                  />
                </View>

                {/* Email Field */}
                <View className="mb-6">
                  <Input
                    label="Email Address"
                    value={email}
                    onChangeText={(text: string) => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    required
                  />
                </View>

                {/* Gender Selection */}
                <View className="mb-6">
                  <Text
                    className="text-sm font-medium text-[#111928] mb-2"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Gender
                  </Text>
                  <GenderSelector
                    selectedGender={gender}
                    onGenderChange={setGender}
                  />
                </View>

                {/* Phone Number Field (Read-only) */}
                <View className="mb-6">
                  <View>
                    <Text
                      className="text-sm font-medium text-[#111928] mb-2"
                      style={{
                        fontFamily: 'Inter-Medium',
                        lineHeight: 18,
                        ...(Platform.OS === 'android' && { includeFontPadding: false }),
                      }}
                    >
                      Phone Number
                    </Text>
                    <View
                      className="border border-[#E5E7EB] rounded-lg px-4 bg-[#F9FAFB]"
                      style={{
                        minHeight: 48,
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        className="text-base text-[#6B7280]"
                        style={{
                          fontFamily: 'Inter-Regular',
                          paddingVertical: Platform.OS === 'ios' ? 14 : 12,
                          lineHeight: Platform.OS === 'ios' ? 20 : 22,
                          textAlignVertical: 'center',
                          ...(Platform.OS === 'android' && { includeFontPadding: false }),
                        }}
                      >
                        {profile?.phone || user?.phone || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              
            </View>
          </ScrollView>

          {/* Update Button - Fixed at bottom */}
          <View className="px-6 pb-4 bg-white border-t border-[#E5E7EB]" style={{ paddingTop: 12 }}>
            <Button
              label="Update Profile"
              onPress={handleUpdateProfile}
              isLoading={isUpdating}
              disabled={isUpdating || isUploadingAvatar}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
