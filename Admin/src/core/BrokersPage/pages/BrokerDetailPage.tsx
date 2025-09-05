"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import Button from "@/components/Button/Base/Button";
import { Loader } from "@/components/Loader";
import { api } from "@/lib/api-client";
import { EnhancedBroker } from "@/types/broker";
import { User as UserType } from "@/types/worker";

export default function BrokerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [broker, setBroker] = useState<EnhancedBroker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchBroker();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchBroker = async () => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.get(`/admin/users/${userId}`);
      const user = (data?.data?.user || data?.data) as UserType;

      if (!user) {
        setError("Broker not found");
        setLoading(false);
        return;
      }

      // If user has broker data, transform it to EnhancedBroker format
      if (user.broker && user.user_type === "broker") {
        const transformedBroker: EnhancedBroker = {
          ID: user.broker.ID,
          id: user.broker.ID,
          CreatedAt: user.broker.CreatedAt,
          UpdatedAt: user.broker.UpdatedAt,
          DeletedAt: user.broker.DeletedAt,
          user_id: user.broker.user_id,
          role_application_id: user.broker.role_application_id,
          contact_info: user.broker.contact_info
            ? JSON.parse(user.broker.contact_info)
            : { alternative_number: "" },
          address: user.broker.address
            ? JSON.parse(user.broker.address)
            : { street: "", city: "", state: "", pincode: "", landmark: "" },
          documents: user.broker.documents
            ? JSON.parse(user.broker.documents)
            : {
                aadhar_card: "",
                pan_card: "",
                profile_pic: user.avatar || "",
              },
          license: user.broker.license,
          agency: user.broker.agency,
          is_active: user.broker.is_active,
          user: {
            ...user,
            id: user.ID,
          },
        };
        setBroker(transformedBroker);
      } else {
        setError("User is not a broker or has no broker record");
      }
    } catch (error) {
      console.error("Error fetching broker:", error);
      setError("Failed to fetch broker data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error || !broker) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Broker Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The broker you're looking for doesn't exist."}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/brokers")}
          >
            Back to Brokers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.back()}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Broker #{broker.user_id || broker.user?.ID}
              </h1>
              <p className="text-sm text-gray-600">
                Joined on{" "}
                {format(
                  new Date(broker.user?.CreatedAt || broker.CreatedAt),
                  "MMM dd, yyyy"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-20 w-20 rounded-full object-cover"
                    src={
                      broker.documents?.profile_pic ||
                      broker.user?.avatar ||
                      "/default-avatar.png"
                    }
                    alt="Profile"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-gray-900">
                    {broker.user?.name || "No Name"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Broker ID: {broker.ID} | User ID: {broker.user_id}
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {broker.user?.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{broker.user.email}</p>
                        </div>
                      </div>
                    )}
                    {broker.user?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{broker.user.phone}</p>
                        </div>
                      </div>
                    )}
                    {broker.contact_info?.alternative_number && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Alternative Phone
                          </p>
                          <p className="font-medium">
                            {broker.contact_info.alternative_number}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Joined</p>
                        <p className="font-medium">
                          {format(
                            new Date(
                              broker.user?.CreatedAt || broker.CreatedAt
                            ),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {broker.address &&
                    (broker.address.street || broker.address.city) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Address
                        </h4>
                        <div className="space-y-2">
                          {broker.address.street && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Street</p>
                                <p className="font-medium">
                                  {broker.address.street}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">
                                City & State
                              </p>
                              <p className="font-medium">
                                {broker.address.city}, {broker.address.state}{" "}
                                {broker.address.pincode}
                              </p>
                            </div>
                          </div>
                          {broker.address.landmark && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  Landmark
                                </p>
                                <p className="font-medium">
                                  {broker.address.landmark}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Broker Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Broker Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Agency</p>
                  <p className="font-medium">
                    {broker.agency || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">License Number</p>
                  <p className="font-medium font-mono">
                    {broker.license || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {broker.documents && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Documents
                </h2>
                <div className="space-y-3">
                  {broker.documents.aadhar_card && (
                    <div>
                      <p className="text-sm text-gray-600">Aadhaar Card</p>
                      <a
                        href={broker.documents.aadhar_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {broker.documents.pan_card && (
                    <div>
                      <p className="text-sm text-gray-600">PAN Card</p>
                      <a
                        href={broker.documents.pan_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {broker.documents.profile_pic && (
                    <div>
                      <p className="text-sm text-gray-600">Profile Picture</p>
                      <a
                        href={broker.documents.profile_pic}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status & Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Broker Status</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      broker.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {broker.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Role Application ID
                  </span>
                  <span className="font-medium">
                    {broker.role_application_id || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                User Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Status</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      broker.user?.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {broker.user?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Role Application
                  </span>
                  <span className="font-medium capitalize">
                    {broker.user?.role_application_status || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wallet Balance</span>
                  <span className="font-medium">
                    ₹{broker.user?.wallet_balance?.toFixed(2) || "0.00"}
                  </span>
                </div>
                {broker.user?.last_login_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="font-medium text-xs">
                      {format(
                        new Date(broker.user.last_login_at),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
