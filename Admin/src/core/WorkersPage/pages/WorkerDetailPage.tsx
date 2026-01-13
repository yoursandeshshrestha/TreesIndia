"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Calendar, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Button from "@/components/Button/Base/Button";
import { Loader } from "@/components/Loader";
import { api } from "@/lib/api-client";
import {
  EnhancedWorker,
  User as UserType,
  ContactInfo,
  WorkerAddress,
  BankingInfo,
  Documents
} from "@/types/worker";

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [worker, setWorker] = useState<EnhancedWorker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingType, setIsTogglingType] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if you have one
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWorker();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchWorker = async () => {
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
        setError("Worker not found");
        setLoading(false);
        return;
      }

      // If user has worker data, transform it to EnhancedWorker format
      if (user.worker && user.user_type === "worker") {
        // Helper function to parse data that might be a string or already an object
        const parseIfString = <T,>(data: T | string, fallback: T): T => {
          if (!data) return fallback;
          if (typeof data === "string") {
            try {
              return JSON.parse(data);
            } catch {
              return fallback;
            }
          }
          return data as T;
        };

        // Handle both camelCase and snake_case from API
        interface WorkerApiData {
          id?: number;
          ID?: number;
          created_at?: string;
          CreatedAt?: string;
          updated_at?: string;
          UpdatedAt?: string;
          deleted_at?: string | null;
          DeletedAt?: string | null;
          user_id: number;
          role_application_id?: number | null;
          worker_type: string;
          contact_info: ContactInfo | string;
          address: WorkerAddress | string;
          banking_info: BankingInfo | string;
          documents: Documents | string;
          skills: string[] | string;
          experience_years: number;
          is_available: boolean;
          rating: number;
          total_bookings: number;
          earnings: number;
          total_jobs: number;
          is_active: boolean;
        }

        const workerData = user.worker as unknown as WorkerApiData;

        const transformedWorker: EnhancedWorker = {
          ID: workerData.ID ?? workerData.id ?? 0,
          id: workerData.ID ?? workerData.id ?? 0,
          CreatedAt: workerData.CreatedAt ?? workerData.created_at ?? "",
          UpdatedAt: workerData.UpdatedAt ?? workerData.updated_at ?? "",
          DeletedAt: workerData.DeletedAt ?? workerData.deleted_at ?? null,
          user_id: workerData.user_id,
          role_application_id: workerData.role_application_id,
          worker_type: workerData.worker_type,
          contact_info: parseIfString(workerData.contact_info, {
            alternative_number: "",
          }),
          address: parseIfString(workerData.address, {
            street: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          }),
          banking_info: parseIfString(workerData.banking_info, {
            account_number: "",
            ifsc_code: "",
            bank_name: "",
            account_holder_name: "",
          }),
          documents: parseIfString(workerData.documents, {
            aadhar_card: "",
            pan_card: "",
            profile_pic: user.avatar || "",
            police_verification: "",
          }),
          skills: parseIfString(workerData.skills, []),
          experience_years: workerData.experience_years,
          is_available: workerData.is_available,
          rating: workerData.rating,
          total_bookings: workerData.total_bookings,
          earnings: workerData.earnings,
          total_jobs: workerData.total_jobs,
          is_active: workerData.is_active,
          user: {
            ...user,
            id: user.ID,
          },
        };
        setWorker(transformedWorker);
      } else {
        setError("User is not a worker or has no worker record");
      }
    } catch (error) {
      console.error("Error fetching worker:", error);
      setError("Failed to fetch worker data");
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkerType = async () => {
    if (!worker) return;

    const newType = worker.worker_type === "normal" ? "treesindia_worker" : "normal";

    try {
      setIsTogglingType(true);
      await api.put(`/admin/workers/${worker.ID}/toggle-worker-type`, {
        worker_type: newType,
      });
      toast.success(
        `Worker type changed to ${newType === "treesindia_worker" ? "TreesIndia Worker" : "Normal"}`
      );
      // Refresh worker data
      await fetchWorker();
    } catch (error) {
      console.error("Error toggling worker type:", error);
      toast.error("Failed to change worker type");
    } finally {
      setIsTogglingType(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error || !worker) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Worker Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The worker you're looking for doesn't exist."}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/workers")}
          >
            Back to Workers
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
                Worker #{worker.user_id || worker.user?.ID}
              </h1>
              <p className="text-sm text-gray-600">
                Joined on{" "}
                {format(
                  new Date(worker.user?.CreatedAt || worker.CreatedAt),
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
                      worker.documents?.profile_pic ||
                      worker.user?.avatar ||
                      "/default-avatar.png"
                    }
                    alt="Profile"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-gray-900">
                    {worker.user?.name || "No Name"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Worker ID: {worker.ID} | User ID: {worker.user_id}
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {worker.user?.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{worker.user.email}</p>
                        </div>
                      </div>
                    )}
                    {worker.user?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Phone</p>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{worker.user.phone}</p>
                            <button
                              onClick={() => copyToClipboard(worker.user.phone)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Copy phone number"
                            >
                              <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {worker.contact_info?.alternative_number && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            Alternative Phone
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">
                              {worker.contact_info.alternative_number}
                            </p>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  worker.contact_info.alternative_number
                                )
                              }
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Copy alternative phone number"
                            >
                              <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                            </button>
                          </div>
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
                              worker.user?.CreatedAt || worker.CreatedAt
                            ),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {worker.address &&
                    (worker.address.street || worker.address.city) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Address
                        </h4>
                        <div className="space-y-2">
                          {worker.address.street && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Street</p>
                                <p className="font-medium">
                                  {worker.address.street}
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
                                {worker.address.city}, {worker.address.state}{" "}
                                {worker.address.pincode}
                              </p>
                            </div>
                          </div>
                          {worker.address.landmark && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  Landmark
                                </p>
                                <p className="font-medium">
                                  {worker.address.landmark}
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

            {/* Worker Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Performance & Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {worker.total_jobs}
                  </div>
                  <div className="text-sm text-gray-600">Jobs Completed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {worker.total_bookings}
                  </div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    ₹{worker.earnings.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {worker.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            {/* Banking Information */}
            {worker.banking_info && worker.banking_info.account_number && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Banking Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Account Holder</p>
                    <p className="font-medium">
                      {worker.banking_info.account_holder_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-medium">
                      {worker.banking_info.account_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-medium">
                      {worker.banking_info.bank_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IFSC Code</p>
                    <p className="font-medium">
                      {worker.banking_info.ifsc_code}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            {worker.documents && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Documents
                </h2>
                <div className="space-y-3">
                  {worker.documents.aadhar_card && (
                    <div>
                      <p className="text-sm text-gray-600">Aadhaar Card</p>
                      <a
                        href={worker.documents.aadhar_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {worker.documents.pan_card && (
                    <div>
                      <p className="text-sm text-gray-600">PAN Card</p>
                      <a
                        href={worker.documents.pan_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {worker.documents.police_verification && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Police Verification
                      </p>
                      <a
                        href={worker.documents.police_verification}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {worker.documents.profile_pic && (
                    <div>
                      <p className="text-sm text-gray-600">Profile Picture</p>
                      <a
                        href={worker.documents.profile_pic}
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
                  <span className="text-sm text-gray-600">Worker Status</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      worker.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {worker.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Availability</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      worker.is_available
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {worker.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Worker Type</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        worker.worker_type === "treesindia_worker"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {worker.worker_type === "treesindia_worker"
                        ? "TreesIndia Worker"
                        : "Normal"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={
                      worker.worker_type === "normal" ? "primary" : "outline"
                    }
                    onClick={toggleWorkerType}
                    disabled={isTogglingType}
                    className="w-full"
                  >
                    {isTogglingType
                      ? "Updating..."
                      : worker.worker_type === "normal"
                      ? "Make TreesIndia Worker"
                      : "Make Normal Worker"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Role Application ID
                  </span>
                  <span className="font-medium">
                    {worker.role_application_id || "N/A"}
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
                      worker.user?.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {worker.user?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Role Application
                  </span>
                  <span className="font-medium capitalize">
                    {worker.user?.role_application_status || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wallet Balance</span>
                  <span className="font-medium">
                    ₹{worker.user?.wallet_balance?.toFixed(2) || "0.00"}
                  </span>
                </div>
                {worker.user?.last_login_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="font-medium text-xs">
                      {format(
                        new Date(worker.user.last_login_at),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Experience */}
            {worker.skills && worker.skills.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Skills & Experience
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Experience</p>
                    <p className="font-medium">
                      {worker.experience_years} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
