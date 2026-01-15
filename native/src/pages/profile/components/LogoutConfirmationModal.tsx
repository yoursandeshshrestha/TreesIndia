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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <TouchableWithoutFeedback>
            <View className="w-full max-w-sm rounded-2xl bg-white p-6">
              {/* Icon */}
              <View className="mb-4 h-20 w-20 items-center justify-center self-center rounded-full bg-[#FEE2E2]">
                <LogoutIcon size={36} color="#DC2626" />
              </View>

              {/* Title */}
              <Text
                className="mb-6 text-center font-semibold text-xl text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Are you sure you want to logout?
              </Text>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={onCancel}
                    disabled={isLoading}
                    className="items-center justify-center rounded-lg border border-[#6B7280] px-4"
                    style={{ minHeight: 48 }}
                    activeOpacity={0.8}>
                    <Text
                      className="font-medium text-base text-[#6B7280]"
                      style={{
                        fontFamily: 'Inter-Medium',
                        lineHeight: 22,
                        textAlignVertical: 'center',
                        ...(Platform.OS === 'android' && { includeFontPadding: false }),
                      }}>
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
