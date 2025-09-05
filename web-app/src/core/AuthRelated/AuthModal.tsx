"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Lottie from "lottie-react";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeAuthModal } from "@/store/slices/authModalSlice";
import { PhoneInput } from "./PhoneInput";
import { OTPInput } from "./OTPInput";
import { OTPTimer } from "./OTPTimer";

type AuthStep = "phone" | "otp" | "success";

export const AuthModal: React.FC = () => {
  const { requestOTP, verifyOTP, isLoading, error, clearError } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector((state) => state.authModal.isOpen);
  const redirectTo = useAppSelector((state) => state.authModal.redirectTo);
  const [successAnimation, setSuccessAnimation] = useState(null);
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  // Load success animation
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch("/images/auth/success.json");
        const animation = await response.json();
        setSuccessAnimation(animation);
      } catch (error) {
        console.error("Error loading success animation:", error);
      }
    };
    loadAnimation();
  }, []);

  // Reset state when modal closes (not when it opens)
  useEffect(() => {
    if (!isOpen) {
      // Only reset state when modal is actually closed and not in the middle of OTP verification
      if (!isVerifyingOTP) {
        setStep("phone");
        setPhone("");
        setOtp("");
        setPhoneError("");
        setOtpError("");
        setIsNewUser(false);
        clearError();
      }
    }
  }, [isOpen, clearError, isVerifyingOTP]);

  // Handle phone number validation
  const validatePhone = (phoneNumber: string): boolean => {
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (phoneNumber.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Handle OTP validation
  const validateOTP = (otpValue: string): boolean => {
    if (!otpValue) {
      setOtpError("OTP is required");
      return false;
    }
    if (otpValue.length !== 6) {
      setOtpError("Please enter a 6-digit OTP");
      return false;
    }
    setOtpError("");
    return true;
  };

  // Handle phone number submission
  const handlePhoneSubmit = async () => {
    if (!validatePhone(phone)) return;

    try {
      const fullPhone = countryCode + phone;
      const response = await requestOTP(fullPhone);
      setIsNewUser(response.is_new_user);
      setStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  // Handle OTP submission
  const handleOTPSubmit = async (otpValue?: string) => {
    const otpToUse = otpValue || otp;

    if (!validateOTP(otpToUse)) {
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const fullPhone = countryCode + phone;
      const response = await verifyOTP(fullPhone, otpToUse);
      setIsNewUser(response.is_new_user);
      setStep("success");

      // Auto-close modal and redirect after success
      setTimeout(() => {
        setIsVerifyingOTP(false);
        dispatch(closeAuthModal());
        if (redirectTo) {
          router.push(redirectTo);
        }
      }, 2000);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setIsVerifyingOTP(false);
      // Don't reset the step on error - stay on OTP step
    }
  };

  // Handle back button
  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
      setOtp("");
      setOtpError("");
      setIsVerifyingOTP(false);
      clearError();
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    setIsVerifyingOTP(false);
    dispatch(closeAuthModal());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="relative"
          >
            {/* Close Button - Positioned on top of the modal */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={handleClose}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-2xl min-w-lg max-w-lg w-full shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Content */}
              <div className="p-6">
                {step === "phone" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", damping: 20 }}
                        className="mb-4"
                      >
                        <Image
                          src="/images/auth/phone.png"
                          alt="Phone"
                          width={48}
                          height={48}
                          className="w-12 h-12"
                        />
                      </motion.div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Enter your phone number
                      </h3>
                      <p className="text-sm text-gray-600">
                        We&apos;ll send you a text with a verification code.
                        Standard tariff may apply.
                      </p>
                    </div>

                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      countryCode={countryCode}
                      onCountryCodeChange={setCountryCode}
                      error={phoneError || error || undefined}
                      disabled={isLoading}
                      placeholder="Enter your phone number"
                      onEnter={handlePhoneSubmit}
                    />

                    <motion.button
                      onClick={handlePhoneSubmit}
                      disabled={isLoading || phone.length !== 10}
                      className="w-full bg-gray-300 text-gray-500 cursor-pointer py-3 px-4 rounded-lg font-medium
                                hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a871]
                                disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                                data-[active=true]:bg-[#00a871] data-[active=true]:text-white data-[active=true]:hover:bg-[#00a871]/90"
                      data-active={phone.length === 10}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        "Continue"
                      )}
                    </motion.button>

                    <p className="text-xs text-gray-500 text-center">
                      By continuing, you agree to our{" "}
                      <a href="#" className="underline text-[#00a871]">
                        T&C
                      </a>{" "}
                      and{" "}
                      <a href="#" className="underline text-[#00a871]">
                        Privacy policy
                      </a>
                      .
                    </p>
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center mb-4">
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ delay: 0.1, type: "spring", damping: 20 }}
                        onClick={handleBack}
                        disabled={isLoading}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </motion.button>
                    </div>
                    <div className="text-left">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", damping: 20 }}
                        className="mb-4"
                      >
                        <Image
                          src="/images/auth/sms.png"
                          alt="SMS"
                          width={48}
                          height={48}
                          className="w-12 h-12"
                        />
                      </motion.div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Enter verification code
                      </h3>
                      <p className="text-sm text-gray-600">
                        A 6-digit verification code has been sent to{" "}
                        <span className="font-medium text-gray-900">
                          {countryCode + phone}
                        </span>
                      </p>
                    </div>

                    <OTPInput
                      value={otp}
                      onChange={setOtp}
                      error={otpError || error || undefined}
                      disabled={isLoading}
                      onComplete={(completedOtp) => {
                        handleOTPSubmit(completedOtp);
                      }}
                    />

                    <OTPTimer
                      duration={60}
                      onResend={handlePhoneSubmit}
                      className="mt-4"
                      isLoading={isLoading}
                    />
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", damping: 20 }}
                      className="w-32 h-32 mx-auto"
                    >
                      {successAnimation && (
                        <Lottie
                          animationData={successAnimation}
                          loop={false}
                          autoplay={true}
                        />
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isNewUser ? "Welcome to TreesIndia!" : "Welcome back!"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isNewUser
                          ? "Your account has been created successfully."
                          : "You have been signed in successfully."}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
