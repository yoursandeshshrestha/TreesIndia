import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { type Project } from '../services';
import LocationIcon from './icons/LocationIcon';
import NotFoundIcon from './icons/NotFoundIcon';
import BlurWrapper from './BlurWrapper';
import ImageWithSkeleton from './ImageWithSkeleton';

interface ProjectCardProps {
  project: Project;
  onPress?: () => void;
  width?: number;
  shouldBlur?: boolean;
}

export default function ProjectCard({
  project,
  onPress,
  width = 200,
  shouldBlur = false,
}: ProjectCardProps) {
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

  const getDisplayLocation = () => {
    if (project.city && project.state) {
      return `${project.city}, ${project.state}`;
    }
    return project.city || project.state || 'Location not available';
  };

  const primaryImage = project.images && Array.isArray(project.images) && project.images.length > 0
    ? project.images[0]
    : null;

  return (
    <TouchableOpacity
      className="mb-3"
      activeOpacity={0.7}
      onPress={onPress}
      style={{ width }}
    >
      {/* Image Section */}
      <BlurWrapper shouldBlur={shouldBlur}>
        <View
          className="relative mb-4"
          style={{
            height: 140,
            borderRadius: 20,
            overflow: 'hidden',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
              },
              android: {
                elevation: 8,
              },
            }),
          }}
        >
          {primaryImage ? (
            <ImageWithSkeleton
              source={{ uri: primaryImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-[#F3F4F6] items-center justify-center">
              <NotFoundIcon size={64} color="#9CA3AF" />
              <Text
                className="text-sm text-[#9CA3AF] mt-2"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                No Image
              </Text>
            </View>
          )}

          {/* Status Badge */}
          <View
            className="absolute top-2 right-2 px-2 py-1 rounded-full"
            style={{ backgroundColor: getStatusColor() }}
          >
            <Text
              className="text-xs text-white font-medium"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              {getStatusLabel()}
            </Text>
          </View>
        </View>
      </BlurWrapper>

      {/* Details Section */}
      {shouldBlur ? (
        <View style={{ paddingHorizontal: 8 }}>
          <View style={{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8, width: '85%' }} />
          <View style={{ height: 12, backgroundColor: '#F3F4F6', borderRadius: 4, marginBottom: 8, width: '65%' }} />
          <View style={{ height: 12, backgroundColor: '#F3F4F6', borderRadius: 4, width: '45%' }} />
        </View>
      ) : (
        <View>
        {/* Project Name */}
        <Text
          className="text-sm font-semibold text-[#111928] mb-1"
          style={{ fontFamily: 'Inter-SemiBold' }}
          numberOfLines={2}
        >
          {project.title}
        </Text>

        {/* Location */}
        <View className="flex-row items-center mb-2">
          <LocationIcon size={12} color="#6B7280" />
          <Text
            className="text-xs text-[#6B7280] ml-1"
            style={{ fontFamily: 'Inter-Regular' }}
            numberOfLines={1}
          >
            {getDisplayLocation()}
          </Text>
        </View>

        {/* Project Type */}
        <Text
          className="text-xs font-medium text-[#6B7280]"
          style={{ fontFamily: 'Inter-Medium' }}
          numberOfLines={1}
        >
          {getProjectTypeLabel()}
        </Text>
      </View>
      )}
    </TouchableOpacity>
  );
}
