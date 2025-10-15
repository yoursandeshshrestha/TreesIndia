"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkerAssignments } from "@/hooks/useWorkerAssignments";
import { toast } from "sonner";
import { ConfirmModal } from "@/commonComponents/ConfirmModal/ConfirmModal";
import { WorkerAssignmentCard } from "@/core/ProfilePage/components/sections/MyWork/WorkerAssignmentCard";

type WorkTab = "all" | "assigned" | "accepted" | "in_progress" | "completed";

export function MyWorkSection() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<WorkTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "accept" | "reject" | "start" | "complete";
    assignmentId: number;
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
    const baseFilters: { status?: string } = {};

    switch (tab) {
      case "assigned":
        baseFilters.status = "assigned";
        break;
      case "accepted":
        baseFilters.status = "accepted";
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
  } = useWorkerAssignments(getFiltersForTab(activeTab));

  // Handle assignment actions
  const handleAcceptAssignment = async (assignmentId: number) => {
    try {
      await acceptAssignmentAsync({
        assignmentId,
        data: { notes: "" },
      });
      toast.success("Assignment accepted successfully");
      refetchAssignments();
    } catch {
      toast.error("Failed to accept assignment");
    }
  };

  const handleRejectAssignment = async (
    assignmentId: number,
    reason?: string
  ) => {
    try {
      await rejectAssignmentAsync({
        assignmentId,
        data: { reason: reason || "Worker rejected", notes: "" },
      });
      toast.success("Assignment rejected successfully");
      refetchAssignments();
    } catch {
      toast.error("Failed to reject assignment");
    }
  };

  const handleStartAssignment = async (assignmentId: number) => {
    try {
      await startAssignmentAsync({
        assignmentId,
        data: { notes: "" },
      });
      toast.success("Work started successfully");
      refetchAssignments();
    } catch {
      toast.error("Failed to start work");
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
    } catch {
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
          await handleRejectAssignment(confirmAction.assignmentId);
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
      id: "accepted" as WorkTab,
      label: "Accepted",
      count: assignments.filter((w) => w.status === "accepted").length,
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
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment, index) => (
            <div key={assignment.ID}>
              <WorkerAssignmentCard
                assignment={assignment}
                onAccept={handleAcceptAssignment}
                onReject={handleRejectAssignment}
                onStart={handleStartAssignment}
                onComplete={handleCompleteAssignment}
                isAccepting={isAcceptingAssignment}
                isRejecting={isRejectingAssignment}
                isStarting={isStartingAssignment}
                isCompleting={isCompletingAssignment}
              />
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
          confirmAction?.type === "accept"
            ? "accept"
            : confirmAction?.type === "reject"
            ? "reject"
            : confirmAction?.type === "start"
            ? "start work for"
            : confirmAction?.type === "complete"
            ? "complete"
            : "perform this action"
        }?`}
        confirmText={
          confirmAction?.type === "accept"
            ? "Accept"
            : confirmAction?.type === "reject"
            ? "Reject"
            : confirmAction?.type === "start"
            ? "Start Work"
            : confirmAction?.type === "complete"
            ? "Complete"
            : "Confirm"
        }
        cancelText="Cancel"
      />
    </div>
  );
}
