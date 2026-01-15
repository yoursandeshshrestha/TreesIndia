import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import BackIcon from '../../components/icons/BackIcon';
import DeleteConfirmationBottomSheet from './components/DeleteConfirmationBottomSheet';
import { userService } from '../../services';

interface AccountSettingsScreenProps {
  onBack: () => void;
}

export default function AccountSettingsScreen({ onBack }: AccountSettingsScreenProps) {
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
          Account
        </Text>
      </View>

      <ScrollView className="flex-1 bg-[#F9FAFB]">
        <View className="px-6 pt-6 pb-8">
          <Text
            className="text-2xl font-semibold text-[#111928] mb-1"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Account
          </Text>
          <Text
            className="text-base text-[#6B7280] mb-6"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Manage your account settings
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
          <View className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <View className="flex-row items-center">
              <View className="flex-1 mr-4">
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
                className="bg-[#DC2626] rounded-lg px-4 py-3"
                activeOpacity={0.7}
              >
                <Text
                  className="text-base font-semibold text-white"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Delete Account
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

