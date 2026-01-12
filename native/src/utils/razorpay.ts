/**
 * Razorpay Payment Gateway Integration
 *
 * Note: This requires react-native-razorpay package and a custom development build
 * Install: npm install react-native-razorpay
 *
 * For Expo: You'll need to create a development build (expo prebuild + native build)
 * or use EAS Build for custom native code support
 */

import { Alert } from 'react-native';
import { paymentLogger } from './logger';

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

// Detect if we're in Expo Go by checking for __expo module
const isExpoGo = typeof (global as any).__expo !== 'undefined' &&
                 !(global as any).__DEV__ === false;

// Function to safely load Razorpay module
function loadRazorpayModule(): any {
  if (isExpoGo) {
    return null;
  }

  try {
    // Use a dynamic require wrapped in a function to delay execution
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RazorpayCheckout = require('react-native-razorpay');
    return RazorpayCheckout;
  } catch (error) {
    return null;
  }
}

class RazorpayService {
  private razorpay: any = null;
  private isInitialized = false;
  private razorpayModule: any = null;
  private checkoutTimeout: NodeJS.Timeout | null = null;
  private readonly CHECKOUT_TIMEOUT_MS = 300000; // 5 minutes timeout

  /**
   * Check if Razorpay is available
   */
  isAvailable(): boolean {
    return !isExpoGo && this.isInitialized && this.razorpay !== null;
  }

  /**
   * Check if we're in Expo Go (Razorpay not available)
   */
  isExpoGo(): boolean {
    return isExpoGo;
  }

  /**
   * Initialize Razorpay SDK (public method to match WalletScreen pattern)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.razorpay) {
      return;
    }

    if (isExpoGo) {
      throw new Error('Razorpay is not available in Expo Go.');
    }

    // Load the module only when needed
    if (!this.razorpayModule) {
      this.razorpayModule = loadRazorpayModule();
    }

    if (!this.razorpayModule) {
      throw new Error('Failed to load Razorpay module. Please ensure react-native-razorpay is installed.');
    }

    try {
      this.razorpay = this.razorpayModule.default || this.razorpayModule;

      if (!this.razorpay || typeof this.razorpay.open !== 'function') {
        throw new Error('Razorpay module is not properly initialized');
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error('Failed to initialize Razorpay SDK');
    }
  }

  /**
   * Clear any existing checkout timeout
   */
  private clearCheckoutTimeout(): void {
    if (this.checkoutTimeout) {
      clearTimeout(this.checkoutTimeout);
      this.checkoutTimeout = null;
      paymentLogger.debug('Cleared checkout timeout');
    }
  }

