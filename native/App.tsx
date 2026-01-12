import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { store } from './src/store/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { initializeAuth, updateSubscriptionStatus } from './src/store/slices/authSlice';
import { fetchTotalUnreadCount, updateTotalUnreadCount, updateConversationUnreadCount } from './src/store/slices/chatSlice';
import { conversationMonitorWebSocket } from './src/services/websocket/conversationMonitor.websocket';
import { useAppFonts } from './src/utils/fonts';
import SplashScreen from './src/components/SplashScreen';
import { notificationService } from './src/services/notification.service';
import { fcmService } from './src/services/api/fcm.service';
import type { PushNotification, NotificationResponse } from './src/types/notification';
import LoginScreen from './src/pages/auth/LoginScreen';
import OtpVerificationScreen from './src/pages/auth/OtpVerificationScreen';
import BottomNavigation, { TabType } from './src/components/BottomNavigation';
import HomeScreen from './src/pages/home/HomeScreen';
import BookingScreen from './src/pages/booking/BookingScreen';
import WorkScreen from './src/pages/work/WorkScreen';
import EarningsScreen from './src/pages/earnings/EarningsScreen';
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
    // Add timeout to prevent infinite hang
    const timeout = setTimeout(() => {
      setIsInitializing(false);
    }, 5000); // 5 second timeout

    dispatch(initializeAuth())
      .finally(() => {
        clearTimeout(timeout);
        setIsInitializing(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setIsInitializing(false);
      });

    return () => clearTimeout(timeout);
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
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { totalUnreadCount } = useAppSelector((state) => state.chat);

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

  // Connect to global conversation monitor WebSocket for real-time unread count updates
  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Initial fetch
    dispatch(fetchTotalUnreadCount());

    // Connect to monitor WebSocket
    conversationMonitorWebSocket.connect();

    // Listen for total unread count updates from server
    const handleTotalUnreadCount = (message: { event: string; data?: { total_unread_count?: number } }) => {
      if (message.data?.total_unread_count !== undefined) {
        dispatch(updateTotalUnreadCount(message.data.total_unread_count));
      }
    };

    // Listen for individual conversation unread count updates
    const handleConversationUnreadCount = (message: { event: string; data?: { conversation_id?: number; unread_count?: number } }) => {
      if (message.data?.conversation_id && message.data?.unread_count !== undefined) {
        dispatch(updateConversationUnreadCount({
          conversationId: message.data.conversation_id,
          count: message.data.unread_count,
        }));
      }
    };

    // Listen for new messages (trigger refresh as fallback)
    const handleNewMessage = () => {
      dispatch(fetchTotalUnreadCount());
    };

    conversationMonitorWebSocket.on('total_unread_count', handleTotalUnreadCount);
    conversationMonitorWebSocket.on('conversation_unread_count', handleConversationUnreadCount);
    conversationMonitorWebSocket.on('new_conversation_message', handleNewMessage);
    conversationMonitorWebSocket.on('conversation_message', handleNewMessage);

    // Cleanup
    return () => {
      conversationMonitorWebSocket.off('total_unread_count', handleTotalUnreadCount);
      conversationMonitorWebSocket.off('conversation_unread_count', handleConversationUnreadCount);
      conversationMonitorWebSocket.off('new_conversation_message', handleNewMessage);
      conversationMonitorWebSocket.off('conversation_message', handleNewMessage);
      conversationMonitorWebSocket.disconnect();
    };
  }, [isAuthenticated, dispatch]);

  // Setup FCM notifications
  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Initialize notifications
    const setupNotifications = async () => {
      try {
        // Get the FCM token
        const token = await notificationService.getDevicePushToken();

        if (token) {
          // Register token with backend
          await fcmService.registerToken(token);
        }

        // Register notification handlers
        const handleNotificationReceived = (notification: PushNotification) => {
          // Handle notification received while app is in foreground
        };

        const handleNotificationResponse = (response: NotificationResponse) => {
          // Handle notification tap
          const data = response.notification.data;

          // Navigate based on notification type
          if (data?.type === 'chat' && data?.conversationId) {
            // Navigate to chat conversation
            const conversationId = parseInt(data.conversationId, 10);
            if (!isNaN(conversationId)) {
              setSelectedConversationId(conversationId);
              setCurrentScreen('chatConversation');
            }
          } else if (data?.type === 'booking' && data?.bookingId) {
            // Navigate to booking tab
            setActiveTab('booking');
            setCurrentScreen('home');
          } else if (data?.type === 'work' && data?.assignmentId) {
            // Navigate to work tab (for treesindia workers only)
            if (user?.user_type === 'worker' && user?.worker_type === 'treesindia_worker') {
              setActiveTab('work');
              setCurrentScreen('home');
            }
          }
        };

        notificationService.registerNotificationListeners(
          handleNotificationReceived,
          handleNotificationResponse
        );
      } catch (error) {
        // Error setting up notifications
      }
    };

    setupNotifications();

    // Cleanup
    return () => {
      notificationService.removeNotificationListeners();
    };
  }, [isAuthenticated, user]);

  // Update screen based on auth state (only when auth status changes, not on every navigation)
  React.useEffect(() => {
    if (isAuthenticated && currentScreen === 'otp') {
      // Navigate to home after successful OTP verification
      setCurrentScreen('home');
      // Reset to home tab (or work tab for treesindia workers)
      if (user?.user_type === 'worker' && user?.worker_type === 'treesindia_worker') {
        setActiveTab('work');
      } else {
        setActiveTab('home');
      }
    } else if (!isAuthenticated && currentScreen === 'home' && !otpPhoneNumber) {
      // When not authenticated and on home screen (but not in OTP flow), go to login
      setCurrentScreen('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Set default tab based on user type
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const isTreesIndiaWorker = user.user_type === 'worker' && user.worker_type === 'treesindia_worker';
      if (isTreesIndiaWorker && activeTab === 'home') {
        setActiveTab('work');
      } else if (!isTreesIndiaWorker && activeTab === 'work') {
        setActiveTab('home');
      }
    }
  }, [isAuthenticated, user, activeTab]);

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
        // TreesIndia workers don't have access to home screen
        if (user?.user_type === 'worker' && user?.worker_type === 'treesindia_worker') {
          return (
            <WorkScreen
              onNavigateToChat={(conversationId: number, customerInfo: { id: number; name: string; phone?: string; profileImage?: string }) => {
                setSelectedConversationId(conversationId);
                setChatWorkerInfo(customerInfo);
                setChatPreviousTab('work');
                setCurrentScreen('chatConversation');
              }}
            />
          );
        }
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
      case 'work':
        return (
          <WorkScreen
            onNavigateToChat={(conversationId: number, customerInfo: { id: number; name: string; phone?: string; profileImage?: string }) => {
              setSelectedConversationId(conversationId);
              setChatWorkerInfo(customerInfo);
              setChatPreviousTab('work');
              setCurrentScreen('chatConversation');
            }}
          />
        );
      case 'earnings':
        return <EarningsScreen />;
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
        // TreesIndia workers default to work screen, others default to home screen
        if (user?.user_type === 'worker' && user?.worker_type === 'treesindia_worker') {
          return (
            <WorkScreen
              onNavigateToChat={(conversationId: number, customerInfo: { id: number; name: string; phone?: string; profileImage?: string }) => {
                setSelectedConversationId(conversationId);
                setChatWorkerInfo(customerInfo);
                setChatPreviousTab('work');
                setCurrentScreen('chatConversation');
              }}
            />
          );
        }
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
      {currentScreen !== 'editProfile' && currentScreen !== 'wallet' && currentScreen !== 'addresses' && currentScreen !== 'subscription' && currentScreen !== 'subscriptionPlans' && currentScreen !== 'settings' && currentScreen !== 'about' && currentScreen !== 'applyWorker' && currentScreen !== 'applyBroker' && currentScreen !== 'properties' && currentScreen !== 'addProperty' && currentScreen !== 'vendorProfiles' && currentScreen !== 'addVendor' && currentScreen !== 'addressSelection' && currentScreen !== 'serviceSearch' && currentScreen !== 'bookingFlow' && currentScreen !== 'browseProperties' && currentScreen !== 'browseServices' && currentScreen !== 'categoryServices' && currentScreen !== 'chatConversation' && currentScreen !== 'browseProjects' && currentScreen !== 'browseWorkers' && currentScreen !== 'browseVendors' && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          chatUnreadCount={totalUnreadCount}
          userType={user?.user_type}
          workerType={user?.worker_type}
        />
      )}
    </View>
  );
}

// Root component with Redux Provider and SafeAreaProvider
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <BottomSheetModalProvider>
            <AuthInitializer>
              <AppContent />
            </AuthInitializer>
          </BottomSheetModalProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
