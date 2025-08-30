import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brokerApplicationApi } from "@/lib/brokerApplicationApi";
import { BrokerApplicationRequest } from "@/types/broker-application";

export const useBrokerApplication = () => {
  const queryClient = useQueryClient();

  // Query for getting user's current application
  const {
    data: userApplication,
    isLoading: isLoadingApplication,
    error: applicationError,
    refetch: refetchApplication,
  } = useQuery({
    queryKey: ["brokerApplication", "user"],
    queryFn: async () => {
      const response = await brokerApplicationApi.getUserApplication();
      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for submitting broker application
  const {
    mutate: submitApplication,
    isPending: isSubmitting,
    error: submitError,
    data: submitData,
  } = useMutation({
    mutationFn: async (applicationData: BrokerApplicationRequest) => {
      const response = await brokerApplicationApi.submitBrokerApplication(
        applicationData
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user application data
      queryClient.invalidateQueries({
        queryKey: ["brokerApplication", "user"],
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
