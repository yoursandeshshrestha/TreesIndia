"use client";

import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { MapPin, Clock, CreditCard, Phone, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { openAddressModal } from "@/store/slices/addressModalSlice";
import { openSlotModal } from "@/store/slices/slotModalSlice";
import { openContactInfoModal } from "@/store/slices/contactInfoModalSlice";
import { resetBooking } from "@/store/slices/bookingSlice";
import RazorpayCheckout from "@/components/Models/RazorpayCheckout";
import { bookingFlowApi } from "@/lib/bookingFlowApi";
import {
  useCreateBookingWithWallet,
  useCreateInquiryBookingWithWallet,
} from "@/hooks/useBookingFlow";
import { toast } from "sonner";
import { formatDateAndTime } from "@/utils/dateTimeUtils";
import { formatAmount } from "@/utils/formatters";
import { BookingSuccess } from "./BookingSuccess";
import { PaymentMethodModal } from "./PaymentMethodModal";

interface BookingSidebarProps {
  service?: {
    id: number;
    name: string;
    description: string;
    price: number | null;
    price_type: "fixed" | "inquiry";
    duration: string | null;
    images: string[] | null;
  };
  isInquiryService?: boolean;
}

export function BookingSidebar({
  service,
  isInquiryService,
}: BookingSidebarProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { selectedAddress, selectedDate, selectedTimeSlot, bookingForm } =
    useSelector((state: RootState) => state.booking);
  const { user } = useAuth();
  const { walletSummary } = useWallet();

  // Wallet booking mutations
  const createBookingWithWalletMutation = useCreateBookingWithWallet();
  const createInquiryBookingWithWalletMutation =
    useCreateInquiryBookingWithWallet();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<{
    id: string;
    amount: number;
    currency: string;
    key_id: string;
  } | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const isWalletBookingLoading =
    createBookingWithWalletMutation.isPending ||
    createInquiryBookingWithWalletMutation.isPending;
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  // Calculate total amount
  const itemTotal = service?.price || 0;
  const totalAmount = itemTotal;

  // Check if wallet payment is disabled
  const isWalletDisabled = (walletSummary?.current_balance || 0) < totalAmount;

  // Function to reset all booking data
  const resetBookingData = () => {
    // Reset all form data using the correct action
    dispatch(resetBooking());
    setSelectedPaymentMethod(null);
    setShowRazorpayCheckout(false);
    setRazorpayOrder(null);
    setCurrentBookingId(null);
    setShowSuccess(false);
    setSuccessMessage("");
  };

  // Reset booking state when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Cleanup function - reset booking state when component unmounts
      resetBookingData();
    };
  }, []);

  // Reset booking state when service changes (this is handled in BookingPage component)
  // No need for duplicate reset here since BookingPage handles it

  const handlePayNow = async (paymentMethod?: string) => {
    const methodToUse = paymentMethod || selectedPaymentMethod;

    if (!methodToUse) {
      toast.error("Please select a payment method");
      return;
    }

    if (!selectedAddress || !service) {
      toast.error("Please complete all booking details");
      return;
    }

    // For inquiry services, we don't need date and time slot
    if (!isInquiryService && (!selectedDate || !selectedTimeSlot)) {
      toast.error("Please complete all booking details");
      return;
    }

    setIsProcessingPayment(true);

    try {
      if (methodToUse === "wallet") {
        // Validate wallet balance
        if (isWalletDisabled) {
          toast.error(
            "Insufficient wallet balance. Please use Razorpay payment or recharge your wallet."
          );
          setIsProcessingPayment(false);
          return;
        }

        // Handle wallet payment
        if (isInquiryService) {
          // Handle inquiry booking with wallet
          const inquiryBookingData = {
            service_id: service.id,
            address: {
              name: selectedAddress.name,
              address: selectedAddress.address,
              city: selectedAddress.city,
              state: selectedAddress.state,
              country: selectedAddress.country,
              postal_code: selectedAddress.postal_code,
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude,
              landmark: selectedAddress.landmark || "",
              house_number: selectedAddress.house_number || "",
            },
            description: bookingForm.description || "",
            contact_person: bookingForm.contact_person || "",
            contact_phone: bookingForm.contact_phone || "",
            special_instructions: bookingForm.special_instructions || "",
          };

          await createInquiryBookingWithWalletMutation.mutateAsync(
            inquiryBookingData
          );

          setSuccessMessage(
            "Inquiry booking created successfully with wallet payment!"
          );
          setShowSuccess(true);
          setIsProcessingPayment(false);
        } else {
          // Handle fixed price booking with wallet
          const bookingData = {
            service_id: service.id,
            scheduled_date: selectedDate,
            scheduled_time: selectedTimeSlot!.time,
            address: {
              name: selectedAddress.name,
              address: selectedAddress.address,
              city: selectedAddress.city,
              state: selectedAddress.state,
              country: selectedAddress.country,
              postal_code: selectedAddress.postal_code,
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude,
              landmark: selectedAddress.landmark || "",
              house_number: selectedAddress.house_number || "",
            },
          };

          await createBookingWithWalletMutation.mutateAsync(bookingData);

          setSuccessMessage(
            "Booking created successfully with wallet payment!"
          );
          setShowSuccess(true);
          setIsProcessingPayment(false);
        }
      } else if (methodToUse === "razorpay") {
        if (isInquiryService) {
          // Handle inquiry booking
          const inquiryBookingData = {
            service_id: service.id,
            address: {
              name: selectedAddress.name,
              address: selectedAddress.address,
              city: selectedAddress.city,
              state: selectedAddress.state,
              country: selectedAddress.country,
              postal_code: selectedAddress.postal_code,
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude,
              landmark: selectedAddress.landmark || "",
              house_number: selectedAddress.house_number || "",
            },
            description: bookingForm.description || "",
            contact_person: bookingForm.contact_person || "",
            contact_phone: bookingForm.contact_phone || "",
            special_instructions: bookingForm.special_instructions || "",
          };

          const response = await bookingFlowApi.createInquiryBooking(
            inquiryBookingData
          );

          if (response.data.payment_required && response.data.payment_order) {
            const order = response.data.payment_order as {
              id: string;
              amount: number;
              currency: string;
              key_id: string;
            };
            setRazorpayOrder(order);
            setCurrentBookingId(response.data.booking?.ID || null);
            setShowRazorpayCheckout(true);
          } else {
            toast.success(
              "Inquiry booking created successfully! We'll contact you with a detailed quote."
            );
            router.push("/profile/my-bookings");
          }
        } else {
          // Handle fixed price booking
          const bookingData = {
            service_id: service.id,
            scheduled_date: selectedDate,
            scheduled_time: selectedTimeSlot!.time,
            address: {
              name: selectedAddress.name,
              address: selectedAddress.address,
              city: selectedAddress.city,
              state: selectedAddress.state,
              country: selectedAddress.country,
              postal_code: selectedAddress.postal_code,
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude,
              landmark: selectedAddress.landmark || "",
              house_number: selectedAddress.house_number || "",
            },
          };

          const response = await bookingFlowApi.createBooking(bookingData);

          if (response.payment_required && response.payment_order) {
            const order = response.payment_order as {
              id: string;
              amount: number;
              currency: string;
              key_id: string;
            };
            setRazorpayOrder(order);
            setCurrentBookingId(response.booking.ID || null);
            setShowRazorpayCheckout(true);
          } else {
            toast.success("Booking created successfully!");
            router.push("/profile/my-bookings");
          }
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      // Error messages are already handled by the mutation hooks
      setIsProcessingPayment(false);
    }
  };

  const handleRazorpaySuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      if (isInquiryService) {
        // Handle inquiry payment verification
        const verifyResponse = await bookingFlowApi.verifyInquiryPayment({
          service_id: service!.id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
        });

        setSuccessMessage(
          "Inquiry payment successful! We'll contact you with a detailed quote."
        );
        setShowSuccess(true);
      } else {
        // Handle fixed price payment verification
        if (!currentBookingId) {
          toast.error("Payment verification failed. Please try again.");
          return;
        }

        const verifyResponse = await bookingFlowApi.verifyPayment(
          currentBookingId,
          {
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_signature: paymentData.razorpay_signature,
          }
        );

        setSuccessMessage(
          "Payment successful! Your booking has been confirmed."
        );
        setShowSuccess(true);
      }

      setShowRazorpayCheckout(false);
      setRazorpayOrder(null);
      setCurrentBookingId(null);
      setSelectedPaymentMethod(null);
      setIsProcessingPayment(false);
    } catch (error) {
      toast.error("Payment verification failed. Please contact support.");
    }
  };

  const handleRazorpayFailure = (error: unknown) => {
    toast.error("Payment failed. Please try again.");
    setShowRazorpayCheckout(false);
    setRazorpayOrder(null);
    setCurrentBookingId(null);
    setSelectedPaymentMethod(null);
    setIsProcessingPayment(false);
  };

  const handleRazorpayClose = () => {
    setShowRazorpayCheckout(false);
    setRazorpayOrder(null);
    setCurrentBookingId(null);
    setSelectedPaymentMethod(null);
    setIsProcessingPayment(false);
  };

  return (
    <div className="w-120 bg-white p-6 pr-0 ">
      {/* Booking Details Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        {/* Send booking details to */}
        <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">
              Send booking details to
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {user?.phone || "+91 8597831351"}
            </p>
          </div>
        </div>

        {/* Address */}
        <div
          className={`flex items-center gap-3 ${
            !selectedAddress ? "mb-4" : "mb-0"
          }`}
        >
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Address</p>
            {selectedAddress && (
              <div className="mt-1">
                <p className="text-gray-600 text-xs">
                  <span className="text-gray-900 font-medium">
                    {selectedAddress.name}
                  </span>{" "}
                  -{" "}
                  {selectedAddress.house_number &&
                    `${selectedAddress.house_number},  `}
                  {selectedAddress.city}, {selectedAddress.address}
                </p>
              </div>
            )}
          </div>
          {selectedAddress && (
            <button
              onClick={() => dispatch(openAddressModal({}))}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer self-center"
            >
              Change
            </button>
          )}
        </div>

        {/* Select Address Button */}
        {!selectedAddress && (
          <button
            onClick={() => dispatch(openAddressModal({}))}
            className="w-full bg-[#00a871] hover:bg-[#009a65] text-white px-4 py-2 rounded-lg text-sm font-medium  transition-colors cursor-pointer"
          >
            Select an address
          </button>
        )}

        {/* Border */}
        <div className="border-b border-gray-200 pb-4 mb-4"></div>

        {/* Slot - Only for fixed price services */}
        {!isInquiryService && (
          <>
            <div
              className={`flex items-center gap-3 ${
                selectedAddress && !selectedDate ? "mb-4" : "mb-0"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedAddress ? "bg-gray-100" : "bg-gray-50"
                }`}
              >
                <Clock
                  className={`w-4 h-4 ${
                    selectedAddress ? "text-gray-600" : "text-gray-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold text-sm ${
                    selectedAddress ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  Slot
                </p>
                {selectedDate && selectedTimeSlot && (
                  <div className="mt-1">
                    <p className="text-gray-900 text-sm font-medium">
                      {formatDateAndTime(selectedDate, selectedTimeSlot.time)}
                    </p>
                  </div>
                )}
              </div>
              {selectedAddress && selectedDate && selectedTimeSlot && (
                <button
                  onClick={() => dispatch(openSlotModal())}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer self-center"
                >
                  Change
                </button>
              )}
            </div>

            {/* Select Slot Button */}
            {selectedAddress && !selectedDate && (
              <button
                onClick={() => dispatch(openSlotModal())}
                className="w-full bg-[#00a871] hover:bg-[#009a65] text-white px-4 py-2 rounded-lg text-sm font-medium mb-4 transition-colors cursor-pointer"
              >
                Select slot
              </button>
            )}
          </>
        )}

        {/* Contact Details - Only for inquiry services */}
        {isInquiryService && (
          <>
            <div
              className={`flex items-center gap-3 ${
                selectedAddress && !bookingForm.contact_person ? "mb-4" : "mb-0"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedAddress ? "bg-gray-100" : "bg-gray-50"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    selectedAddress ? "text-gray-600" : "text-gray-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold text-sm ${
                    selectedAddress ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  Contact Details
                </p>
                {selectedAddress ? (
                  bookingForm.contact_person && bookingForm.contact_phone ? (
                    <div className="mt-1">
                      <p className="text-gray-600 text-xs">
                        <span className="text-gray-900 font-medium">
                          {bookingForm.contact_person}
                        </span>{" "}
                        - {bookingForm.contact_phone}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1">
                      Contact information not provided
                    </p>
                  )
                ) : (
                  <p className="text-gray-400 text-xs mt-1">
                    Select an address first
                  </p>
                )}
              </div>
              {selectedAddress && bookingForm.contact_person && (
                <button
                  onClick={() => dispatch(openContactInfoModal())}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer self-center"
                >
                  Change
                </button>
              )}
            </div>

            {/* Add Contact Info Button */}
            {selectedAddress && !bookingForm.contact_person && (
              <button
                onClick={() => dispatch(openContactInfoModal())}
                className="w-full bg-[#00a871] hover:bg-[#009a65] text-white px-4 py-2 rounded-lg text-sm font-medium mb-4 transition-colors cursor-pointer"
              >
                Add contact information
              </button>
            )}
          </>
        )}

        {/* Border */}
        <div className="border-b border-gray-200 pb-4 mb-4"></div>

        {/* Payment Method */}
        <div
          className={`flex items-center gap-3 ${
            selectedAddress &&
            (isInquiryService
              ? bookingForm.contact_person
                ? true
                : false
              : selectedDate && selectedTimeSlot)
              ? "mb-4"
              : "mb-0"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              selectedAddress &&
              (isInquiryService
                ? bookingForm.contact_person
                  ? true
                  : false
                : selectedDate && selectedTimeSlot)
                ? "bg-gray-100"
                : "bg-gray-50"
            }`}
          >
            <CreditCard
              className={`w-4 h-4 ${
                selectedAddress &&
                (isInquiryService
                  ? bookingForm.contact_person
                    ? true
                    : false
                  : selectedDate && selectedTimeSlot)
                  ? "text-gray-600"
                  : "text-gray-400"
              }`}
            />
          </div>
          <div className="flex-1">
            <p
              className={`font-semibold text-sm ${
                selectedAddress &&
                (isInquiryService
                  ? bookingForm.contact_person
                    ? true
                    : false
                  : selectedDate && selectedTimeSlot)
                  ? "text-gray-900"
                  : "text-gray-400"
              }`}
            >
              Payment Method
            </p>
            {selectedAddress &&
              (isInquiryService
                ? bookingForm.contact_person
                  ? true
                  : false
                : selectedDate && selectedTimeSlot) && (
                <p className="text-gray-400 text-sm mt-1">
                  Select payment method
                </p>
              )}
          </div>
        </div>

        {/* Pay Now Button */}
        {selectedAddress &&
          (isInquiryService
            ? bookingForm.contact_person
              ? true
              : false
            : selectedDate && selectedTimeSlot) && (
            <div className="mb-4">
              <button
                onClick={() => setShowPaymentMethodModal(true)}
                className="w-full bg-[#00a871] hover:bg-[#009a65] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Pay Now
              </button>
            </div>
          )}
      </div>

      {/* Cancellation Policy */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          Cancellation policy
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Free cancellations if done more than 12 hrs before the service or if a
          professional isn&apos;t assigned. A fee will be charged otherwise.
        </p>
        <button className="text-blue-600 text-sm underline hover:text-blue-700">
          Read full policy
        </button>
      </div>

      {/* Razorpay Checkout */}
      {showRazorpayCheckout && razorpayOrder && (
        <RazorpayCheckout
          order={razorpayOrder}
          onSuccess={handleRazorpaySuccess}
          onFailure={handleRazorpayFailure}
          onClose={handleRazorpayClose}
        />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <BookingSuccess
          message={successMessage}
          onClose={() => {
            resetBookingData();
            router.push("/profile/my-bookings");
          }}
        />
      )}

      {/* Payment Method Modal */}
      {showPaymentMethodModal && (
        <PaymentMethodModal
          isOpen={showPaymentMethodModal}
          onClose={() => setShowPaymentMethodModal(false)}
          onPaymentMethodSelect={(method) => {
            setSelectedPaymentMethod(method);
            setShowPaymentMethodModal(false);
            // Call handlePayNow directly with the selected method
            handlePayNow(method);
          }}
          service={service}
          totalAmount={totalAmount}
          isWalletDisabled={isWalletDisabled}
          walletBalance={walletSummary?.current_balance || 0}
        />
      )}
    </div>
  );
}
