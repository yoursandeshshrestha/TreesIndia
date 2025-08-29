"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  MapPin,
  FileText,
  Briefcase,
  Building,
  Check,
  XCircle,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  Shield,
  Award,
  Globe,
  Navigation,
} from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api-client";
import { EnhancedRoleApplication } from "@/types/roleApplication";
import Button from "@/components/Button/Base/Button";
import { Loader } from "@/components/Loader";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Textarea from "@/components/Textarea/Base/Textarea";
import Modal from "@/components/Model/Base/Model";

export default function RoleApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = Number(params.id);

  const [application, setApplication] =
    useState<EnhancedRoleApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplicationDetails();
    }
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.get(`/admin/role-applications/${applicationId}`);
      console.log("Application data:", data); // Debug log
      // Handle both direct data and wrapped data responses
      const applicationData = (data?.data ||
        data) as unknown as EnhancedRoleApplication;
      setApplication(applicationData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load application"
      );
      toast.error("Error loading application details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptApplication = async () => {
    if (!application) return;

    setIsAccepting(true);
    try {
      const payload = {
        status: "approved",
        admin_notes: "",
        ...(application.requested_role === "worker" && {
          worker_type: application.worker?.worker_type || "normal",
        }),
      };

      await api.put(`/admin/role-applications/${application.ID}`, payload);
      toast.success("Application approved successfully");
      setShowAcceptModal(false);
      loadApplicationDetails();
    } catch (err) {
      toast.error("Failed to approve application");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!application) return;

    setIsRejecting(true);
    try {
      const payload = {
        status: "rejected",
        admin_notes: rejectNotes,
      };

      await api.put(`/admin/role-applications/${application.ID}`, payload);
      toast.success("Application rejected successfully");
      setShowRejectModal(false);
      setRejectNotes("");
      loadApplicationDetails();
    } catch (err) {
      toast.error("Failed to reject application");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!application) return;

    setIsDeleting(true);
    try {
      await api.delete(`/admin/role-applications/${application.ID}`);
      toast.success("Application deleted successfully");
      router.push("/dashboard/role-applications");
    } catch (err) {
      toast.error("Failed to delete application");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Rejected",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span
        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-md border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      worker: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Worker",
      },
      broker: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Broker",
      },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.worker;
    return (
      <span
        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-md border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not available";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Invalid date:", dateString, error);
      return "Invalid date";
    }
  };

  const displayValue = (
    value: unknown,
    fallback: string = "Not provided"
  ): string => {
    return (value as string) || fallback;
  };

  const getProfilePic = (application: EnhancedRoleApplication) => {
    if (application.worker?.documents?.profile_pic) {
      return application.worker.documents.profile_pic;
    }
    if (application.broker?.documents?.profile_pic) {
      return application.broker.documents.profile_pic;
    }
    return "/default-avatar.png";
  };

  const getAddress = (application: EnhancedRoleApplication) => {
    if (application.worker?.address) {
      return application.worker.address;
    }
    if (application.broker?.address) {
      return application.broker.address;
    }
    return null;
  };

  const getDocuments = (application: EnhancedRoleApplication) => {
    if (application.worker?.documents) {
      return application.worker.documents;
    }
    if (application.broker?.documents) {
      return application.broker.documents;
    }
    return null;
  };

  const getBankingInfo = (application: EnhancedRoleApplication) => {
    return application.worker?.banking_info || null;
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (error || !application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The application you're looking for doesn't exist."}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/role-applications")}
          >
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const address = getAddress(application);
  const documents = getDocuments(application);
  const bankingInfo = getBankingInfo(application);

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
                Application #{application.ID}
              </h1>
              <p className="text-sm text-gray-600">
                Submitted on {formatDate(application.submitted_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(application.status)}
            {getRoleBadge(application.requested_role)}
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Applicant Information
              </h2>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={getProfilePic(application)}
                    alt=""
                  />
                </div>
                <div className="flex-1">
                  {application.user?.name &&
                    application.user.name.trim() !== "" && (
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.user.name}
                      </h3>
                    )}
                  <div className="mt-2 space-y-1">
                    {application.user?.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">
                            {application.user.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {application.user?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">
                            {application.user.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Application Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Requested Role</p>
                    <p className="font-medium">
                      {getRoleBadge(application.requested_role)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <p className="font-medium">
                      {getStatusBadge(application.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Submitted Date</p>
                    <p className="font-medium">
                      {formatDate(application.submitted_at)}
                    </p>
                  </div>
                </div>
                {application.reviewed_at && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Reviewed Date</p>
                      <p className="font-medium">
                        {formatDate(application.reviewed_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role-Specific Information */}
            {application.requested_role === "worker" && application.worker && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Worker Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Worker Type</p>
                        <p className="font-medium">
                          {displayValue(
                            application.worker.worker_type,
                            "Normal"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Experience Years
                        </p>
                        <p className="font-medium">
                          {application.worker.experience_years} years
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <p className="font-medium">
                          {application.worker.rating.toFixed(1)}/5.0
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Total Jobs</p>
                        <p className="font-medium">
                          {application.worker.total_jobs}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Total Earnings</p>
                        <p className="font-medium">
                          ₹{application.worker.earnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium">
                          {application.worker.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {application.worker.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {application.requested_role === "broker" && application.broker && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Broker Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">License</p>
                      <p className="font-medium">
                        {displayValue(application.broker.license)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Agency</p>
                      <p className="font-medium">
                        {displayValue(application.broker.agency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium">
                        {application.broker.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            {address && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Address Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {displayValue(address.street, "Address not provided")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">City</p>
                        <p className="font-medium text-gray-900">
                          {displayValue(address.city, "Not provided")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">State</p>
                        <p className="font-medium text-gray-900">
                          {displayValue(address.state, "Not provided")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Pincode</p>
                        <p className="font-medium text-gray-900">
                          {displayValue(address.pincode, "Not provided")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Landmark</p>
                        <p className="font-medium text-gray-900">
                          {displayValue(address.landmark, "Not provided")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details (for workers) */}
            {bankingInfo && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Bank Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Account Holder</p>
                    <p className="font-medium">
                      {displayValue(bankingInfo.account_holder_name)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-medium">
                      {displayValue(bankingInfo.account_number)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-medium">
                      {displayValue(bankingInfo.bank_name)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IFSC Code</p>
                    <p className="font-medium">
                      {displayValue(bankingInfo.ifsc_code)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            {documents && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Documents
                </h2>
                <div className="space-y-3">
                  {documents.aadhar_card && (
                    <div>
                      <p className="text-sm text-gray-600">Aadhaar Card</p>
                      <a
                        href={documents.aadhar_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {documents.pan_card && (
                    <div>
                      <p className="text-sm text-gray-600">PAN Card</p>
                      <a
                        href={documents.pan_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {documents.police_verification && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Police Verification
                      </p>
                      <a
                        href={documents.police_verification}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {documents.profile_pic && (
                    <div>
                      <p className="text-sm text-gray-600">Profile Picture</p>
                      <a
                        href={documents.profile_pic}
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

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                {application.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => setShowAcceptModal(true)}
                      disabled={isAccepting}
                      className="text-green-600 hover:text-green-700 border-green-200"
                    >
                      Accept Application
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => setShowRejectModal(true)}
                      disabled={isRejecting}
                      className="text-red-600 hover:text-red-700 border-red-200"
                    >
                      Reject Application
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={loadApplicationDetails}
                >
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Modal */}
      <ConfirmModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAcceptApplication}
        title="Accept Application"
        message="Are you sure you want to accept this application?"
        confirmText="Accept"
        cancelText="Cancel"
        variant="default"
        isLoading={isAccepting}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectNotes("");
        }}
        title="Reject Application"
        size="md"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowRejectModal(false);
                setRejectNotes("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRejectApplication}
              disabled={isRejecting}
              loading={isRejecting}
              className="flex-1"
            >
              {isRejecting ? "Rejecting..." : "Reject Application"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to reject this application? Please provide a
            reason for rejection.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Notes
            </label>
            <Textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteApplication}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
