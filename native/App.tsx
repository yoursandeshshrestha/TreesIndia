import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { initializeAuth } from './src/store/slices/authSlice';
import { useAppFonts } from './src/utils/fonts';
import SplashScreen from './src/components/SplashScreen';
import LoginScreen from './src/pages/auth/LoginScreen';
import OtpVerificationScreen from './src/pages/auth/OtpVerificationScreen';
import BottomNavigation, { TabType } from './src/components/BottomNavigation';
import HomeScreen from './src/pages/home/HomeScreen';
import BookingScreen from './src/pages/booking/BookingScreen';
import ChatScreen from './src/pages/chat/ChatScreen';
import ProfileScreen from './src/pages/profile/ProfileScreen';
import EditProfileScreen from './src/pages/profile/EditProfileScreen';
import WalletScreen from './src/pages/wallet/WalletScreen';
import ManageAddressesScreen from './src/pages/profile/ManageAddressesScreen';
import SubscriptionScreen from './src/pages/profile/SubscriptionScreen';
import SubscriptionPlansScreen from './src/pages/profile/SubscriptionPlansScreen';
import SettingsScreen from './src/pages/profile/SettingsScreen';
import AboutScreen from './src/pages/profile/AboutScreen';
import ApplyForWorkerScreen from './src/pages/profile/ApplyForWorkerScreen';
import ApplyForBrokerScreen from './src/pages/profile/ApplyForBrokerScreen';
import MyPropertiesScreen from './src/pages/profile/MyPropertiesScreen';
import AddPropertyScreen from './src/pages/profile/AddPropertyScreen';
import './global.css';

// Component to initialize auth state
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const fontsLoaded = useAppFonts();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    dispatch(initializeAuth()).finally(() => {
      setIsInitializing(false);
    });
  }, [dispatch]);

  // Only show splash screen during initial app load, not for subsequent loading states
  if (!fontsLoaded || isInitializing) {
    return <SplashScreen duration={2000} />;
  }

  return <>{children}</>;
}

// Main app content
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'login' | 'otp' | 'home' | 'editProfile' | 'wallet' | 'addresses' | 'subscription' | 'subscriptionPlans' | 'settings' | 'about' | 'applyWorker' | 'applyBroker' | 'properties' | 'addProperty'>('login');
  const [propertyToEdit, setPropertyToEdit] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [otpPhoneNumber, setOtpPhoneNumber] = useState('');
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleOTPSent = (phoneNumber: string) => {
    setOtpPhoneNumber(phoneNumber);
    setCurrentScreen('otp');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
    setOtpPhoneNumber('');
  };

  // Update screen based on auth state (only if not in OTP flow)
  React.useEffect(() => {
    if (isAuthenticated && currentScreen !== 'home') {
      setCurrentScreen('home');
    } else if (!isAuthenticated && currentScreen === 'home' && !otpPhoneNumber) {
      setCurrentScreen('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const renderScreen = () => {
    if (currentScreen === 'editProfile') {
      return (
        <EditProfileScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
        />
      );
    }

    if (currentScreen === 'wallet') {
      return (
        <WalletScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
        />
      );
    }

    if (currentScreen === 'addresses') {
      return (
        <ManageAddressesScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
        />
      );
    }

    if (currentScreen === 'subscription') {
      return (
        <SubscriptionScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
          onNavigateToPlans={() => setCurrentScreen('subscriptionPlans')}
        />
      );
    }

    if (currentScreen === 'subscriptionPlans') {
      return (
        <SubscriptionPlansScreen
          onBack={() => setCurrentScreen('subscription')}
          onPurchaseSuccess={() => {
            // Refresh subscription data when returning
            setCurrentScreen('subscription');
          }}
        />
      );
    }

    if (currentScreen === 'settings') {
      return (
        <SettingsScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
        />
      );
    }

    if (currentScreen === 'about') {
      return (
        <AboutScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
        />
      );
    }

    if (currentScreen === 'applyWorker') {
      return (
        <ApplyForWorkerScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
        />
      );
    }

    if (currentScreen === 'applyBroker') {
      return (
        <ApplyForBrokerScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
        />
      );
    }

    if (currentScreen === 'properties') {
      return (
        <MyPropertiesScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
          onAddProperty={(property?: any) => {
            setPropertyToEdit(property || null);
            setCurrentScreen('addProperty');
          }}
        />
      );
    }

    if (currentScreen === 'addProperty') {
      return (
        <AddPropertyScreen
          onBack={() => {
            setPropertyToEdit(null);
            setCurrentScreen('properties');
          }}
          onSuccess={() => {
            setPropertyToEdit(null);
            setCurrentScreen('properties');
          }}
          propertyToEdit={propertyToEdit}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'booking':
        return <BookingScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return (
          <ProfileScreen
            onEditProfile={() => setCurrentScreen('editProfile')}
            onNavigateToWallet={() => setCurrentScreen('wallet')}
            onNavigateToAddresses={() => setCurrentScreen('addresses')}
            onNavigateToSubscription={() => setCurrentScreen('subscription')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            onNavigateToAbout={() => setCurrentScreen('about')}
            onNavigateToApplyWorker={() => setCurrentScreen('applyWorker')}
            onNavigateToApplyBroker={() => setCurrentScreen('applyBroker')}
            onNavigateToProperties={() => setCurrentScreen('properties')}
          />
        );
      default:
        return <HomeScreen />;
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} duration={2000} />;
  }

  // Show OTP screen if OTP was sent
  if (currentScreen === 'otp' && otpPhoneNumber) {
    return (
      <OtpVerificationScreen
        phoneNumber={otpPhoneNumber}
        onBack={handleBackToLogin}
      />
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onOTPSent={handleOTPSent} />;
  }

  // Main app content (authenticated) with bottom navigation
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        {renderScreen()}
      </View>
      {currentScreen !== 'editProfile' && currentScreen !== 'wallet' && currentScreen !== 'addresses' && currentScreen !== 'subscription' && currentScreen !== 'subscriptionPlans' && currentScreen !== 'settings' && currentScreen !== 'about' && currentScreen !== 'applyWorker' && currentScreen !== 'applyBroker' && currentScreen !== 'properties' && currentScreen !== 'addProperty' && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </View>
  );
}

// Root component with Redux Provider and SafeAreaProvider
export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthInitializer>
          <AppContent />
        </AuthInitializer>
      </Provider>
    </SafeAreaProvider>
  );
}
