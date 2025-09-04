import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth-api";
import {
  workerAssignmentApi,
  type WorkerAssignment,
  type WorkerAssignmentFilters,
  type AcceptAssignmentRequest,
  type RejectAssignmentRequest,
  type StartAssignmentRequest,
  type CompleteAssignmentRequest,
} from "@/lib/workerAssignmentApi";

export function useWorkerAssignments(filters?: WorkerAssignmentFilters) {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  // Fetch worker assignments
  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ["workerAssignments", filters],
    queryFn: () => workerAssignmentApi.getWorkerAssignments(filters),
    enabled: !!token,
  });

  // Debug logging

  // Accept assignment mutation
  const acceptAssignmentMutation = useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: number;
      data: AcceptAssignmentRequest;
    }) => workerAssignmentApi.acceptAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workerAssignments"] });
    },
    onError: (error) => {
      console.error("Error accepting assignment:", error);
    },
  });

  // Reject assignment mutation
  const rejectAssignmentMutation = useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: number;
      data: RejectAssignmentRequest;
    }) => workerAssignmentApi.rejectAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workerAssignments"] });
    },
    onError: (error) => {
      console.error("Error rejecting assignment:", error);
    },
  });

  // Start assignment mutation
  const startAssignmentMutation = useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: number;
      data: StartAssignmentRequest;
    }) => workerAssignmentApi.startAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workerAssignments"] });
    },
    onError: (error) => {
      console.error("Error starting assignment:", error);
    },
  });

  // Complete assignment mutation
  const completeAssignmentMutation = useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: number;
      data: CompleteAssignmentRequest;
    }) => workerAssignmentApi.completeAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workerAssignments"] });
    },
    onError: (error) => {
      console.error("Error completing assignment:", error);
    },
  });

  return {
    // Data
    assignments: assignmentsData?.data?.assignments || [],
    pagination: assignmentsData?.data?.pagination,
    isLoadingAssignments,
    assignmentsError,
    refetchAssignments,

    // Mutations
    acceptAssignmentAsync: acceptAssignmentMutation.mutateAsync,
    rejectAssignmentAsync: rejectAssignmentMutation.mutateAsync,
    startAssignmentAsync: startAssignmentMutation.mutateAsync,
    completeAssignmentAsync: completeAssignmentMutation.mutateAsync,

    // Loading states
    isAcceptingAssignment: acceptAssignmentMutation.isPending,
    isRejectingAssignment: rejectAssignmentMutation.isPending,
    isStartingAssignment: startAssignmentMutation.isPending,
    isCompletingAssignment: completeAssignmentMutation.isPending,

    // Errors
    acceptError: acceptAssignmentMutation.error,
    rejectError: rejectAssignmentMutation.error,
    startError: startAssignmentMutation.error,
    completeError: completeAssignmentMutation.error,
  };
}

// Hook for getting a specific worker assignment
export function useWorkerAssignment(assignmentId: number) {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  const {
    data: assignmentData,
    isLoading: isLoadingAssignment,
    error: assignmentError,
    refetch: refetchAssignment,
  } = useQuery({
    queryKey: ["workerAssignment", assignmentId],
    queryFn: () => workerAssignmentApi.getWorkerAssignment(assignmentId),
    enabled: !!token && !!assignmentId,
  });

  return {
    assignment: assignmentData?.assignment,
    isLoadingAssignment,
    assignmentError,
    refetchAssignment,
  };
}
