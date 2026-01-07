import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { initializeAuth, updateSubscriptionStatus } from './src/store/slices/authSlice';
import { useAppFonts } from './src/utils/fonts';
import SplashScreen from './src/components/SplashScreen';
import LoginScreen from './src/pages/auth/LoginScreen';
import OtpVerificationScreen from './src/pages/auth/OtpVerificationScreen';
import BottomNavigation, { TabType } from './src/components/BottomNavigation';
import HomeScreen from './src/pages/home/HomeScreen';
import BookingScreen from './src/pages/booking/BookingScreen';
import ChatScreen from './src/pages/chat/ChatScreen';
import ChatConversationScreen from './src/pages/chat/ChatConversationScreen';
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
import MyVendorProfileScreen from './src/pages/profile/MyVendorProfileScreen';
import AddVendorScreen from './src/pages/profile/AddVendorScreen';
import AddressSelectionScreen from './src/pages/home/components/AddressSelectionScreen';
import ServiceSearchScreen from './src/pages/home/components/ServiceSearchScreen';
import BookingFlowScreen from './src/pages/booking/BookingFlowScreen';
import PropertiesScreen from './src/pages/properties/PropertiesScreen';
import ServicesScreen from './src/pages/services/ServicesScreen';
import CategoryServicesScreen from './src/pages/services/CategoryServicesScreen';
import ProjectsScreen from './src/pages/projects/ProjectsScreen';
import WorkersScreen from './src/pages/workers/WorkersScreen';
import VendorsScreen from './src/pages/vendors/VendorsScreen';
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
  const dispatch = useAppDispatch();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'login' | 'otp' | 'home' | 'editProfile' | 'wallet' | 'addresses' | 'subscription' | 'subscriptionPlans' | 'settings' | 'about' | 'applyWorker' | 'applyBroker' | 'properties' | 'addProperty' | 'vendorProfiles' | 'addVendor' | 'addressSelection' | 'serviceSearch' | 'bookingFlow' | 'browseProperties' | 'browseServices' | 'browseProjects' | 'browseWorkers' | 'browseVendors' | 'categoryServices' | 'chatConversation'>('login');
  const [propertyToEdit, setPropertyToEdit] = useState<any>(null);
  const [vendorToEdit, setVendorToEdit] = useState<any>(null);
  const [serviceForBooking, setServiceForBooking] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [otpPhoneNumber, setOtpPhoneNumber] = useState('');
  const [propertiesInitialFilters, setPropertiesInitialFilters] = useState<any>(null);
  const [servicesInitialFilters, setServicesInitialFilters] = useState<any>(null);
  const [projectsInitialFilters, setProjectsInitialFilters] = useState<any>(null);
  const [workersInitialFilters, setWorkersInitialFilters] = useState<any>(null);
  const [vendorsInitialFilters, setVendorsInitialFilters] = useState<any>(null);
  const [categoryForServices, setCategoryForServices] = useState<any>(null);
  const [categoryStack, setCategoryStack] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [chatWorkerInfo, setChatWorkerInfo] = useState<{
    id: number;
    name: string;
    phone?: string;
    profileImage?: string;
  } | null>(null);
  const [chatPreviousTab, setChatPreviousTab] = useState<TabType>('booking');
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
            // Refresh subscription status in Redux
            dispatch(updateSubscriptionStatus());
            // Navigate back to subscription screen
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

    if (currentScreen === 'vendorProfiles') {
      return (
        <MyVendorProfileScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('profile');
          }}
          onAddVendor={(vendor?: any) => {
            setVendorToEdit(vendor || null);
            setCurrentScreen('addVendor');
          }}
        />
      );
    }

    if (currentScreen === 'addVendor') {
      return (
        <AddVendorScreen
          onBack={() => {
            setVendorToEdit(null);
            setCurrentScreen('vendorProfiles');
          }}
          onSuccess={() => {
            setVendorToEdit(null);
            setCurrentScreen('vendorProfiles');
          }}
          vendorToEdit={vendorToEdit}
        />
      );
    }

    if (currentScreen === 'addressSelection') {
      return (
        <AddressSelectionScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
          }}
          onAddressSelected={() => {
            // Address was selected and saved, refresh home screen
            setCurrentScreen('home');
            setActiveTab('home');
          }}
        />
      );
    }

    if (currentScreen === 'serviceSearch') {
      return (
        <ServiceSearchScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
          }}
          onServiceSelect={(service) => {
            // TODO: Handle service selection - navigate to service details or booking
            setCurrentScreen('home');
            setActiveTab('home');
          }}
        />
      );
    }

    if (currentScreen === 'bookingFlow' && serviceForBooking) {
      return (
        <BookingFlowScreen
          service={serviceForBooking}
          onBack={() => {
            setServiceForBooking(null);
            setCurrentScreen('home');
            setActiveTab('home');
          }}
          onComplete={() => {
            setServiceForBooking(null);
            setCurrentScreen('home');
            setActiveTab('booking');
          }}
        />
      );
    }

    if (currentScreen === 'browseProperties') {
      return (
        <PropertiesScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
            setPropertiesInitialFilters(null);
          }}
          initialFilters={propertiesInitialFilters}
        />
      );
    }

    if (currentScreen === 'browseServices') {
      return (
        <ServicesScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
            setServicesInitialFilters(null);
          }}
          initialFilters={servicesInitialFilters}
          onNavigateToBookingFlow={(service) => {
            setServiceForBooking(service);
            setCurrentScreen('bookingFlow');
          }}
        />
      );
    }

    if (currentScreen === 'browseProjects') {
      return (
        <ProjectsScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
            setProjectsInitialFilters(null);
          }}
          initialFilters={projectsInitialFilters}
          onNavigateToSubscription={() => setCurrentScreen('subscription')}
        />
      );
    }

    if (currentScreen === 'browseWorkers') {
      return (
        <WorkersScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
            setWorkersInitialFilters(null);
          }}
          initialFilters={workersInitialFilters}
          onNavigateToSubscription={() => setCurrentScreen('subscription')}
        />
      );
    }

    if (currentScreen === 'browseVendors') {
      return (
        <VendorsScreen
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
            setVendorsInitialFilters(null);
          }}
          initialFilters={vendorsInitialFilters}
          onNavigateToSubscription={() => setCurrentScreen('subscription')}
        />
      );
    }

    if (currentScreen === 'categoryServices') {
      return (
        <CategoryServicesScreen
          onBack={() => {
            if (categoryStack.length > 0) {
              // Pop from stack and show previous category
              const newStack = [...categoryStack];
              const previousCategory = newStack.pop();
              setCategoryStack(newStack);
              setCategoryForServices(previousCategory);
            } else {
              // Go back to home
              setCurrentScreen('home');
              setActiveTab('home');
              setCategoryForServices(null);
            }
          }}
          category={categoryForServices}
          onNavigateToSubcategory={(subcategory) => {
            // Push current category to stack and navigate to subcategory
            setCategoryStack([...categoryStack, categoryForServices]);
            setCategoryForServices(subcategory);
          }}
        />
      );
    }

    if (currentScreen === 'chatConversation' && selectedConversationId && chatWorkerInfo) {
      return (
        <ChatConversationScreen
          conversationId={selectedConversationId}
          workerId={chatWorkerInfo.id}
          workerName={chatWorkerInfo.name}
          workerPhone={chatWorkerInfo.phone}
          workerProfileImage={chatWorkerInfo.profileImage}
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab(chatPreviousTab);
            setSelectedConversationId(null);
            setChatWorkerInfo(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToAddressSelection={() => setCurrentScreen('addressSelection')}
            onNavigateToServiceSearch={() => setCurrentScreen('serviceSearch')}
            onNavigateToBookingFlow={(service) => {
              setServiceForBooking(service);
              setCurrentScreen('bookingFlow');
            }}
            onNavigateToProperties={(filters) => {
              setPropertiesInitialFilters(filters);
              setCurrentScreen('browseProperties');
            }}
            onNavigateToServices={(filters) => {
              setServicesInitialFilters(filters);
              setCurrentScreen('browseServices');
            }}
            onNavigateToProjects={(filters) => {
              setProjectsInitialFilters(filters);
              setCurrentScreen('browseProjects');
            }}
            onNavigateToWorkers={(filters) => {
              setWorkersInitialFilters(filters);
              setCurrentScreen('browseWorkers');
            }}
            onNavigateToVendors={(filters) => {
              setVendorsInitialFilters(filters);
              setCurrentScreen('browseVendors');
            }}
            onNavigateToCategoryServices={(category) => {
              setCategoryForServices(category);
              setCategoryStack([]);
              setCurrentScreen('categoryServices');
            }}
            onNavigateToSubscription={() => setCurrentScreen('subscription')}
            addressRefreshTrigger={Date.now()} // Refresh address when screen is shown
          />
        );
      case 'booking':
        return (
          <BookingScreen
            onNavigateToChat={(conversationId: number, workerInfo: { id: number; name: string; phone?: string; profileImage?: string }) => {
              setSelectedConversationId(conversationId);
              setChatWorkerInfo(workerInfo);
              setChatPreviousTab('booking');
              setCurrentScreen('chatConversation');
            }}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            onNavigateToConversation={(conversationId: number, workerInfo: { id: number; name: string; phone?: string; profileImage?: string }) => {
              setSelectedConversationId(conversationId);
              setChatWorkerInfo(workerInfo);
              setChatPreviousTab('chat');
              setCurrentScreen('chatConversation');
            }}
          />
        );
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
            onNavigateToVendorProfile={() => {
              setVendorToEdit(null);
              setCurrentScreen('vendorProfiles');
            }}
          />
        );
      default:
        return <HomeScreen onNavigateToSubscription={() => setCurrentScreen('subscription')} />;
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
      {currentScreen !== 'editProfile' && currentScreen !== 'wallet' && currentScreen !== 'addresses' && currentScreen !== 'subscription' && currentScreen !== 'subscriptionPlans' && currentScreen !== 'settings' && currentScreen !== 'about' && currentScreen !== 'applyWorker' && currentScreen !== 'applyBroker' && currentScreen !== 'properties' && currentScreen !== 'addProperty' && currentScreen !== 'vendorProfiles' && currentScreen !== 'addVendor' && currentScreen !== 'addressSelection' && currentScreen !== 'serviceSearch' && currentScreen !== 'bookingFlow' && currentScreen !== 'browseProperties' && currentScreen !== 'browseServices' && currentScreen !== 'categoryServices' && currentScreen !== 'chatConversation' && (
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
