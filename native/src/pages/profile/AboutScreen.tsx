import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackIcon from '../../components/icons/BackIcon';

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const handleOpenTerms = () => {
    // TODO: Open Terms and Conditions modal or navigate to terms page
    Linking.openURL('https://treesindiaservices.com/terms-and-conditions').catch(() => {
      // Error handling
    });
  };

  const handleOpenPrivacy = () => {
    // TODO: Open Privacy Policy modal or navigate to privacy page
    Linking.openURL('https://treesindiaservices.com/privacy-policy').catch(() => {
      // Error handling
    });
  };

  const handleContact = (type: 'email' | 'phone1' | 'phone2') => {
    if (type === 'email') {
      Linking.openURL('mailto:support@treesindiaservices.com').catch(() => {
        // Error handling
      });
    } else if (type === 'phone1') {
      Linking.openURL('tel:+919641864615').catch(() => {
        // Error handling
      });
    } else if (type === 'phone2') {
      Linking.openURL('tel:+917363952622').catch(() => {
        // Error handling
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
        <TouchableOpacity onPress={onBack} className="-ml-2 p-2" activeOpacity={0.7}>
          <BackIcon size={24} color="#111928" />
        </TouchableOpacity>
        <Text
          className="ml-2 font-semibold text-xl text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          About TreesIndia
        </Text>
      </View>

      <ScrollView className="flex-1 bg-[#F9FAFB]">
        <View className="px-6 pb-8 pt-6">
          <Text
            className="mb-1 font-semibold text-2xl text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            About TreesIndia
          </Text>
          <Text className="mb-6 text-base text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Expert Care, Comfort, and Reliability
          </Text>

          {/* Mission Section */}
          <View className="mb-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <View className="border-b border-[#E5E7EB] px-4 py-4">
              <Text
                className="font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Our Mission
              </Text>
            </View>
            <View className="px-4 py-4">
              <Text
                className="text-sm text-[#374151]"
                style={{ fontFamily: 'Inter-Regular', lineHeight: 22 }}>
                At Trees India, we believe that every home deserves expert care, comfort, and
                reliability. Our mission is to simplify everyday living by connecting you with
                trusted professionals for all your household and construction needs—right at your
                fingertips.
              </Text>
              <Text
                className="mt-3 text-sm text-[#374151]"
                style={{ fontFamily: 'Inter-Regular', lineHeight: 22 }}>
                Whether you need a plumber, electrician, carpenter, housekeeper, painter, or repair
                specialist, Trees India is your one-stop destination for quality service,
                transparent pricing, and timely assistance. Through our easy-to-use app, we bring
                together skilled technicians and modern convenience, ensuring that every service you
                book is handled with professionalism and care.
              </Text>
              <Text
                className="mt-3 text-sm text-[#374151]"
                style={{ fontFamily: 'Inter-Regular', lineHeight: 22 }}>
                What sets us apart is our commitment to excellence, customer satisfaction, and
                sustainable practices. Every professional in our network is verified, trained, and
                dedicated to delivering high-quality results that you can count on.
              </Text>
              <Text
                className="mt-3 text-sm text-[#374151]"
                style={{ fontFamily: 'Inter-Regular', lineHeight: 22 }}>
                At Trees India, we don&apos;t just fix problems—we build trust, enhance homes, and
                make life a little easier, one service at a time.
              </Text>
            </View>
          </View>

          {/* Key Features */}
          <View className="mb-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <View className="border-b border-[#E5E7EB] px-4 py-4">
              <Text
                className="font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Why Choose TreesIndia?
              </Text>
            </View>
            <View className="px-4 py-4">
              <View className="mb-4">
                <Text
                  className="mb-1 font-semibold text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Verified Professionals
                </Text>
                <Text
                  className="text-sm text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}>
                  All our service providers are thoroughly verified and background-checked for your
                  safety and peace of mind.
                </Text>
              </View>
              <View className="mb-4">
                <Text
                  className="mb-1 font-semibold text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Wide Network
                </Text>
                <Text
                  className="text-sm text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}>
                  Access to thousands of skilled professionals across various service categories in
                  your area.
                </Text>
              </View>
              <View>
                <Text
                  className="mb-1 font-semibold text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Quality Assurance
                </Text>
                <Text
                  className="text-sm text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}>
                  We ensure high-quality service delivery with customer feedback and satisfaction
                  guarantees.
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View className="mb-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <View className="border-b border-[#E5E7EB] px-4 py-4">
              <Text
                className="font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Contact Us
              </Text>
            </View>
            <View className="px-4 py-4">
              <TouchableOpacity
                onPress={() => handleContact('email')}
                className="border-b border-[#E5E7EB] py-3"
                activeOpacity={0.7}>
                <Text
                  className="mb-1 text-xs text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Email
                </Text>
                <Text
                  className="font-medium text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-Medium' }}>
                  support@treesindiaservices.com
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleContact('phone1')}
                className="border-b border-[#E5E7EB] py-3"
                activeOpacity={0.7}>
                <Text
                  className="mb-1 text-xs text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Support Phone
                </Text>
                <Text
                  className="font-medium text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-Medium' }}>
                  +91 9641864615
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleContact('phone2')}
                className="border-b border-[#E5E7EB] py-3"
                activeOpacity={0.7}>
                <Text
                  className="mb-1 text-xs text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Phone
                </Text>
                <Text
                  className="font-medium text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-Medium' }}>
                  +91 7363952622
                </Text>
              </TouchableOpacity>
              <View className="py-3">
                <Text
                  className="mb-1 text-xs text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Address
                </Text>
                <Text
                  className="font-medium text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-Medium' }}>
                  Sevoke Road, Shastri Nagar, Siliguri, Darjeeling, West Bengal - 734001
                </Text>
              </View>
            </View>
          </View>

          {/* Legal Information */}
          <View className="rounded-xl border border-[#E5E7EB] bg-white">
            <View className="border-b border-[#E5E7EB] px-4 py-4">
              <Text
                className="font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Legal Information
              </Text>
            </View>
            <View className="px-4 py-4">
              <TouchableOpacity
                onPress={handleOpenTerms}
                className="mb-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                activeOpacity={0.7}>
                <Text
                  className="font-semibold text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Terms and Conditions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOpenPrivacy}
                className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                activeOpacity={0.7}>
                <Text
                  className="font-semibold text-sm text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
