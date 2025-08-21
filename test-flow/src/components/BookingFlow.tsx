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

import React, { useState, useEffect } from "react";
import { apiService } from "../lib/api";
import { ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Subcategory {
  id: number;
  name: string;
  description: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price_type: string;
  price?: number;
  duration?: string;
}

interface Address {
  id: number;
  name: string;
  address: string;
  landmark?: string;
  is_default: boolean;
}

interface AvailableSlot {
  time: string;
  is_available: boolean;
  available_workers: number;
}

interface AvailabilityResponse {
  working_hours: {
    start: string;
    end: string;
  };
  service_duration: number;
  buffer_time: number;
  available_slots: AvailableSlot[];
}

interface BookingRequest {
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  special_instructions?: string;
}

interface Booking {
  id: number;
  booking_reference: string;
  status: string;
  payment_status: string;
  total_amount?: number;
  service: {
    id: number;
    name: string;
    price_type: string;
  };
}

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
  const [addresses, setAddresses] = useState<Address[]>([]);
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
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

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
      loadAddresses();
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

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load addresses");
      console.error(err);
      setAddresses([]);
    } finally {
      setLoading(false);
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
    setStep(4);
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
      scheduled_time: timeSlot.time,
    }));
    setStep(6);
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setBookingForm((prev) => ({
      ...prev,
      address: address.address,
    }));
    setStep(7);
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // Create booking - backend will return payment order if needed
      const response = await apiService.createBooking(bookingForm);

      console.log("Backend response:", response);
      console.log("Booking object:", response.booking);
      console.log("Booking ID:", response.booking?.ID || response.booking?.id);

      if (response.payment_required && response.payment_order) {
        // Payment required - show Razorpay payment modal
        // Store the booking ID for payment verification
        setBookingResult({ booking: response.booking });

        // Check if booking ID exists (try both ID and id)
        const bookingId = response.booking?.ID || response.booking?.id;
        if (!bookingId) {
          console.error("Booking ID not found in response:", response);
          setError("Booking ID not available for payment verification");
          return;
        }

        handleRazorpayPayment(response.payment_order, bookingId);
      } else {
        // No payment required - show success
        setBookingResult({ booking: response.booking });
        setStep(8);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create booking");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = (paymentOrder: any, bookingId: number) => {
    console.log("Payment order:", paymentOrder);
    console.log("Booking ID:", bookingId);

    if (!bookingId) {
      setError("Booking ID not available for payment verification");
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
        description: `Booking Payment - ${selectedService?.name}`,
        order_id: paymentOrder.id,
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
            console.log("Verifying payment for booking ID:", bookingId);

            // Payment successful - verify payment
            const verifyResponse = await apiService.verifyPayment(bookingId, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: paymentOrder.id,
              razorpay_signature: response.razorpay_signature,
            });

            // Set the booking result
            setBookingResult({ booking: verifyResponse.booking });

            // Show success message
            alert("Payment successful! Your booking has been confirmed.");
            setStep(8);
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
    setSelectedAddress(null);
    setBookingForm({
      service_id: 0,
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
          <AddressSelection
            addresses={addresses}
            onSelect={handleAddressSelect}
            loading={loading}
          />
        );
      case 7:
        return (
          <BookingForm
            form={bookingForm}
            setForm={setBookingForm}
            onSubmit={handleBookingSubmit}
            loading={loading}
            service={selectedService}
          />
        );
      case 8:
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
          {[1, 2, 3, 4, 5, 6, 7].map((stepNumber) => (
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
              {stepNumber < 7 && (
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

              <button
                onClick={() => onSelect(service)}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                  service.price_type === "inquiry"
                    ? "bg-yellow-600 text-white hover:bg-yellow-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Select Service
              </button>
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
    </div>
  );
}

function AddressSelection({
  addresses,
  onSelect,
  loading,
}: {
  addresses: Address[];
  onSelect: (address: Address) => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Select Address</h2>
      {loading ? (
        <div className="text-center py-8">Loading addresses...</div>
      ) : !addresses || addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No addresses available. Please add one in your profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() => onSelect(address)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <h3 className="font-semibold text-lg">{address.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{address.address}</p>
              {address.landmark && (
                <p className="text-gray-500 text-xs mt-1">
                  Near: {address.landmark}
                </p>
              )}
              {address.is_default && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Default
                </span>
              )}
            </button>
          ))}
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
          {form.address && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Address:</span> {form.address}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
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
      </div>

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

      <button
        onClick={onReset}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        {isInquiryBooking ? "Submit Another Inquiry" : "Book Another Service"}
      </button>
    </div>
  );
}
