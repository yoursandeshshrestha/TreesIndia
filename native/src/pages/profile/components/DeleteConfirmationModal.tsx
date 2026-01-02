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
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-xl p-6 mx-6 w-full max-w-sm">
          {/* Warning Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-[#FEE2E2] items-center justify-center">
              <Text className="text-3xl">⚠️</Text>
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-lg font-semibold text-[#111928] mb-3 text-center"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Delete Address
          </Text>

          {/* Description */}
          <Text
            className="text-sm text-[#4B5563] mb-6 text-center leading-5"
            style={{
              fontFamily: 'Inter-Regular',
              ...(Platform.OS === 'android' && { includeFontPadding: false }),
            }}
          >
            Are you sure you want to delete this address? This action cannot be undone.
          </Text>

          {/* Action Buttons */}
          <View className="flex-row">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 border border-[#D1D5DB] rounded-lg py-3 mr-2"
              activeOpacity={0.7}
            >
              <Text
                className="text-base font-semibold text-[#374151] text-center"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-[#B3261E] rounded-lg py-3 ml-2"
              activeOpacity={0.7}
            >
              <Text
                className="text-base font-semibold text-white text-center"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