  /**
   * Open Razorpay checkout with timeout protection
   */
  async openCheckout(
    options: RazorpayOptions,
    onSuccess: (response: RazorpayResponse) => void,
    onError: (error: RazorpayError) => void
  ): Promise<void> {
    paymentLogger.flow('Razorpay checkout', 'start', {
      amount: options.amount,
      currency: options.currency,
      order_id: options.order_id,
    });

    // Clear any existing timeout
    this.clearCheckoutTimeout();

    // Check if running in Expo Go
    if (isExpoGo) {
      const errorMessage = 'Razorpay payments are only available in development/production builds.';
      paymentLogger.warn('Razorpay not available in Expo Go');
      Alert.alert(
        'Payment Unavailable in Expo Go',
        'To test payments, please:\n\n1. Use wallet payment, or\n2. Create a development build:\n   npx expo run:ios\n   npx expo run:android',
        [{ text: 'OK' }]
      );
      onError({
        code: 'SDK_NOT_AVAILABLE',
        description: errorMessage,
        source: 'sdk',
        step: 'initialization',
        reason: 'expo_go',
      });
      return;
    }

    // Ensure SDK is initialized
    try {
      paymentLogger.debug('Initializing Razorpay SDK');
      await this.initialize();
      paymentLogger.debug('Razorpay SDK initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment gateway';
      paymentLogger.error('Failed to initialize Razorpay SDK', error);
      Alert.alert('Payment Error', errorMessage, [{ text: 'OK' }]);
      onError({
        code: 'INIT_FAILED',
        description: errorMessage,
        source: 'sdk',
        step: 'initialization',
        reason: 'init_error',
      });
      return;
    }

    let isCompleted = false;

    // Set up timeout to prevent indefinite waiting
    this.checkoutTimeout = setTimeout(() => {
      if (!isCompleted) {
        paymentLogger.error('Razorpay checkout timeout', undefined, {
          timeout: this.CHECKOUT_TIMEOUT_MS,
        });
        isCompleted = true;
        onError({
          code: 'CHECKOUT_TIMEOUT',
          description: 'Payment checkout timed out. Please try again.',
          source: 'sdk',
          step: 'payment',
          reason: 'timeout',
        });
      }
    }, this.CHECKOUT_TIMEOUT_MS);

    try {
      paymentLogger.debug('Opening Razorpay checkout modal');

      // Call Razorpay open method
      const response = await this.razorpay.open(options);

      // Clear timeout
      this.clearCheckoutTimeout();

      if (isCompleted) {
        paymentLogger.warn('Razorpay response received after timeout');
        return;
      }

      isCompleted = true;

      // Razorpay returns response in different formats based on platform
      if (response) {
        const razorpayResponse: RazorpayResponse = {
          razorpay_payment_id: response.razorpay_payment_id || response.razorpayPaymentId || '',
          razorpay_order_id: response.razorpay_order_id || response.razorpayOrderId || '',
          razorpay_signature: response.razorpay_signature || response.razorpaySignature || '',
        };

        paymentLogger.flow('Razorpay payment', 'success', {
          payment_id: razorpayResponse.razorpay_payment_id,
          order_id: razorpayResponse.razorpay_order_id,
        });

        onSuccess(razorpayResponse);
      } else {
        // If response is empty, user likely cancelled
        paymentLogger.info('Payment cancelled by user');
        onError({
          code: 'PAYMENT_CANCELLED',
          description: 'Payment was cancelled',
          source: 'user',
          step: 'payment',
          reason: 'user_cancelled',
        });
      }
    } catch (error: unknown) {
      // Clear timeout
      this.clearCheckoutTimeout();

      if (isCompleted) {
        paymentLogger.warn('Razorpay error received after timeout');
        return;
      }

      isCompleted = true;

      // Handle Razorpay errors
      const errorObj = error as {
        code?: string;
        description?: string;
        message?: string;
        source?: string;
        step?: string;
        reason?: string;
        metadata?: Record<string, unknown>;
        error?: {
          code?: string;
          description?: string;
          source?: string;
          step?: string;
          reason?: string;
          metadata?: Record<string, unknown>;
        };
      };

      const razorpayError: RazorpayError = {
        code: errorObj.code || errorObj.error?.code || 'UNKNOWN_ERROR',
        description: errorObj.description || errorObj.error?.description || errorObj.message || 'Payment failed',
        source: errorObj.source || errorObj.error?.source || 'user',
        step: errorObj.step || errorObj.error?.step || 'payment',
        reason: errorObj.reason || errorObj.error?.reason || 'unknown',
        metadata: errorObj.metadata || errorObj.error?.metadata,
      };

      // Check if payment was cancelled (multiple ways it can be indicated)
      const isCancelled =
        razorpayError.code === 'PAYMENT_CANCELLED' ||
        razorpayError.code === '2' ||
        (razorpayError.code === 'UNKNOWN_ERROR' && razorpayError.description?.toLowerCase().includes('cancel'));

      // Log appropriately based on error type
      if (isCancelled) {
        paymentLogger.info('Payment cancelled by user');
      } else {
        paymentLogger.flow('Razorpay payment', 'error', {
          code: razorpayError.code,
          description: razorpayError.description,
        });
      }

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
