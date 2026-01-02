/**
 * Razorpay Payment Gateway Integration
 * 
 * Note: This requires react-native-razorpay package and a custom development build
 * Install: npm install react-native-razorpay
 * 
 * For Expo: You'll need to create a development build (expo prebuild + native build)
 * or use EAS Build for custom native code support
 */

import { Platform, Alert } from 'react-native';

// Razorpay types
export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    contact?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
  };
}

class RazorpayService {
  private razorpay: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize Razorpay SDK
   * This should be called once when the app starts
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // If initialization is already in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Initialize and return a promise
    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Dynamically import react-native-razorpay
        // This allows the app to work even if the package isn't installed
        const RazorpayCheckout = require('react-native-razorpay');
        this.razorpay = RazorpayCheckout.default || RazorpayCheckout;
        this.isInitialized = true;
        resolve();
      } catch (error) {
        this.isInitialized = false;
        this.initPromise = null;
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Check if Razorpay is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.razorpay !== null;
  }

  /**
   * Open Razorpay checkout
   */
  async openCheckout(
    options: RazorpayOptions,
    onSuccess: (response: RazorpayResponse) => void,
    onError: (error: RazorpayError) => void
  ): Promise<void> {
    // Ensure Razorpay is initialized before opening checkout
    try {
      await this.initialize();
    } catch (error) {
      Alert.alert(
        'Payment Gateway Unavailable',
        'Razorpay SDK is not available. Please ensure react-native-razorpay is installed and you are using a development build.',
        [{ text: 'OK' }]
      );
      onError({
        code: 'SDK_NOT_AVAILABLE',
        description: 'Razorpay SDK is not available',
        source: 'sdk',
        step: 'initialization',
        reason: 'sdk_not_installed',
      });
      return;
    }

    if (!this.isAvailable()) {
      Alert.alert(
        'Payment Gateway Unavailable',
        'Razorpay SDK is not available. Please ensure react-native-razorpay is installed and you are using a development build.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Call Razorpay open method
      // The SDK should return a promise that resolves when payment succeeds
      const response = await this.razorpay.open(options);
      
      // Razorpay returns response in different formats based on platform
      if (response) {
        const razorpayResponse: RazorpayResponse = {
          razorpay_payment_id: response.razorpay_payment_id || response.razorpayPaymentId || '',
          razorpay_order_id: response.razorpay_order_id || response.razorpayOrderId || '',
          razorpay_signature: response.razorpay_signature || response.razorpaySignature || '',
        };
        onSuccess(razorpayResponse);
      } else {
        // If response is empty, user likely cancelled
        onError({
          code: 'PAYMENT_CANCELLED',
          description: 'Payment was cancelled',
          source: 'user',
          step: 'payment',
          reason: 'user_cancelled',
        });
      }
    } catch (error: any) {
      // Handle Razorpay errors
      const razorpayError: RazorpayError = {
        code: error.code || error.error?.code || 'UNKNOWN_ERROR',
        description: error.description || error.error?.description || error.message || 'Payment failed',
        source: error.source || error.error?.source || 'user',
        step: error.step || error.error?.step || 'payment',
        reason: error.reason || error.error?.reason || 'unknown',
        metadata: error.metadata || error.error?.metadata,
      };
      onError(razorpayError);
    }
  }

  /**
   * Get Razorpay key from environment
   * Selects the appropriate key based on EXPO_ENVIRONMENT (dev or prod)
   */
  getRazorpayKey(): string {
    // Get environment (dev or prod)
    const EXPO_ENVIRONMENT = process.env.EXPO_ENVIRONMENT || 'dev';
    
    // Select Razorpay key based on environment
    let key = '';
    if (EXPO_ENVIRONMENT === 'prod') {
      key = process.env.EXPO_PUBLIC_PROD_RAZORPAY_APIKEY || '';
    } else {
      // Default to dev
      key = process.env.EXPO_PUBLIC_DEV_RAZORPAY_APIKEY || '';
    }
    
    return key;
  }
}

export const razorpayService = new RazorpayService();

