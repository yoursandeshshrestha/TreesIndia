import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import BackIcon from '../../components/icons/BackIcon';
import DeleteConfirmationBottomSheet from './components/DeleteConfirmationBottomSheet';
import OtpBottomSheet from './components/OtpBottomSheet';
import { userService } from '../../services';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const dispatch = useAppDispatch();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showOtpSheet, setShowOtpSheet] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const policyItems = [
    "You'll no longer be able to access your saved professionals",
    'Your customer rating will be reset',
    'All your memberships will be cancelled',
    "You'll not be able to claim under any active warranty or insurance",
    'The changes are irreversible',
  ];

  const handleDeleteAccountPress = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmation(false);
    setIsRequestingOtp(true);

    try {
      const response = await userService.requestDeleteOTP();
      setPhoneNumber(response.phone);
      setIsRequestingOtp(false);
      setShowOtpSheet(true);
    } catch (error: any) {
      setIsRequestingOtp(false);
      Alert.alert(
        'Error',
        error?.message || 'Failed to request OTP. Please try again.'
      );
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    setIsDeleting(true);

    try {
      await userService.deleteAccount(otp);
      setShowOtpSheet(false);
      setIsDeleting(false);
      
      // Logout user after successful deletion
      await dispatch(logout()).unwrap();
      
      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      setIsDeleting(false);
      Alert.alert(
        'Error',
        error?.message || 'Failed to delete account. Please try again.'
      );
    }
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://treesindiaservices.com/terms-and-conditions').catch((err) =>
      console.error('Failed to open terms:', err)
    );
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://treesindiaservices.com/privacy-policy').catch((err) =>
      console.error('Failed to open privacy policy:', err)
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <TouchableOpacity
          onPress={onBack}
          className="p-2 -ml-2"
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#111928" />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold text-[#111928] ml-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 bg-[#F9FAFB]">
        <View className="px-6 pt-6 pb-8">
          <Text
            className="text-2xl font-semibold text-[#111928] mb-1"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Settings
          </Text>
          <Text
            className="text-base text-[#6B7280] mb-6"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Manage your account preferences and privacy
          </Text>

          {/* Account Deletion Policy */}
          <View className="bg-white rounded-xl border border-[#E5E7EB] mb-4 overflow-hidden">
            <View className="px-4 py-4 border-b border-[#E5E7EB]">
              <Text
                className="text-base font-semibold text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Account Deletion Policy
              </Text>
            </View>
            <View className="px-4 py-4">
              {policyItems.map((item, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <View
                    className="w-1 h-1 rounded-full bg-[#9CA3AF] mt-2 mr-3"
                    style={{ marginTop: 8 }}
                  />
                  <Text
                    className="flex-1 text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Delete Account Section */}
          <View className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
            <View className="mb-4">
              <Text
                className="text-base font-semibold text-[#111928] mb-1"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Delete Account
              </Text>
              <Text
                className="text-sm text-[#6B7280]"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                Permanently delete your account and all associated data
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDeleteAccountPress}
              className="bg-[#DC2626] rounded-lg py-2.5 px-4 items-center self-start"
              activeOpacity={0.7}
            >
              <Text
                className="text-sm font-semibold text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal Information */}
          <View className="bg-white rounded-xl border border-[#E5E7EB]">
            <View className="px-4 py-4 border-b border-[#E5E7EB]">
              <Text
                className="text-base font-semibold text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Legal Information
              </Text>
            </View>
            <View className="px-4 py-4">
              <TouchableOpacity
                onPress={handleOpenTerms}
                className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-4 mb-3"
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-semibold text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Terms and Conditions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOpenPrivacy}
                className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-4"
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-semibold text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete Confirmation Bottom Sheet */}
      <DeleteConfirmationBottomSheet
        visible={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isRequestingOtp}
      />

      {/* OTP Bottom Sheet */}
      <OtpBottomSheet
        visible={showOtpSheet}
        onClose={() => setShowOtpSheet(false)}
        phoneNumber={phoneNumber}
        onSubmit={handleOtpSubmit}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
}

