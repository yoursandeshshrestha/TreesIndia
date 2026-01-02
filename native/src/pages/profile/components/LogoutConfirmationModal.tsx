import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Button from '../../../components/ui/Button';
import LogoutIcon from '../../../components/icons/LogoutIcon';

interface LogoutConfirmationModalProps {
  visible: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmationModal({
  visible,
  isLoading = false,
  onConfirm,
  onCancel,
}: LogoutConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
              {/* Icon */}
              <View className="w-20 h-20 rounded-full bg-[#FEE2E2] items-center justify-center self-center mb-4">
                <LogoutIcon size={36} color="#DC2626" />
              </View>

              {/* Title */}
              <Text
                className="text-xl font-semibold text-[#111928] text-center mb-6"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Are you sure you want to logout?
              </Text>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={onCancel}
                    disabled={isLoading}
                    className="px-4 rounded-lg border border-[#6B7280] items-center justify-center"
                    style={{ minHeight: 48 }}
                    activeOpacity={0.8}
                  >
                    <Text
                      className="text-base font-medium text-[#6B7280]"
                      style={{
                        fontFamily: 'Inter-Medium',
                        lineHeight: 22,
                        textAlignVertical: 'center',
                        ...(Platform.OS === 'android' && { includeFontPadding: false }),
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <Button
                    label="Logout"
                    onPress={onConfirm}
                    isLoading={isLoading}
                    disabled={isLoading}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

