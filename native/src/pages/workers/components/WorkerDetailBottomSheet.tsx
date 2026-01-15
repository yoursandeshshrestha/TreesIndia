import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Linking, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Worker } from '../../../services';
import WorkerIcon from '../../../components/icons/WorkerIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import PhoneIcon from '../../../components/icons/PhoneIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import StarIcon from '../../../components/icons/StarIcon';
import CategoryIcon from '../../../components/icons/CategoryIcon';
import InfoIcon from '../../../components/icons/InfoIcon';
import NotFoundIcon from '../../../components/icons/NotFoundIcon';
import ProfileIcon from '../../../components/icons/ProfileIcon';
import MailIcon from '../../../components/icons/MailIcon';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';

interface WorkerDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  worker: Worker;
  onContact?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkerDetailBottomSheet({
  visible,
  onClose,
  worker,
  onContact,
}: WorkerDetailBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['75%'], []);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const getExperienceText = () => {
    const years = worker.experience_years;
    if (years === 0) {
      return 'Less than 1 year';
    } else if (years === 1) {
      return '1 year';
    }
    return `${years} years`;
  };

  const handleCall = () => {
    if (!worker.phone) {
      Alert.alert('Contact Unavailable', 'Contact information is not available for this worker.');
      return;
    }

    const phoneNumber = `tel:${worker.phone}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneNumber);
        } else {
          Alert.alert('Error', 'Unable to open phone dialer.');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open phone dialer.');
      });

    if (onContact) {
      onContact();
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}>
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-[#E5E7EB]">
          <View className="px-6 py-4">
            <Text
              className="text-center font-semibold text-lg text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Worker Details
            </Text>
          </View>
        </View>

        {/* Content */}
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Profile Image */}
          <View className="items-center border-b border-[#E5E7EB] py-6">
            <View
              className="relative mb-4"
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                overflow: 'hidden',
              }}>
              {worker.profile_pic ? (
                <ImageWithSkeleton
                  source={{ uri: worker.profile_pic }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-[#F3F4F6]">
                  <NotFoundIcon size={48} color="#9CA3AF" />
                </View>
              )}
              {/* Verified Badge */}
              {worker.is_verified && (
                <View
                  className="absolute bottom-0 right-0 rounded-full bg-[#00a871] p-2"
                  style={{
                    borderWidth: 3,
                    borderColor: 'white',
                  }}>
                  <Text className="text-xs text-white">✓</Text>
                </View>
              )}
            </View>

            {/* Name */}
            <Text
              className="mb-2 font-semibold text-2xl text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              {worker.name || 'Unknown Worker'}
            </Text>

            {/* Experience and Rating */}
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <TimeIcon size={16} color="#6B7280" />
                <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                  {getExperienceText()} experience
                </Text>
              </View>
              {worker.rating !== undefined && worker.rating > 0 && (
                <>
                  <Text className="text-[#E5E7EB]">•</Text>
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <StarIcon size={16} color="#F59E0B" />
                    <Text
                      className="font-medium text-sm text-[#111928]"
                      style={{ fontFamily: 'Inter-Medium' }}>
                      {worker.rating.toFixed(1)}
                    </Text>
                  </View>
                </>
              )}
              {worker.total_jobs !== undefined && worker.total_jobs > 0 && (
                <>
                  <Text className="text-[#E5E7EB]">•</Text>
                  <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                    {worker.total_jobs} {worker.total_jobs === 1 ? 'job' : 'jobs'}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Skills Section */}
          {worker.skills && worker.skills.length > 0 && (
            <View className="mb-6 border-b border-[#E5E7EB] pb-6 pt-6">
              <View className="px-6">
                <View className="mb-4 flex-row items-center">
                  <CategoryIcon size={20} color="#111928" />
                  <Text
                    className="ml-2 font-semibold text-xl text-[#111928]"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    Skills & Expertise
                  </Text>
                </View>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {worker.skills.map((skill, index) => (
                    <View key={index} className="rounded-lg bg-[#F3F4F6] px-3 py-2">
                      <Text
                        className="text-sm text-[#111928]"
                        style={{ fontFamily: 'Inter-Medium' }}>
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Location Section */}
          <View className="mb-6 border-b border-[#E5E7EB] pb-6">
            <View className="px-6">
              <View className="mb-3 flex-row items-center">
                <LocationIcon size={20} color="#111928" />
                <Text
                  className="ml-2 font-semibold text-xl text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Location
                </Text>
              </View>
              <Text
                className="text-base text-[#374151]"
                style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}>
                {worker.address?.street && `${worker.address.street}, `}
                {worker.address?.city || 'N/A'}
                {worker.address?.state && `, ${worker.address.state}`}
                {worker.address?.pincode && ` - ${worker.address.pincode}`}
              </Text>
              {worker.address?.landmark && (
                <Text
                  className="mt-1 text-sm text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Near {worker.address.landmark}
                </Text>
              )}
            </View>
          </View>

          <View className="px-6">
            {/* Contact Person */}
            <View className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-4">
              <Text
                className="mb-3 font-semibold text-sm text-[#6B7280]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Contact Person
              </Text>
              <View className="mb-2 flex-row items-center">
                <ProfileIcon size={16} color="#111928" />
                <Text
                  className="ml-2 text-base text-[#111928]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  {worker.name || 'N/A'}
                </Text>
              </View>
              {worker.phone && (
                <View className="mb-2 flex-row items-center">
                  <PhoneIcon size={16} color="#111928" />
                  <Text
                    className="ml-2 text-base text-[#111928]"
                    style={{ fontFamily: 'Inter-Regular' }}>
                    {worker.phone}
                  </Text>
                </View>
              )}
              {worker.email && (
                <View className="flex-row items-center">
                  <MailIcon size={16} color="#111928" />
                  <Text
                    className="ml-2 text-base text-[#111928]"
                    style={{ fontFamily: 'Inter-Regular' }}>
                    {worker.email}
                  </Text>
                </View>
              )}
            </View>

            {/* Professional Warning Message */}
            <View className="mb-6 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
              <View className="border-b border-[#E5E7EB]">
                <View className="px-4 py-3">
                  <View className="flex-row items-center">
                    <InfoIcon size={18} color="#111928" />
                    <Text
                      className="ml-2 font-semibold text-sm text-[#111928]"
                      style={{ fontFamily: 'Inter-SemiBold' }}>
                      Important Notice
                    </Text>
                  </View>
                </View>
              </View>
              <View className="px-4 py-3">
                <View className="mb-2 flex-row items-start">
                  <View
                    className="h-1 w-1 rounded-full bg-[#9CA3AF]"
                    style={{ marginTop: 8, marginRight: 12 }}
                  />
                  <Text
                    className="flex-1 text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}>
                    Use contact information responsibly for genuine work inquiries only
                  </Text>
                </View>
                <View className="mb-2 flex-row items-start">
                  <View
                    className="h-1 w-1 rounded-full bg-[#9CA3AF]"
                    style={{ marginTop: 8, marginRight: 12 }}
                  />
                  <Text
                    className="flex-1 text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}>
                    Spam, harassment, or misuse of contact details is strictly prohibited
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View
                    className="h-1 w-1 rounded-full bg-[#9CA3AF]"
                    style={{ marginTop: 8, marginRight: 12 }}
                  />
                  <Text
                    className="flex-1 text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}>
                    Reported users face immediate account suspension without prior notice
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </BottomSheetScrollView>

        {/* Contact Button */}
        <SafeAreaView edges={['bottom']} className="border-t border-[#E5E7EB] bg-white">
          <View className="px-6 py-4">
            <TouchableOpacity
              onPress={handleCall}
              className="flex-row items-center justify-center rounded-lg bg-[#055c3a] py-3.5"
              activeOpacity={0.7}
              style={{ gap: 8 }}>
              <PhoneIcon size={20} color="#FFFFFF" />
              <Text
                className="font-semibold text-base text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Contact Worker
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </BottomSheetModal>
  );
}
