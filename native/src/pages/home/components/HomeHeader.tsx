import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LocationIcon from '../../../components/icons/LocationIcon';
import { userLocationService, UserLocation } from '../../../services/api/user-location.service';

interface HomeHeaderProps {
  onAddressPress?: () => void;
  refreshTrigger?: number; // Add refresh trigger to reload address when changed
}

export default function HomeHeader({ onAddressPress, refreshTrigger }: HomeHeaderProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserLocation();
  }, [refreshTrigger]); // Reload when refreshTrigger changes

  const loadUserLocation = async () => {
    try {
      setIsLoading(true);
      const location = await userLocationService.getUserLocation();
      setUserLocation(location);
    } catch (error) {
      setUserLocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationText = () => {
    if (!userLocation) {
      return 'Your location';
    }
    // Show city and state in "Your location" text
    const city = userLocation.city || '';
    const state = userLocation.state || '';

    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }

    return 'Your location';
  };

  const getDisplayAddress = () => {
    if (!userLocation) {
      return 'Add your location';
    }
    // Show the actual address
    if (userLocation.address) {
      return userLocation.address.length > 50
        ? `${userLocation.address.substring(0, 50)}...`
        : userLocation.address;
    }

    return 'Add your location';
  };

  return (
    <View className="flex-row items-center bg-white px-6 pb-4 pt-4">
      {/* Address Section */}
      <TouchableOpacity onPress={onAddressPress} activeOpacity={0.7} className="flex-1">
        {isLoading ? (
          <>
            <View className="mb-0.5 flex-row items-center">
              <LocationIcon size={16} color="#111928" />
              <View className="ml-2 h-4 w-32 rounded bg-gray-200" />
            </View>
            <View className="h-3 w-40 rounded bg-gray-200" />
          </>
        ) : (
          <>
            <View className="mb-0.5 flex-row items-center">
              <LocationIcon size={16} color="#111928" />
              <Text
                className="ml-2 font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}
                numberOfLines={1}>
                {getLocationText()}
              </Text>
            </View>
            <Text
              className="text-xs text-[#6B7280]"
              style={{ fontFamily: 'Inter-Regular' }}
              numberOfLines={1}>
              {getDisplayAddress()}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
