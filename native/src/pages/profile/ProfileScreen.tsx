import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import ProfileHeader from './components/ProfileHeader';
import MenuItem from './components/MenuItem';
import LogoutConfirmationModal from './components/LogoutConfirmationModal';
import WalletIcon from '../../components/icons/WalletIcon';
import AddressIcon from '../../components/icons/AddressIcon';
import PropertyIcon from '../../components/icons/PropertyIcon';
import WorkerIcon from '../../components/icons/WorkerIcon';
import VendorIcon from '../../components/icons/VendorIcon';
import SubscriptionIcon from '../../components/icons/SubscriptionIcon';
import SettingsIcon from '../../components/icons/SettingsIcon';
import InfoIcon from '../../components/icons/InfoIcon';
import LogoutIcon from '../../components/icons/LogoutIcon';
import PawLeftIcon from '../../components/icons/PawLeftIcon';
import PawRightIcon from '../../components/icons/PawRightIcon';
// import Constants from 'expo-constants';

interface ProfileScreenProps {
  onEditProfile?: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToAddresses?: () => void;
  onNavigateToSubscription?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToApplyWorker?: () => void;
  onNavigateToApplyBroker?: () => void;
  onNavigateToProperties?: () => void;
  onNavigateToVendorProfile?: () => void;
}

export default function ProfileScreen({ onEditProfile, onNavigateToWallet, onNavigateToAddresses, onNavigateToSubscription, onNavigateToSettings, onNavigateToAbout, onNavigateToApplyWorker, onNavigateToApplyBroker, onNavigateToProperties, onNavigateToVendorProfile }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { hasActiveSubscription, isAdmin } = useSubscriptionStatus();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // TODO: Get version from package.json or app config when available
  const versionText = 'Version 1.0.0+1';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      setShowLogoutModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
      setIsLoggingOut(false);
    }
  };

  const handleMenuItemPress = (label: string) => {
    if (label === 'Wallet' && onNavigateToWallet) {
      onNavigateToWallet();
      return;
    }
    if (label === 'Manage addresses' && onNavigateToAddresses) {
      onNavigateToAddresses();
      return;
    }
    if (label === 'My Subscription' && onNavigateToSubscription) {
      onNavigateToSubscription();
      return;
    }
    if (label === 'Settings' && onNavigateToSettings) {
      onNavigateToSettings();
      return;
    }
    if (label === 'About TreesIndia' && onNavigateToAbout) {
      onNavigateToAbout();
      return;
    }
    if (label === 'Apply for Worker' && onNavigateToApplyWorker) {
      onNavigateToApplyWorker();
      return;
    }
    if (label === 'Apply for Broker' && onNavigateToApplyBroker) {
      onNavigateToApplyBroker();
      return;
    }
    if (label === 'My Properties' && onNavigateToProperties) {
      onNavigateToProperties();
      return;
    }
    if (label === 'My Vendor Profile' && onNavigateToVendorProfile) {
      onNavigateToVendorProfile();
      return;
    }
    // Placeholder for navigation - will be implemented later
    Alert.alert('Coming Soon', `${label} feature will be available soon.`);
  };

  // Only treesindia workers get the worker UI
  const isTreesIndiaWorker = user?.user_type === 'worker' && user?.worker_type === 'treesindia_worker';
  const isAnyWorker = user?.user_type === 'worker'; // Any type of worker (normal or treesindia)
  const isBroker = user?.user_type === 'broker';
  const canAccessVendorProfile = (hasActiveSubscription || isAdmin) && !isTreesIndiaWorker;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ paddingTop: insets.top, backgroundColor: 'white' }} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Profile Header Section - Airbnb Style */}
        <View className="px-6 pt-8 pb-6">
          <ProfileHeader
            user={user}
            onEditPress={() => {
              if (onEditProfile) {
                onEditProfile();
              } else {
                handleMenuItemPress('Edit Profile');
              }
            }}
          />
        </View>

        {/* Worker Verification Badge Section */}
        {isTreesIndiaWorker && (
          <View className="px-6 pb-8">
            <View className="border border-[#E5E7EB] rounded-xl py-4 px-6 flex-row items-center justify-center bg-white">
              <PawLeftIcon size={24} color="#00a871" />
              <View className="mx-4 flex-1 items-center">
                <Text
                  className="text-base font-bold text-[#00a871] tracking-wider"
                  style={{ fontFamily: 'Inter-Bold' }}
                >
                  VERIFIED WORKER
                </Text>
              </View>
              <PawRightIcon size={24} color="#00a871" />
            </View>
          </View>
        )}

        {/* Menu Items Section - Clean Airbnb Style */}
        <View className="px-6">
          {/* Account Section */}
          <View className="mb-8">
            <Text
              className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Account
            </Text>
            <View className="bg-white rounded-xl">
              <MenuItem
                icon={WalletIcon}
                label="Wallet"
                onPress={() => handleMenuItemPress('Wallet')}
              />
              <MenuItem
                icon={AddressIcon}
                label="Manage addresses"
                onPress={() => handleMenuItemPress('Manage addresses')}
              />
              {!isTreesIndiaWorker && (
                <MenuItem
                  icon={PropertyIcon}
                  label="My Properties"
                  onPress={() => handleMenuItemPress('My Properties')}
                />
              )}
              {canAccessVendorProfile && (
                <MenuItem
                  icon={VendorIcon}
                  label="My Vendor Profile"
                  onPress={() => handleMenuItemPress('My Vendor Profile')}
                />
              )}
              {!isTreesIndiaWorker && (
                <MenuItem
                  icon={SubscriptionIcon}
                  label="My Subscription"
                  onPress={() => handleMenuItemPress('My Subscription')}
                  showDivider={false}
                />
              )}
            </View>
          </View>

          {/* Services Section */}
          {!isAnyWorker && !isBroker && (
            <View className="mb-8">
              <Text
                className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Services
              </Text>
              <View className="bg-white rounded-xl">
                <MenuItem
                  icon={WorkerIcon}
                  label="Apply for Worker"
                  onPress={() => handleMenuItemPress('Apply for Worker')}
                />
                <MenuItem
                  icon={WorkerIcon}
                  label="Apply for Broker"
                  onPress={() => handleMenuItemPress('Apply for Broker')}
                  showDivider={false}
                />
              </View>
            </View>
          )}

          {/* Support Section */}
          <View className="mb-8">
            <Text
              className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Support
            </Text>
            <View className="bg-white rounded-xl">
              <MenuItem
                icon={SettingsIcon}
                label="Settings"
                onPress={() => handleMenuItemPress('Settings')}
              />
              <MenuItem
                icon={InfoIcon}
                label="About TreesIndia"
                onPress={() => handleMenuItemPress('About TreesIndia')}
                showDivider={false}
              />
            </View>
          </View>
        </View>

        {/* Logout Button - Airbnb Style */}
        <View className="px-6 pb-8 mt-auto">
          <TouchableOpacity
            onPress={() => setShowLogoutModal(true)}
            className="h-12 rounded-lg bg-white border border-[#E5E7EB] items-center justify-center flex-row gap-2"
            activeOpacity={0.7}
          >
            <LogoutIcon size={18} color="#DC2626" />
            <Text
              className="text-base font-medium text-[#DC2626]"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              Log out
            </Text>
          </TouchableOpacity>

          {/* Version */}
          <Text
            className="text-xs text-[#9CA3AF] text-center mt-6"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {versionText}
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
}
