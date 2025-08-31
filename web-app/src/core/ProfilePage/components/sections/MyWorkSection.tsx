"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkerAssignments } from "@/hooks/useWorkerAssignments";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ConfirmModal";

type WorkTab = "all" | "assigned" | "in_progress" | "completed";

export function MyWorkSection() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<WorkTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "accept" | "reject" | "start" | "complete";
    assignmentId: number;
    assignment: any;
  } | null>(null);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get filters for the active tab
  const getFiltersForTab = (tab: WorkTab) => {
    const baseFilters: any = {};

    switch (tab) {
      case "assigned":
        baseFilters.status = "assigned";
        break;
      case "in_progress":
        baseFilters.status = "in_progress";
        break;
      case "completed":
        baseFilters.status = "completed";
        break;
    }

    return baseFilters;
  };

  const {
    assignments,
    isLoadingAssignments,
    acceptAssignmentAsync,
    rejectAssignmentAsync,
    startAssignmentAsync,
    completeAssignmentAsync,
    isAcceptingAssignment,
    isRejectingAssignment,
    isStartingAssignment,
    isCompletingAssignment,
    refetchAssignments,
    assignmentsError,
  } = useWorkerAssignments(getFiltersForTab(activeTab));

  // Helper function to parse address JSON
  const parseAddress = (addressString: string) => {
    try {
      const address = JSON.parse(addressString);
      return {
        house_number: address.house_number || "",
        address: address.address || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
      };
    } catch (error) {
      return {
        house_number: "",
        address: addressString,
        landmark: "",
        city: "",
        state: "",
        postal_code: "",
      };
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  // Client-side filtering for search (temporary until backend supports search)
  const filteredAssignments = assignments.filter((assignment) => {
    if (!debouncedSearchQuery.trim()) return true;

    const searchLower = debouncedSearchQuery.toLowerCase();
    const contactPerson =
      assignment.booking?.contact_person ||
      assignment.booking?.user?.name ||
      "";
    const contactPhone =
      assignment.booking?.contact_phone ||
      assignment.booking?.user?.phone ||
      "";

    return (
      assignment.booking?.service?.name?.toLowerCase().includes(searchLower) ||
      assignment.booking?.booking_reference
        .toLowerCase()
        .includes(searchLower) ||
      contactPerson.toLowerCase().includes(searchLower) ||
      contactPhone.includes(debouncedSearchQuery)
    );
  });

  const tabs = [
    {
      id: "all" as WorkTab,
      label: "All Work",
      count: assignments.length,
    },
    {
      id: "assigned" as WorkTab,
      label: "Assigned",
      count: assignments.filter((w) => w.status === "assigned").length,
    },
    {
      id: "in_progress" as WorkTab,
      label: "In Progress",
      count: assignments.filter((w) => w.status === "in_progress").length,
    },
    {
      id: "completed" as WorkTab,
      label: "Completed",
      count: assignments.filter((w) => w.status === "completed").length,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "in_progress":
        return <Briefcase className="w-4 h-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "assigned":
        return "Assigned";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle assignment actions
  const handleAcceptAssignment = async (assignmentId: number) => {
    try {
      await acceptAssignmentAsync({
        assignmentId,
        data: { notes: "" },
      });
      toast.success("Assignment accepted successfully");
      refetchAssignments();
    } catch (error) {
      toast.error("Failed to accept assignment");
    }
  };

  const handleRejectAssignment = async (
    assignmentId: number,
    reason: string
  ) => {
    try {
      await rejectAssignmentAsync({
        assignmentId,
        data: { reason, notes: "" },
      });
      toast.success("Assignment rejected successfully");
      refetchAssignments();
    } catch (error) {
      toast.error("Failed to reject assignment");
    }
  };

  const handleStartAssignment = async (assignmentId: number) => {
    try {
      await startAssignmentAsync({
        assignmentId,
        data: { notes: "" },
      });
      toast.success("Assignment started successfully");
      refetchAssignments();
    } catch (error) {
      toast.error("Failed to start assignment");
    }
  };

  const handleCompleteAssignment = async (assignmentId: number) => {
    try {
      await completeAssignmentAsync({
        assignmentId,
        data: { notes: "", materials_used: [], photos: [] },
      });
      toast.success("Assignment completed successfully");
      refetchAssignments();
    } catch (error) {
      toast.error("Failed to complete assignment");
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case "accept":
          await handleAcceptAssignment(confirmAction.assignmentId);
          break;
        case "reject":
          await handleRejectAssignment(
            confirmAction.assignmentId,
            "Worker rejected"
          );
          break;
        case "start":
          await handleStartAssignment(confirmAction.assignmentId);
          break;
        case "complete":
          await handleCompleteAssignment(confirmAction.assignmentId);
          break;
      }
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.user_type !== "worker") {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Access denied. This page is only available for workers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">My Work</h2>
        <p className="text-gray-600 mt-1">
          View and manage your work assignments
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search work assignments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
      </div>

      {/* Work Assignments List */}
      <div className="space-y-4">
        {isLoadingAssignments ? (
          // Skeleton for loading state
          [1, 2, 3].map((i) => (
            <div key={i}>
              <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment, index) => (
            <div key={assignment.ID}>
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.booking?.service?.name || "Service"}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {getStatusText(assignment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p>
                          <strong>Booking Ref:</strong>{" "}
                          {assignment.booking?.booking_reference}
                        </p>
                        <p>
                          <strong>Customer:</strong>{" "}
                          {assignment.booking?.contact_person ||
                            assignment.booking?.user?.name ||
                            "Not provided"}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {assignment.booking?.contact_phone ||
                            assignment.booking?.user?.phone ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Date:</strong>{" "}
                          {assignment.booking?.scheduled_date
                            ? formatDate(assignment.booking.scheduled_date)
                            : "Not scheduled"}
                        </p>
                        <p>
                          <strong>Time:</strong>{" "}
                          {assignment.booking?.scheduled_time
                            ? formatTime(assignment.booking.scheduled_time)
                            : "Not scheduled"}
                        </p>
                        <p>
                          <strong>Amount:</strong> ₹
                          {assignment.booking?.service?.price || 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        <strong>Address:</strong>{" "}
                        {assignment.booking?.address
                          ? (() => {
                              const parsedAddress = parseAddress(
                                assignment.booking.address
                              );
                              return `${
                                parsedAddress.house_number
                                  ? parsedAddress.house_number + ", "
                                  : ""
                              }${parsedAddress.address}${
                                parsedAddress.landmark
                                  ? ", " + parsedAddress.landmark
                                  : ""
                              }, ${parsedAddress.city}, ${
                                parsedAddress.state
                              } - ${parsedAddress.postal_code}`;
                            })()
                          : "Address not available"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end">
                    {getStatusIcon(assignment.status)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {assignment.status === "assigned" && (
                    <>
                      <button
                        onClick={() => {
                          setConfirmAction({
                            type: "accept",
                            assignmentId: assignment.ID,
                            assignment,
                          });
                          setShowConfirmModal(true);
                        }}
                        disabled={isAcceptingAssignment}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isAcceptingAssignment ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        onClick={() => {
                          setConfirmAction({
                            type: "reject",
                            assignmentId: assignment.ID,
                            assignment,
                          });
                          setShowConfirmModal(true);
                        }}
                        disabled={isRejectingAssignment}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {isRejectingAssignment ? "Rejecting..." : "Decline"}
                      </button>
                    </>
                  )}
                  {assignment.status === "accepted" && (
                    <button
                      onClick={() => {
                        setConfirmAction({
                          type: "start",
                          assignmentId: assignment.ID,
                          assignment,
                        });
                        setShowConfirmModal(true);
                      }}
                      disabled={isStartingAssignment}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {isStartingAssignment ? "Starting..." : "Start Work"}
                    </button>
                  )}
                  {assignment.status === "in_progress" && (
                    <button
                      onClick={() => {
                        setConfirmAction({
                          type: "complete",
                          assignmentId: assignment.ID,
                          assignment,
                        });
                        setShowConfirmModal(true);
                      }}
                      disabled={isCompletingAssignment}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {isCompletingAssignment ? "Completing..." : "Complete"}
                    </button>
                  )}
                  {assignment.status === "completed" && (
                    <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors">
                      View Details
                    </button>
                  )}
                </div>
              </div>
              {index < filteredAssignments.length - 1 && (
                <div className="border-b border-gray-200 my-4"></div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>
              {debouncedSearchQuery
                ? "No work assignments found matching your search"
                : `No ${
                    activeTab === "all" ? "" : activeTab
                  } work assignments yet`}
            </p>
            <p className="text-sm">
              {debouncedSearchQuery
                ? "Try adjusting your search terms"
                : "Your work assignments will appear here"}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={`Confirm ${confirmAction?.type || "action"}`}
        message={`Are you sure you want to ${
          confirmAction?.type || "perform this action"
        }?`}
        confirmText={
          confirmAction?.type === "accept"
            ? "Accept"
            : confirmAction?.type === "reject"
            ? "Reject"
            : confirmAction?.type === "start"
            ? "Start"
            : confirmAction?.type === "complete"
            ? "Complete"
            : "Confirm"
        }
        cancelText="Cancel"
      />
    </div>
  );
}
