import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import BackIcon from '../../components/icons/BackIcon';
import DeleteConfirmationBottomSheet from './components/DeleteConfirmationBottomSheet';
import { userService } from '../../services';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const dispatch = useAppDispatch();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);

    try {
      await userService.deleteAccount();
      setIsDeleting(false);

      // Logout user after successful deletion
      await dispatch(logout()).unwrap();

      Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
        { text: 'OK' },
      ]);
    } catch (error: unknown) {
      setIsDeleting(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete account. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://treesindiaservices.com/terms-and-conditions').catch(() => {
      // Failed to open terms
    });
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://treesindiaservices.com/privacy-policy').catch(() => {
      // Failed to open privacy policy
    });
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
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 bg-[#F9FAFB]">
        <View className="px-6 pb-8 pt-6">
          <Text
            className="mb-1 font-semibold text-2xl text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Settings
          </Text>
          <Text className="mb-6 text-base text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Manage your account preferences and privacy
          </Text>

          {/* Account Deletion Policy */}
          <View className="mb-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <View className="border-b border-[#E5E7EB] px-4 py-4">
              <Text
                className="font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Account Deletion Policy
              </Text>
            </View>
            <View className="px-4 py-4">
              {policyItems.map((item, index) => (
                <View key={index} className="mb-2 flex-row items-start">
                  <View
                    className="mr-3 mt-2 h-1 w-1 rounded-full bg-[#9CA3AF]"
                    style={{ marginTop: 8 }}
                  />
                  <Text
                    className="flex-1 text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Delete Account Section */}
          <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
            <View className="mb-4">
              <Text
                className="mb-1 font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Delete Account
              </Text>
              <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                Permanently delete your account and all associated data
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDeleteAccountPress}
              className="items-center self-start rounded-lg bg-[#DC2626] px-4 py-2.5"
              activeOpacity={0.7}>
              <Text
                className="font-semibold text-sm text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal Information */}
          <View className="rounded-xl border border-[#E5E7EB] bg-white">
            <View className="border-b border-[#E5E7EB] px-4 py-4">
              <Text
                className="font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Legal Information
              </Text>
            </View>
            <View className="px-4 py-4">
              <TouchableOpacity
                onPress={handleOpenTerms}
                className="mb-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                activeOpacity={0.7}>
                <Text
                  className="font-semibold text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Terms and Conditions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOpenPrivacy}
                className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                activeOpacity={0.7}>
                <Text
                  className="font-semibold text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
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
        isLoading={isDeleting}
      />
    </SafeAreaView>
  );
}
