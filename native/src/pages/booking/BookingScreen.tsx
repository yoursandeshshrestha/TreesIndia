import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Text
            className="text-3xl font-bold text-[#111928] mb-2"
            style={{ fontFamily: 'Inter-Bold' }}
          >
            My Bookings
          </Text>
          <Text
            className="text-base text-[#6B7280] mb-6"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            View and manage your bookings
          </Text>

          {/* Placeholder content */}
          <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
            <Text
              className="text-lg font-semibold text-[#111928] mb-2"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Booking Screen
            </Text>
            <Text
              className="text-sm text-[#6B7280]"
              style={{ fontFamily: 'Inter-Regular' }}
            >
              This is the booking screen. Your bookings will be displayed here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


