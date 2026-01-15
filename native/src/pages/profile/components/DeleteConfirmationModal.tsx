import React from 'react';
import { View, Text, Modal, TouchableOpacity, Platform } from 'react-native';

interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="mx-6 w-full max-w-sm rounded-xl bg-white p-6">
          {/* Warning Icon */}
          <View className="mb-4 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2]">
              <Text className="text-3xl">⚠️</Text>
            </View>
          </View>

          {/* Title */}
          <Text
            className="mb-3 text-center font-semibold text-lg text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Delete Address
          </Text>

          {/* Description */}
          <Text
            className="mb-6 text-center text-sm leading-5 text-[#4B5563]"
            style={{
              fontFamily: 'Inter-Regular',
              ...(Platform.OS === 'android' && { includeFontPadding: false }),
            }}>
            Are you sure you want to delete this address? This action cannot be undone.
          </Text>

          {/* Action Buttons */}
          <View className="flex-row">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
              className="mr-2 flex-1 rounded-lg border border-[#D1D5DB] py-3"
              activeOpacity={0.7}>
              <Text
                className="text-center font-semibold text-base text-[#374151]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={onConfirm}
              className="ml-2 flex-1 rounded-lg bg-[#B3261E] py-3"
              activeOpacity={0.7}>
              <Text
                className="text-center font-semibold text-base text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
