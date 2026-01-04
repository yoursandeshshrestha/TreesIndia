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
import { type Project } from '../../../services';
import LocationIcon from '../../../components/icons/LocationIcon';
import PhoneIcon from '../../../components/icons/PhoneIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import TypeIcon from '../../../components/icons/TypeIcon';
import CalendarIcon from '../../../components/icons/CalendarIcon';
import NotFoundIcon from '../../../components/icons/NotFoundIcon';
import ProfileIcon from '../../../components/icons/ProfileIcon';
import MailIcon from '../../../components/icons/MailIcon';
import InfoIcon from '../../../components/icons/InfoIcon';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';

interface ProjectDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  project: Project;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProjectDetailBottomSheet({
  visible,
  onClose,
  project,
}: ProjectDetailBottomSheetProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
    setCurrentImageIndex(0);
    onClose();
  };

  const getStatusLabel = () => {
    switch (project.status) {
      case 'on_going':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'starting_soon':
        return 'Starting Soon';
      case 'on_hold':
        return 'On Hold';
      case 'cancelled':
        return 'Cancelled';
      default:
        return project.status;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'on_going':
        return '#00a871';
      case 'completed':
        return '#10B981';
      case 'starting_soon':
        return '#F59E0B';
      case 'on_hold':
        return '#6B7280';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getProjectTypeLabel = () => {
    switch (project.project_type) {
      case 'residential':
        return 'Residential';
      case 'commercial':
        return 'Commercial';
      case 'infrastructure':
        return 'Infrastructure';
      default:
        return project.project_type;
    }
  };

  const getDurationText = () => {
    if (!project.estimated_duration) return null;
    const days = project.estimated_duration;
    if (days < 30) {
      return `${days} days`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(days / 365);
      const remainingMonths = Math.floor((days % 365) / 30);
      if (remainingMonths > 0) {
        return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
      }
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };

  const handleCall = () => {
    if (!project.contact_info?.phone) {
      Alert.alert('Contact Unavailable', 'Contact information is not available for this project.');
      return;
    }

    const phoneNumber = `tel:${project.contact_info.phone}`;
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
  };

  const images = project.images && project.images.length > 0 ? project.images : [];

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
                  Project Details
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
              {/* Image Carousel */}
              {images.length > 0 ? (
                <View className="mb-6">
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                      const imageWidth = SCREEN_WIDTH;
                      const index = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
                      setCurrentImageIndex(index);
                    }}
                  >
                    {images.map((imageUri, index) => (
                      <ImageWithSkeleton
                        key={index}
                        source={{ uri: imageUri }}
                        style={{ width: SCREEN_WIDTH, height: 250 }}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                  {images.length > 1 && (
                    <View className="flex-row justify-center mt-2" style={{ gap: 6 }}>
                      {images.map((_, index) => (
                        <View
                          key={index}
                          className={`h-1.5 rounded-full ${
                            index === currentImageIndex ? 'bg-[#00a871]' : 'bg-[#D1D5DB]'
                          }`}
                          style={{ width: index === currentImageIndex ? 24 : 8 }}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View className="h-[250px] bg-[#F3F4F6] items-center justify-center mb-6">
                  <NotFoundIcon size={64} color="#9CA3AF" />
                  <Text
                    className="text-base text-[#9CA3AF] mt-4"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    No Images Available
                  </Text>
                </View>
              )}

              <View className="px-6">
                {/* Title and Location */}
                <View className="mb-6">
                  <Text
                    className="text-2xl font-semibold text-[#111928] mb-2"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    {project.title}
                  </Text>
                  {project.address && project.address.trim() !== '' ? (
                    <View className="flex-row items-center">
                      <LocationIcon size={18} color="#6B7280" />
                      <Text
                        className="flex-1 text-base text-[#6B7280] underline ml-1"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {project.address}, {project.city}, {project.state}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <LocationIcon size={18} color="#6B7280" />
                      <Text
                        className="flex-1 text-base text-[#6B7280] ml-1"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {project.city}, {project.state}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Status Badge */}
                <View className="mb-6">
                  <View
                    className="self-start px-4 py-2 rounded-full"
                    style={{ backgroundColor: getStatusColor() }}
                  >
                    <Text
                      className="text-sm text-white font-semibold"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      {getStatusLabel()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              {project.description && project.description.trim() !== '' && (
                <View className="mb-6 border-b border-[#E5E7EB]">
                  <View className="px-6 pb-6">
                    <Text
                      className="text-xl font-semibold text-[#111928] mb-3"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      About this project
                    </Text>
                    <Text
                      className="text-base text-[#374151]"
                      style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
                    >
                      {project.description}
                    </Text>
                  </View>
                </View>
              )}

              <View className="px-6">
                {/* Project Details */}
                <View className="mb-6">
                  <Text
                    className="text-xl font-semibold text-[#111928] mb-4"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    Project Information
                  </Text>
                  <View className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                    {[
                      {
                        label: 'Project Type',
                        value: getProjectTypeLabel(),
                        icon: TypeIcon,
                      },
                      {
                        label: 'Status',
                        value: getStatusLabel(),
                        icon: TimeIcon,
                      },
                      getDurationText() ? {
                        label: 'Estimated Duration',
                        value: getDurationText()!,
                        icon: CalendarIcon,
                      } : null,
                    ]
                      .filter((detail): detail is NonNullable<typeof detail> => detail !== null)
                      .reduce((rows: typeof detail[][], detail, index) => {
                        const rowIndex = Math.floor(index / 2);
                        if (!rows[rowIndex]) {
                          rows[rowIndex] = [];
                        }
                        rows[rowIndex].push(detail);
                        return rows;
                      }, [])
                      .map((row, rowIndex, allRows) => (
                        <View
                          key={rowIndex}
                          className="flex-row"
                          style={{ marginBottom: rowIndex < allRows.length - 1 ? 16 : 0 }}
                        >
                          {row.map((detail, colIndex) => {
                            const IconComponent = detail.icon;
                            const isLastInRow = colIndex === row.length - 1;
                            return (
                              <View
                                key={colIndex}
                                className={`flex-1 items-center ${!isLastInRow ? 'border-r border-[#E5E7EB] pr-4' : ''} ${colIndex === 1 ? 'pl-4' : ''}`}
                              >
                                <View className="mb-2">
                                  <IconComponent size={20} color="#111928" />
                                </View>
                                <Text
                                  className="text-sm font-semibold text-[#111928] mb-1 text-center"
                                  style={{ fontFamily: 'Inter-SemiBold' }}
                                >
                                  {detail.value}
                                </Text>
                                <Text
                                  className="text-xs text-[#6B7280] text-center"
                                  style={{ fontFamily: 'Inter-Regular' }}
                                >
                                  {detail.label}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      ))}
                  </View>
                </View>

                {/* Location Section */}
                <View className="mb-8">
                  <View className="flex-row items-center mb-3">
                    <Text
                      className="text-xl font-semibold text-[#111928] ml-2"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Address
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <LocationIcon size={18} color="#6B7280" />
                    <Text
                      className="text-base text-[#374151] ml-2 flex-1"
                      style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
                    >
                      {project.address && project.address.trim() !== ''
                        ? `${project.address}, ${project.city}, ${project.state}${project.pincode ? ` ${project.pincode}` : ''}`
                        : `${project.city}, ${project.state}${project.pincode ? ` ${project.pincode}` : ''}`}
                    </Text>
                  </View>
                </View>

                {/* Contact Person */}
                {project.contact_info && (project.contact_info.phone || project.contact_info.email || project.contact_info.contact_person) && (
                  <View className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-6">
                    <Text
                      className="text-sm font-semibold text-[#6B7280] mb-3"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Contact Person
                    </Text>
                    {project.contact_info.contact_person && (
                      <View className="flex-row items-center mb-2">
                        <ProfileIcon size={16} color="#111928" />
                        <Text
                          className="text-base text-[#111928] ml-2"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {project.contact_info.contact_person}
                        </Text>
                      </View>
                    )}
                    {project.contact_info.phone && (
                      <View className="flex-row items-center mb-2">
                        <PhoneIcon size={16} color="#111928" />
                        <Text
                          className="text-base text-[#111928] ml-2"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {project.contact_info.phone}
                        </Text>
                      </View>
                    )}
                    {project.contact_info.email && (
                      <View className="flex-row items-center">
                        <MailIcon size={16} color="#111928" />
                        <Text
                          className="text-base text-[#111928] ml-2"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {project.contact_info.email}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Professional Warning Message */}
                {project.contact_info && (project.contact_info.phone || project.contact_info.email || project.contact_info.contact_person) && (
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
                          Use contact information responsibly for genuine project inquiries only
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
                )}
              </View>
            </ScrollView>

            {/* Contact Button */}
            {project.contact_info?.phone && (
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
                    Contact Project Owner
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
