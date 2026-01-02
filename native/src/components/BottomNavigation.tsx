import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from './icons/HomeIcon';
import BookingIcon from './icons/BookingIcon';
import ChatIcon from './icons/ChatIcon';
import ProfileIcon from './icons/ProfileIcon';

export type TabType = 'home' | 'booking' | 'chat' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const tabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'booking', label: 'Booking', icon: BookingIcon },
  { id: 'chat', label: 'Chat', icon: ChatIcon },
  { id: 'profile', label: 'Profile', icon: ProfileIcon },
];

export default function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  return (
    <SafeAreaView edges={['bottom']} className="bg-white border-t border-[#E5E7EB]">
      <View className="flex-row items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          const iconColor = isActive ? '#00a871' : '#6B7280';
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="flex-1 items-center justify-center py-2"
              activeOpacity={0.7}
            >
              <View className="mb-1">
                <IconComponent size={20} color={iconColor} />
              </View>
              <Text
                className={`text-xs ${
                  isActive ? 'text-[#00a871] font-semibold' : 'text-[#6B7280]'
                }`}
                style={{
                  fontFamily: isActive ? 'Inter-SemiBold' : 'Inter-Regular',
                  lineHeight: 16,
                  ...(Platform.OS === 'android' && { includeFontPadding: false }),
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

