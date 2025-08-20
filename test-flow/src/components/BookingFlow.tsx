"use client";

// Declare Razorpay global type
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    paylater?: boolean;
  };
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

import { useState, useEffect } from "react";
import {
  apiService,
  Category,
  Subcategory,
  Service,
  AvailableSlot,
  AvailabilityResponse,
  BookingRequest,
} from "../lib/api";
import { ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

interface BookingFlowProps {
  token: string;
}

export default function BookingFlow({ token }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityResponse | null>(null);
  const [bookingConfig, setBookingConfig] = useState<Record<string, string>>(
    {}
  );

  // Selection states
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<AvailableSlot | null>(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState<BookingRequest>({
    service_id: 0,
    scheduled_date: "",
    scheduled_time: "",
    address: "",
    description: "",
    contact_person: "",
    contact_phone: "",
    special_instructions: "",
  });

  // Results state
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    if (token) {
      apiService.setAuthToken(token);
      loadCategories();
    }
    loadBookingConfig();
  }, [token]);

  const loadBookingConfig = async () => {
    try {
      const config = await apiService.getBookingConfig();
      setBookingConfig(config);
    } catch (err) {
      console.error("Failed to load booking config:", err);
      // Use default values if config fails to load
      setBookingConfig({
        working_hours_start: "09:00",
        working_hours_end: "22:00",
        booking_advance_days: "7",
        booking_buffer_time_minutes: "30",
      });
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryId: number) => {
    try {
      setLoading(true);
      const data = await apiService.getSubcategories(categoryId);
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load subcategories");
      console.error(err);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (subcategoryId: number) => {
    try {
      setLoading(true);
      const data = await apiService.getServices(subcategoryId);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load services");
      console.error(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (serviceId: number, date: string) => {
    try {
      setLoading(true);
      const data = await apiService.getAvailableSlots(serviceId, date);
      setAvailabilityData(data);
    } catch (err) {
      console.error("Failed to load available slots:", err);
      setAvailabilityData(null);
      setError("Failed to load available slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedService(null);
    setSubcategories([]);
    setServices([]);
    loadSubcategories(category.id);
    setStep(2);
  };

  const handleSubcategorySelect = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedService(null);
    setServices([]);
    loadServices(subcategory.id);
    setStep(3);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingForm((prev) => ({ ...prev, service_id: service.id }));

    if (service.price_type === "inquiry") {
      // For inquiry-based services, go directly to booking creation
      handleInquiryBooking(service);
    } else {
      // For fixed-price services, continue with normal flow
      setStep(4);
    }
  };

  const handleInquiryBooking = async (service: Service) => {
    try {
      setLoading(true);
      setError("");

      console.log("Creating inquiry booking for service:", service);

      // Create inquiry booking with just service_id
      const result = await apiService.createInquiryBooking({
        service_id: service.id,
      });

      console.log("Inquiry booking result:", result);

      if (result.payment_required && result.payment_order) {
        console.log("Payment required, triggering payment flow");
        console.log("Payment order details:", result.payment_order);
        // Payment required - trigger Razorpay payment
        handleInquiryPayment(result.payment_order);
        // Don't set step 7 here - wait for payment completion
      } else {
        console.log("No payment required, showing success directly");
        // No payment required - show success directly
        setBookingResult({ booking: result.booking });
        setStep(7);
      }
    } catch (err: any) {
      console.error("Inquiry booking error:", err);
      setError(err.response?.data?.error || "Failed to create inquiry booking");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryPayment = (paymentOrder: any) => {
    console.log("handleInquiryPayment called with:", {
      paymentOrder,
    });

    // Capture the service ID to use in the Razorpay handler
    const serviceId = selectedService?.id;
    const serviceName = selectedService?.name;

    if (!serviceId) {
      console.error("Service ID not available for payment verification");
      alert("Service information not available. Please try again.");
      return;
    }

    // Load Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      // Initialize Razorpay
      const options = {
        key: paymentOrder.key_id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Trees India Services",
        description: `Inquiry Booking Fee - ${serviceName}`,
        order_id: paymentOrder.order_id,
        // Enable all payment methods including UPI
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
        },
        handler: async function (response: any) {
          try {
            console.log("Payment response:", response);

            // Verify payment and create booking
            const verificationData = {
              service_id: serviceId,
              razorpay_order_id: paymentOrder.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: "", // Will be handled via webhook
            };

            console.log("Verification data:", verificationData);

            // Verify payment on backend and create booking
            const verificationResult = await apiService.verifyInquiryPayment(
              verificationData
            );

            // Set the booking result with the created booking
            setBookingResult({ booking: verificationResult });

            // Show success message
            alert("Payment successful! Your inquiry has been submitted.");
            setStep(7); // Go to result step
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "", // Will be filled from user profile
          contact: "", // Will be filled from user profile
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    document.head.appendChild(script);
  };

  const handleDateSelect = (date: string) => {
    if (selectedService) {
      setBookingForm((prev) => ({ ...prev, scheduled_date: date }));
      loadAvailableSlots(selectedService.id, date);
      setStep(5);
    }
  };

  const handleTimeSlotSelect = (timeSlot: AvailableSlot) => {
    setSelectedTimeSlot(timeSlot);

    setBookingForm((prev) => ({
      ...prev,
      scheduled_time: timeSlot.time, // Use the time directly from the slot
    }));
    setStep(6);
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (selectedService?.price_type === "fixed") {
        // Fixed price service - create payment order first
        const result = await apiService.createPaymentOrder(bookingForm);
        console.log("Payment order result:", result);
        console.log("Payment order:", result.payment_order);
        console.log("Booking reference:", result.booking_reference);

        // Store booking form data for later use after payment
        setBookingForm((prev) => ({
          ...prev,
          booking_reference: result.booking_reference,
        }));

        // Automatically trigger Razorpay payment modal
        if (result.payment_order) {
          handleRazorpayPayment(result.payment_order, result.booking_reference);
        } else {
          console.error("Missing payment_order:", result);
        }

        setStep(6);
      } else {
        // Inquiry-based service - create without payment
        const result = await apiService.createBooking(bookingForm);
        setBookingResult({ booking: result });
        setStep(6);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create payment order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = (
    paymentOrder: any,
    bookingReference: string
  ) => {
    console.log("handleRazorpayPayment called with:", {
      paymentOrder,
      bookingReference,
    });

    // Store bookingReference in a variable that will be captured in the closure
    const capturedBookingReference = bookingReference;

    // Load Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      // Initialize Razorpay
      const options = {
        key: paymentOrder.key_id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Trees India Services",
        description: `Booking Payment - ${selectedService?.name}`,
        order_id: paymentOrder.order_id,
        // Enable all payment methods including UPI
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
        },
        handler: async function (response: any) {
          try {
            console.log("Payment response:", response);
            console.log(
              "Captured Booking Reference:",
              capturedBookingReference
            );

            // Verify payment and create booking on backend
            const verificationData = {
              ...bookingForm,
              razorpay_order_id: paymentOrder.id, // Use the order ID from the payment order
              razorpay_payment_id: response.razorpay_payment_id,
              // Note: razorpay_signature is not available in frontend callback
              // Signature verification will be handled via webhook
            };

            console.log("Verification data:", verificationData);

            const booking = await apiService.verifyPaymentAndCreateBooking(
              verificationData
            );

            // Set the booking result
            setBookingResult({ booking });

            // Show success message
            alert("Payment successful! Your booking has been confirmed.");
            resetFlow();
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: bookingForm.contact_person || "",
          contact: bookingForm.contact_phone || "",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    document.head.appendChild(script);
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedService(null);
    setSelectedTimeSlot(null);
    setBookingForm({
      service_id: 0,
      time_slot_id: 0,
      scheduled_date: "",
      scheduled_time: "",
      address: "",
      description: "",
      contact_person: "",
      contact_phone: "",
      special_instructions: "",
    });
    setBookingResult(null);
    setError("");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <CategorySelection
            categories={categories}
            onSelect={handleCategorySelect}
            loading={loading}
          />
        );
      case 2:
        return (
          <SubcategorySelection
            subcategories={subcategories}
            onSelect={handleSubcategorySelect}
            loading={loading}
          />
        );
      case 3:
        return (
          <ServiceSelection
            services={services}
            onSelect={handleServiceSelect}
            loading={loading}
          />
        );
      case 4:
        return (
          <DateSelection
            onSelect={handleDateSelect}
            service={selectedService}
            bookingConfig={bookingConfig}
          />
        );
      case 5:
        return (
          <TimeSlotSelection
            availabilityData={availabilityData}
            onSelect={handleTimeSlotSelect}
            loading={loading}
            onRefresh={() => {
              if (selectedService && bookingForm.scheduled_date) {
                loadAvailableSlots(
                  selectedService.id,
                  bookingForm.scheduled_date
                );
              }
            }}
          />
        );
      case 6:
        return (
          <BookingForm
            form={bookingForm}
            setForm={setBookingForm}
            onSubmit={handleBookingSubmit}
            loading={loading}
            service={selectedService}
          />
        );
      case 7:
        return <BookingResult result={bookingResult} onReset={resetFlow} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Service Booking Flow
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {selectedService?.price_type === "inquiry"
            ? // Simplified 3-step flow for inquiry-based services
              [1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= stepNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <ChevronRight
                      className={`mx-2 ${
                        step > stepNumber ? "text-blue-600" : "text-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))
            : // Full 6-step flow for fixed-price services
              [1, 2, 3, 4, 5, 6].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= stepNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
                  </div>
                  {stepNumber < 6 && (
                    <ChevronRight
                      className={`mx-2 ${
                        step > stepNumber ? "text-blue-600" : "text-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">{renderStep()}</div>
    </div>
  );
}

// Step Components
function CategorySelection({
  categories,
  onSelect,
  loading,
}: {
  categories: Category[];
  onSelect: (category: Category) => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Select Category</h2>
      {loading ? (
        <div className="text-center py-8">Loading categories...</div>
      ) : !categories || categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No categories available. Please try again later.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <p className="text-gray-600 text-sm mt-1">
                {category.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SubcategorySelection({
  subcategories,
  onSelect,
  loading,
}: {
  subcategories: Subcategory[];
  onSelect: (subcategory: Subcategory) => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Select Subcategory</h2>
      {loading ? (
        <div className="text-center py-8">Loading subcategories...</div>
      ) : !subcategories || subcategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No subcategories available for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => onSelect(subcategory)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <h3 className="font-semibold text-lg">{subcategory.name}</h3>
              <p className="text-gray-600 text-sm mt-1">
                {subcategory.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceSelection({
  services,
  onSelect,
  loading,
}: {
  services: Service[];
  onSelect: (service: Service) => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Select Service</h2>
      {loading ? (
        <div className="text-center py-8">Loading services...</div>
      ) : !services || services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No services available for this subcategory.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 border rounded-lg transition-colors text-left ${
                service.price_type === "inquiry"
                  ? "border-yellow-200 bg-yellow-50 hover:border-yellow-400 hover:bg-yellow-100"
                  : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {service.description}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      service.price_type === "fixed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {service.price_type === "fixed"
                      ? "Fixed Price"
                      : "Inquiry Based"}
                  </span>
                  {service.price && (
                    <p className="text-lg font-bold text-green-600 mt-1">
                      ₹{service.price}
                    </p>
                  )}
                  {service.duration && (
                    <p className="text-sm text-gray-500">{service.duration}</p>
                  )}
                </div>
              </div>

              {service.price_type === "inquiry" && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <p>• Small booking fee may apply</p>
                  <p>• We'll contact you with detailed quote</p>
                </div>
              )}

              {service.price_type === "inquiry" ? (
                <button
                  onClick={() => onSelect(service)}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Book Now
                </button>
              ) : (
                <button
                  onClick={() => onSelect(service)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Select Service
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DateSelection({
  onSelect,
  service,
  bookingConfig,
}: {
  onSelect: (date: string) => void;
  service: Service | null;
  bookingConfig: Record<string, string>;
}) {
  // Generate days based on booking_advance_days configuration
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    const advanceDays = parseInt(bookingConfig.booking_advance_days || "7");

    for (let i = 1; i <= advanceDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split("T")[0]); // YYYY-MM-DD format
    }
    return days;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Select Date</h2>
      {service && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">Selected Service: {service.name}</h3>
          <p className="text-gray-600">{service.description}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Working Hours:</span>{" "}
            {bookingConfig.working_hours_start || "09:00"} -{" "}
            {bookingConfig.working_hours_end || "22:00"}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getNextDays().map((date) => (
          <button
            key={date}
            onClick={() => onSelect(date)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <h3 className="font-semibold text-lg">{formatDate(date)}</h3>
            <p className="text-gray-600 text-sm mt-1">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TimeSlotSelection({
  availabilityData,
  onSelect,
  loading,
  onRefresh,
}: {
  availabilityData: AvailabilityResponse | null;
  onSelect: (timeSlot: AvailableSlot) => void;
  loading: boolean;
  onRefresh?: () => void;
}) {
  // Format time for display (convert from HH:MM to 12-hour format)
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      // Fallback to original string if parsing fails
      return timeString;
    }
  };

  // Determine if slot is available
  const isSlotAvailable = (timeSlot: AvailableSlot) => {
    return timeSlot.is_available;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Select Time Slot</h2>
          <p className="text-sm text-gray-600 mt-1">
            All time slots are shown. Unavailable slots are grayed out when no
            workers are available.
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading..." : "Refresh Slots"}
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-center py-8">Loading available slots...</div>
      ) : !availabilityData ||
        !availabilityData.available_slots ||
        availabilityData.available_slots.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No time slots available for the selected date.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availabilityData.available_slots.map((timeSlot, index) => {
            const isAvailable = isSlotAvailable(timeSlot);
            const startTime = formatTime(timeSlot.time);

            return (
              <button
                key={`${timeSlot.time}-${index}`}
                onClick={() => isAvailable && onSelect(timeSlot)}
                disabled={!isAvailable}
                className={`p-4 border rounded-lg transition-colors text-left ${
                  isAvailable
                    ? "border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
                    : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className={`font-semibold text-lg ${
                        isAvailable ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {startTime}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        isAvailable ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {isAvailable
                        ? `${timeSlot.available_workers} worker${
                            timeSlot.available_workers !== 1 ? "s" : ""
                          } available`
                        : "No workers available"}
                    </p>
                  </div>
                  {!isAvailable && (
                    <div className="text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Time Slot Legend:</h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded mr-2"></div>
            <span>Available (Workers free)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-50 border-2 border-gray-100 rounded mr-2 opacity-60"></div>
            <span className="text-gray-400">
              Unavailable (All workers busy)
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>• All time slots are shown for transparency</p>
          <p>• Unavailable slots are grayed out and cannot be selected</p>
          <p>
            • Worker availability is checked for the entire service duration
          </p>
        </div>
      </div>

      {/* Debug Information (for testing) */}
      {process.env.NODE_ENV === "development" && availabilityData && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
          <div className="text-xs text-yellow-700">
            <p>
              Working Hours: {availabilityData.working_hours.start} -{" "}
              {availabilityData.working_hours.end}
            </p>
            <p>Service Duration: {availabilityData.service_duration} minutes</p>
            <p>Buffer Time: {availabilityData.buffer_time} minutes</p>
            <p>Total slots: {availabilityData.available_slots.length}</p>
            <p>
              Available slots:{" "}
              {
                availabilityData.available_slots.filter((slot) =>
                  isSlotAvailable(slot)
                ).length
              }
            </p>
            <p>
              Unavailable slots:{" "}
              {
                availabilityData.available_slots.filter(
                  (slot) => !isSlotAvailable(slot)
                ).length
              }
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer">
                Raw Availability Data
              </summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(availabilityData, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingForm({
  form,
  setForm,
  onSubmit,
  loading,
  service,
}: {
  form: BookingRequest;
  setForm: (form: BookingRequest) => void;
  onSubmit: () => void;
  loading: boolean;
  service: Service | null;
}) {
  // Format time for display
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };
  const handleInputChange = (field: keyof BookingRequest, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Booking Details</h2>
      {service && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">
            Selected Service: {service.name}
          </h3>
          <p className="text-gray-600 mb-2">{service.description}</p>
          <div className="flex items-center justify-between">
            <div>
              {service.price && (
                <p className="text-lg font-bold text-green-600">
                  Price: ₹{service.price}
                </p>
              )}
              {service.duration && (
                <p className="text-sm text-gray-500">
                  Duration: {service.duration}
                </p>
              )}
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.price_type === "fixed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {service.price_type === "fixed"
                  ? "Fixed Price"
                  : "Inquiry Based"}
              </span>
            </div>
          </div>
          {form.scheduled_date && form.scheduled_time && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Scheduled:</span>{" "}
                {formatDate(form.scheduled_date)} at{" "}
                {formatTime(form.scheduled_time)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scheduled Date
          </label>
          <input
            type="date"
            value={form.scheduled_date}
            onChange={(e) =>
              handleInputChange("scheduled_date", e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            value={form.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Enter service address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Describe your service requirement"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person
            </label>
            <input
              type="text"
              value={form.contact_person}
              onChange={(e) =>
                handleInputChange("contact_person", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contact person name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={form.contact_phone}
              onChange={(e) =>
                handleInputChange("contact_phone", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contact phone number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions
          </label>
          <textarea
            value={form.special_instructions}
            onChange={(e) =>
              handleInputChange("special_instructions", e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            placeholder="Any special instructions for the service"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || !form.scheduled_date || !form.address}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating Booking..." : "Create Booking"}
        </button>
      </div>
    </div>
  );
}

function BookingResult({
  result,
  onReset,
}: {
  result: any;
  onReset: () => void;
}) {
  // Handle null or undefined result
  if (!result || !result.booking) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <AlertCircle className="mx-auto text-red-500" size={64} />
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            Booking Error
          </h2>
          <p className="text-gray-600 mt-2">
            Unable to load booking details. Please try again.
          </p>
        </div>
        <button
          onClick={onReset}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isInquiryBooking = result.booking.booking_type === "inquiry";

  return (
    <div className="text-center">
      <div className="mb-6">
        <CheckCircle className="mx-auto text-green-500" size={64} />
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          {isInquiryBooking
            ? "Inquiry Submitted Successfully!"
            : "Booking Created Successfully!"}
        </h2>
        {isInquiryBooking && (
          <p className="text-gray-600 mt-2">
            We'll contact you soon with details and pricing.
          </p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        <h3 className="font-semibold mb-4">
          {isInquiryBooking ? "Inquiry Details:" : "Booking Details:"}
        </h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Reference:</span>{" "}
            {result.booking.booking_reference}
          </p>
          <p>
            <span className="font-medium">Status:</span> {result.booking.status}
          </p>
          {!isInquiryBooking && (
            <>
              <p>
                <span className="font-medium">Payment Status:</span>{" "}
                {result.booking.payment_status}
              </p>
              {result.booking.total_amount && (
                <p>
                  <span className="font-medium">Amount:</span> ₹
                  {result.booking.total_amount}
                </p>
              )}
            </>
          )}
        </div>

        {isInquiryBooking && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• Our team will review your inquiry</p>
              <p>• We'll contact you with a detailed quote</p>
              <p>• You can discuss requirements and scheduling</p>
              <p>• Payment will be collected after quote approval</p>
            </div>
          </div>
        )}

        {result.payment_order && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Payment Required
            </h4>
            <p className="text-yellow-700 text-sm">
              Please complete the payment using the provided order details.
            </p>
            <div className="mt-2 text-sm">
              <p>
                <span className="font-medium">Order ID:</span>{" "}
                {result.payment_order.id}
              </p>
              <p>
                <span className="font-medium">Amount:</span> ₹
                {result.payment_order.amount / 100}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        {isInquiryBooking ? "Submit Another Inquiry" : "Book Another Service"}
      </button>
    </div>
  );
}
