"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { SubscriptionPlanCard } from "@/core/SubscriptionPlansPage/components/SubscriptionPlanCard";
import { PaymentMethodModal } from "@/commonComponents/PaymentMethodModel/PaymentMethodModal";
import { SuccessModal } from "@/commonComponents/SuccessModal";
import RazorpayCheckout from "@/commonComponents/razorpay/RazorpayCheckout";
import { useWallet } from "@/hooks/useWallet";
import { SubscriptionPlan } from "@/types/subscription";

export const SubscriptionPlansPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const {
    groupedPlan,
    groupedPlans,
    loading,
    error,
    purchase,
    createPaymentOrder,
    completePurchase,
    fetchAllGroupedPlans,
  } = useSubscription();
  const { walletSummary } = useWallet(false); // Only need wallet summary, not transactions

  const walletBalance = walletSummary?.current_balance || 0;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<{
    id: string;
    amount: number;
    currency: string;
    key_id: string;
    payment_id?: number;
  } | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Fetch grouped plans when component mounts
  useEffect(() => {
    fetchAllGroupedPlans();
  }, [fetchAllGroupedPlans]);

  const handleAuthRequired = () => {
    dispatch(openAuthModal({ redirectTo: "/subscription-plans" }));
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method: "wallet" | "razorpay") => {
    if (!selectedPlan) return;

    setPurchaseLoading(true);
    try {
      if (method === "wallet") {
        // Handle wallet payment
        await purchase({
          plan_id: selectedPlan.ID,
          payment_method: method,
        });

        setShowPaymentModal(false);
        setSelectedPlan(null);
        setShowSuccessModal(true);
      } else if (method === "razorpay") {
        // Handle Razorpay payment
        // Determine duration type from the selected plan
        const durationType =
          selectedPlan.duration_type ||
          (selectedPlan.pricing && selectedPlan.pricing.length > 0
            ? selectedPlan.pricing[0].duration_type
            : "monthly");

        const paymentData = await createPaymentOrder(
          selectedPlan.ID,
          durationType
        );

        setPaymentOrder({
          id: paymentData.order.id,
          amount: paymentData.order.amount,
          currency: paymentData.order.currency,
          key_id: paymentData.key_id,
          payment_id: paymentData.payment.ID,
        });

        setShowPaymentModal(false);
        setShowRazorpayCheckout(true);
      }
    } catch (error) {
      console.error("Purchase failed:", error);

      // Extract error message from the error object
      let errorMessage = "Failed to purchase subscription. Please try again.";

      if (error instanceof Error) {
        // Check if the error message contains the specific API error
        if (error.message.includes("user already has active subscription")) {
          errorMessage = "User already has active subscription";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    router.push("/profile/subscription");
  };

  const handleRazorpaySuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    if (isPaymentProcessing) {
      console.log(
        "Payment already being processed, ignoring duplicate success callback"
      );
      return;
    }

    if (!paymentOrder?.payment_id) {
      console.error("Payment order not found");
      setShowRazorpayCheckout(false);
      setPaymentOrder(null);
      setIsPaymentProcessing(false);
      toast.error("Payment order not found. Please try again.");
      return;
    }

    setIsPaymentProcessing(true);
    setShowRazorpayCheckout(false);

    try {
      await completePurchase(
        paymentOrder.payment_id,
        paymentData.razorpay_payment_id,
        paymentData.razorpay_signature
      );

      setPaymentOrder(null);
      setSelectedPlan(null);
      setIsPaymentProcessing(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Payment completion failed:", error);
      setShowRazorpayCheckout(false);
      setPaymentOrder(null);
      setIsPaymentProcessing(false);
      toast.error("Payment verification failed. Please contact support.");
    }
  };

  const handleRazorpayFailure = (error: unknown) => {
    console.error("Razorpay payment failed:", error);
    setShowRazorpayCheckout(false);
    setPaymentOrder(null);
    setSelectedPlan(null);
    setIsPaymentProcessing(false);
    toast.error("Payment failed. Please try again.");
  };

  const handleRazorpayClose = () => {
    setShowRazorpayCheckout(false);
    setPaymentOrder(null);
    setSelectedPlan(null);
    setIsPaymentProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="text-center mb-12">
              <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-80 mx-auto mb-8"></div>
            </div>

            {/* Duration Toggle Skeleton */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg">
                <div className="flex gap-1">
                  <div className="h-10 bg-gray-200 rounded-md w-20"></div>
                  <div className="h-10 bg-gray-200 rounded-md w-24"></div>
                </div>
              </div>
            </div>

            {/* Plan Card Skeleton */}
            <div className="flex justify-center items-center mb-12">
              <div className="w-full max-w-md">
                <div className="relative rounded-2xl p-8 bg-gray-200">
                  {/* Plan name */}
                  <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>

                  {/* Plan description */}
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>

                  {/* Price */}
                  <div className="h-10 bg-gray-300 rounded w-24 mb-6"></div>

                  {/* Button */}
                  <div className="h-12 bg-gray-300 rounded-lg w-full mb-8"></div>

                  {/* Features section */}
                  <div className="pt-6 border-t border-gray-300">
                    <div className="h-5 bg-gray-300 rounded w-28 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center">
                          <div className="w-4 h-4 bg-gray-300 rounded mr-3"></div>
                          <div className="h-4 bg-gray-300 rounded flex-1"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Handle the case where user already has an active subscription
    if (error.includes("user already has active subscription")) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="font-medium text-blue-800">
                    You Already Have an Active Subscription
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    You already have an active subscription. You can manage your
                    subscription from your profile.
                  </p>
                  <button
                    onClick={() => router.push("/profile/subscription")}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    View My Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handle other errors
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">
                  Error Loading Plans
                </h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            One Platform, All Solutions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the right plan for your service journey.
          </p>
        </div>

        {/* Savings Info */}
        {groupedPlans.length > 0 &&
          groupedPlans[0] &&
          groupedPlans[0].monthly &&
          groupedPlans[0].yearly &&
          groupedPlans[0].monthly.price &&
          groupedPlans[0].yearly.price && (
            <div className="flex justify-center mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-800 font-medium">
                    💰 Save{" "}
                    {Math.round(
                      (1 -
                        groupedPlans[0].yearly.price /
                          (groupedPlans[0].monthly.price * 12)) *
                        100
                    )}
                    % with Yearly Plan
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Plan Cards - Show both Monthly and Yearly side by side */}
        {groupedPlans.length > 0 ? (
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedPlans.map((groupedPlan) => (
                <React.Fragment key={`${groupedPlan.name}-container`}>
                  {/* Monthly Plan */}
                  {groupedPlan.monthly && (
                    <SubscriptionPlanCard
                      key={`${groupedPlan.name}-monthly`}
                      plan={groupedPlan.monthly}
                      onSelect={handleSelectPlan}
                      onAuthRequired={
                        !isAuthenticated ? handleAuthRequired : undefined
                      }
                      isPopular={false}
                    />
                  )}

                  {/* Yearly Plan */}
                  {groupedPlan.yearly && (
                    <SubscriptionPlanCard
                      key={`${groupedPlan.name}-yearly`}
                      plan={groupedPlan.yearly}
                      onSelect={handleSelectPlan}
                      onAuthRequired={
                        !isAuthenticated ? handleAuthRequired : undefined
                      }
                      isPopular={true} // Mark yearly as popular for savings
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : groupedPlan && (groupedPlan.monthly || groupedPlan.yearly) ? (
          // Fallback to single plan display for backward compatibility
          <div className="flex justify-center items-center mb-12">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedPlan.monthly && (
                <SubscriptionPlanCard
                  plan={groupedPlan.monthly}
                  onSelect={handleSelectPlan}
                  onAuthRequired={
                    !isAuthenticated ? handleAuthRequired : undefined
                  }
                  isPopular={false}
                />
              )}
              {groupedPlan.yearly && (
                <SubscriptionPlanCard
                  plan={groupedPlan.yearly}
                  onSelect={handleSelectPlan}
                  onAuthRequired={
                    !isAuthenticated ? handleAuthRequired : undefined
                  }
                  isPopular={true}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center mb-12">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Subscription Plans Available
                </h3>
                <p className="text-gray-600 mb-4">
                  We&apos;re currently setting up our subscription plans. Please
                  check back later or contact support for assistance.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How does auto-approval work?
              </h3>
              <p className="text-gray-600 text-sm">
                With an active subscription, your property listings are
                automatically approved and go live immediately without waiting
                for admin review.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time. However,
                you&apos;ll lose access to premium features and auto-approval.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept payments through your wallet balance or Razorpay
                (credit/debit cards, UPI, net banking).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600 text-sm">
                Refunds are handled on a case-by-case basis. Please contact our
                support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        totalAmount={selectedPlan?.price || 0}
        isWalletDisabled={walletBalance < (selectedPlan?.price || 0)}
        walletBalance={walletBalance}
        isLoading={purchaseLoading}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Subscription Activated!"
        message="Congratulations! Your premium subscription is now active. You can enjoy auto-approval for property listings and access to all premium features."
        buttonText="View My Subscription"
        onButtonClick={handleSuccessContinue}
      />

      {/* Razorpay Checkout */}
      {showRazorpayCheckout && paymentOrder && !isPaymentProcessing && (
        <RazorpayCheckout
          order={paymentOrder}
          description={`Subscription: ${selectedPlan?.name || "Premium Plan"}`}
          onSuccess={handleRazorpaySuccess}
          onFailure={handleRazorpayFailure}
          onClose={handleRazorpayClose}
        />
      )}

      {/* Payment Verification Loading Overlay */}
      {isPaymentProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-[#00a871]/10 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#00a871] animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  Verifying Payment
                </h3>
                <p className="text-gray-600 text-sm">
                  Please wait while we confirm your payment. This will only take
                  a moment...
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#00a871] rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
                  style={{
                    width: "60%",
                    animation: "loading 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
            width: 0%;
          }
          50% {
            transform: translateX(0%);
            width: 100%;
          }
          100% {
            transform: translateX(100%);
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};
