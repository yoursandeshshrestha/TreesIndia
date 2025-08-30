import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workerApplicationApi } from "@/lib/workerApplicationApi";
import { WorkerApplicationRequest } from "@/types/worker-application";

export const useWorkerApplication = () => {
  const queryClient = useQueryClient();

  // Query for getting user's current application
  const {
    data: userApplication,
    isLoading: isLoadingApplication,
    error: applicationError,
    refetch: refetchApplication,
  } = useQuery({
    queryKey: ["workerApplication", "user"],
    queryFn: async () => {
      const response = await workerApplicationApi.getUserApplication();
      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for submitting worker application
  const {
    mutate: submitApplication,
    isPending: isSubmitting,
    error: submitError,
    data: submitData,
  } = useMutation({
    mutationFn: async (applicationData: WorkerApplicationRequest) => {
      const response = await workerApplicationApi.submitWorkerApplication(
        applicationData
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user application data
      queryClient.invalidateQueries({
        queryKey: ["workerApplication", "user"],
      });
    },
  });

  return {
    // Query data
    userApplication,
    isLoadingApplication,
    applicationError,
    refetchApplication,

    // Mutation data
    submitApplication,
    isSubmitting,
    submitError,
    submitData,
  };
};
