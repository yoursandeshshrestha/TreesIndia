import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  Alert,
  Animated,
  Easing,
} from 'react-native';
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
  const [isClosing, setIsClosing] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    onClose();
  };

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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Overlay */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: overlayOpacity,
          }}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '90%',
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}
        >
          <SafeAreaView edges={['bottom']} className="flex-1">
            {/* Header */}
            <View className="border-b border-[#E5E7EB]">
              <View className="px-4 py-4 flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={handleClose}
                  className="p-2 -ml-2"
                  activeOpacity={0.7}
                  disabled={isClosing}
                >
                  <Text className="text-2xl">×</Text>
                </TouchableOpacity>
                <Text
                  className="text-lg font-semibold text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Worker Details
                </Text>
                <View className="w-10" />
              </View>
            </View>

            {/* Content */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Profile Image */}
              <View className="items-center py-6 border-b border-[#E5E7EB]">
                <View
                  className="relative mb-4"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    overflow: 'hidden',
                  }}
                >
                  {worker.profile_pic ? (
                    <ImageWithSkeleton
                      source={{ uri: worker.profile_pic }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-[#F3F4F6] items-center justify-center">
                      <NotFoundIcon size={48} color="#9CA3AF" />
                    </View>
                  )}
                  {/* Verified Badge */}
                  {worker.is_verified && (
                    <View
                      className="absolute bottom-0 right-0 bg-[#00a871] rounded-full p-2"
                      style={{
                        borderWidth: 3,
                        borderColor: 'white',
                      }}
                    >
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </View>

                {/* Name */}
                <Text
                  className="text-2xl font-semibold text-[#111928] mb-2"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  {worker.name || 'Unknown Worker'}
                </Text>

                {/* Experience and Rating */}
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <TimeIcon size={16} color="#6B7280" />
                    <Text
                      className="text-sm text-[#6B7280]"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      {getExperienceText()} experience
                    </Text>
                  </View>
                  {worker.rating !== undefined && worker.rating > 0 && (
                    <>
                      <Text className="text-[#E5E7EB]">•</Text>
                      <View className="flex-row items-center" style={{ gap: 4 }}>
                        <StarIcon size={16} color="#F59E0B" />
                        <Text
                          className="text-sm font-medium text-[#111928]"
                          style={{ fontFamily: 'Inter-Medium' }}
                        >
                          {worker.rating.toFixed(1)}
                        </Text>
                      </View>
                    </>
                  )}
                  {worker.total_jobs !== undefined && worker.total_jobs > 0 && (
                    <>
                      <Text className="text-[#E5E7EB]">•</Text>
                      <Text
                        className="text-sm text-[#6B7280]"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {worker.total_jobs} {worker.total_jobs === 1 ? 'job' : 'jobs'}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Skills Section */}
              {worker.skills && worker.skills.length > 0 && (
                <View className="mb-6 pt-6 pb-6 border-b border-[#E5E7EB]">
                  <View className="px-6">
                    <View className="flex-row items-center mb-4">
                      <CategoryIcon size={20} color="#111928" />
                      <Text
                        className="text-xl font-semibold text-[#111928] ml-2"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        Skills & Expertise
                      </Text>
                    </View>
                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                      {worker.skills.map((skill, index) => (
                        <View
                          key={index}
                          className="bg-[#F3F4F6] rounded-lg px-3 py-2"
                        >
                          <Text
                            className="text-sm text-[#111928]"
                            style={{ fontFamily: 'Inter-Medium' }}
                          >
                            {skill}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Location Section */}
              <View className="mb-6 pb-6 border-b border-[#E5E7EB]">
                <View className="px-6">
                  <View className="flex-row items-center mb-3">
                    <LocationIcon size={20} color="#111928" />
                    <Text
                      className="text-xl font-semibold text-[#111928] ml-2"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Location
                    </Text>
                  </View>
                  <Text
                    className="text-base text-[#374151]"
                    style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
                  >
                    {worker.address?.street && `${worker.address.street}, `}
                    {worker.address?.city || 'N/A'}
                    {worker.address?.state && `, ${worker.address.state}`}
                    {worker.address?.pincode && ` - ${worker.address.pincode}`}
                  </Text>
                  {worker.address?.landmark && (
                    <Text
                      className="text-sm text-[#6B7280] mt-1"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Near {worker.address.landmark}
                    </Text>
                  )}
                </View>
              </View>

              <View className="px-6">

                {/* Contact Person */}
                <View className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-6">
                  <Text
                    className="text-sm font-semibold text-[#6B7280] mb-3"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    Contact Person
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <ProfileIcon size={16} color="#111928" />
                    <Text
                      className="text-base text-[#111928] ml-2"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      {worker.name || 'N/A'}
                    </Text>
                  </View>
                  {worker.phone && (
                    <View className="flex-row items-center mb-2">
                      <PhoneIcon size={16} color="#111928" />
                      <Text
                        className="text-base text-[#111928] ml-2"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {worker.phone}
                      </Text>
                    </View>
                  )}
                  {worker.email && (
                    <View className="flex-row items-center">
                      <MailIcon size={16} color="#111928" />
                      <Text
                        className="text-base text-[#111928] ml-2"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {worker.email}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Professional Warning Message */}
                <View className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mb-6">
                  <View className="border-b border-[#E5E7EB]">
                    <View className="px-4 py-3">
                      <View className="flex-row items-center">
                        <InfoIcon size={18} color="#111928" />
                        <Text
                          className="text-sm font-semibold text-[#111928] ml-2"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          Important Notice
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="px-4 py-3">
                    <View className="flex-row items-start mb-2">
                      <View
                        className="w-1 h-1 rounded-full bg-[#9CA3AF]"
                        style={{ marginTop: 8, marginRight: 12 }}
                      />
                      <Text
                        className="flex-1 text-sm text-[#374151]"
                        style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
                      >
                        Use contact information responsibly for genuine work inquiries only
                      </Text>
                    </View>
                    <View className="flex-row items-start mb-2">
                      <View
                        className="w-1 h-1 rounded-full bg-[#9CA3AF]"
                        style={{ marginTop: 8, marginRight: 12 }}
                      />
                      <Text
                        className="flex-1 text-sm text-[#374151]"
                        style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
                      >
                        Spam, harassment, or misuse of contact details is strictly prohibited
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <View
                        className="w-1 h-1 rounded-full bg-[#9CA3AF]"
                        style={{ marginTop: 8, marginRight: 12 }}
                      />
                      <Text
                        className="flex-1 text-sm text-[#374151]"
                        style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
                      >
                        Reported users face immediate account suspension without prior notice
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Contact Button */}
            <View className="px-6 pb-4 pt-2 border-t border-[#E5E7EB] bg-white">
              <TouchableOpacity
                onPress={handleCall}
                className="bg-[#055c3a] rounded-lg py-3.5 items-center flex-row justify-center"
                activeOpacity={0.7}
                style={{ gap: 8 }}
              >
                <PhoneIcon size={20} color="#FFFFFF" />
                <Text
                  className="text-white text-base font-semibold"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Contact Worker
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
