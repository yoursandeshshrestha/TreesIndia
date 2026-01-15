import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from './icons/HomeIcon';
import BookingIcon from './icons/BookingIcon';
import WorkIcon from './icons/WorkIcon';
import EarningsIcon from './icons/EarningsIcon';
import ChatIcon from './icons/ChatIcon';
import ProfileIcon from './icons/ProfileIcon';

export type TabType = 'home' | 'booking' | 'work' | 'earnings' | 'chat' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  chatUnreadCount?: number;
  userType?: 'admin' | 'user' | 'worker' | 'normal' | 'broker';
  workerType?: 'normal' | 'treesindia_worker';
}

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  chatUnreadCount = 0,
  userType = 'normal',
  workerType,
}: BottomNavigationProps) {
  // Only treesindia workers get the worker UI
  const isTreesIndiaWorker = userType === 'worker' && workerType === 'treesindia_worker';

  const tabs: TabItem[] = [
    ...(!isTreesIndiaWorker ? [{ id: 'home' as TabType, label: 'Home', icon: HomeIcon }] : []),
    isTreesIndiaWorker
      ? { id: 'work', label: 'Work', icon: WorkIcon }
      : { id: 'booking', label: 'Booking', icon: BookingIcon },
    ...(isTreesIndiaWorker
      ? [{ id: 'earnings' as TabType, label: 'Earnings', icon: EarningsIcon }]
      : []),
    { id: 'chat', label: 'Chat', icon: ChatIcon },
    { id: 'profile', label: 'Profile', icon: ProfileIcon },
  ];

  return (
    <SafeAreaView edges={['bottom']} className="border-t border-[#E5E7EB] bg-white">
      <View className="flex-row items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          const iconColor = isActive ? '#00a871' : '#6B7280';
          const showBadge = tab.id === 'chat' && chatUnreadCount > 0;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="flex-1 items-center justify-center py-2"
              activeOpacity={0.7}>
              <View className="relative mb-1">
                <IconComponent size={20} color={iconColor} />
                {showBadge && (
                  <View className="absolute -right-2 -top-1 h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1">
                    <Text
                      className="font-bold text-[10px] text-white"
                      style={{
                        fontFamily: 'Inter-Bold',
                        lineHeight: 12,
                        ...(Platform.OS === 'android' && { includeFontPadding: false }),
                      }}>
                      {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                className={`text-xs ${
                  isActive ? 'font-semibold text-[#00a871]' : 'text-[#6B7280]'
                }`}
                style={{
                  fontFamily: isActive ? 'Inter-SemiBold' : 'Inter-Regular',
                  lineHeight: 16,
                  ...(Platform.OS === 'android' && { includeFontPadding: false }),
                }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
