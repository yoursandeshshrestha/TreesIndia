import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth-api";
import {
  getWalletSummary,
  getWalletTransactions,
  createWalletRecharge,
  completeWalletRecharge,
  refreshWalletRechargeOrder,
  cancelWalletRecharge,
  RechargeRequest,
} from "@/lib/walletApi";

export function useWallet(enableTransactions: boolean = false) {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  // Fetch wallet summary
  const {
    data: walletSummary,
    isLoading: isLoadingWalletSummary,
    error: walletSummaryError,
    refetch: refetchWalletSummary,
  } = useQuery({
    queryKey: ["walletSummary"],
    queryFn: () => getWalletSummary(),
    enabled: !!token,
  });

  // Fetch wallet transactions only when enabled
  const {
    data: walletTransactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["walletTransactions"],
    queryFn: () => getWalletTransactions(),
    enabled: !!token && enableTransactions,
  });

  // Create wallet recharge mutation
  const createRechargeMutation = useMutation({
    mutationFn: (rechargeData: RechargeRequest) =>
      createWalletRecharge(rechargeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletSummary"] });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions"] });
    },
    onError: () => {
      // Error handled by component
    },
  });

  // Complete wallet recharge mutation
  const completeRechargeMutation = useMutation({
    mutationFn: ({
      paymentId,
      paymentData,
    }: {
      paymentId: number;
      paymentData: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      };
    }) => completeWalletRecharge(paymentId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletSummary"] });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions"] });
    },
    onError: () => {
      // Error handled by component
    },
  });

  // Refresh wallet recharge order mutation
  const refreshRechargeMutation = useMutation({
    mutationFn: (paymentId: number) => refreshWalletRechargeOrder(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletSummary"] });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions"] });
    },
    onError: () => {
      // Error handled by component
    },
  });

  // Cancel wallet recharge mutation
  const cancelRechargeMutation = useMutation({
    mutationFn: (paymentId: number) => cancelWalletRecharge(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletSummary"] });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions"] });
    },
    onError: () => {
      // Error handled by component
    },
  });

  return {
    // Data
    walletSummary: walletSummary?.data,
    transactions: walletTransactions?.data?.transactions || [],
    totalTransactions: walletTransactions?.data?.total || 0,

    // Loading states
    isLoadingWalletSummary,
    isLoadingTransactions,
    isCreatingRecharge: createRechargeMutation.isPending,
    isCompletingRecharge: completeRechargeMutation.isPending,
    isRefreshingRecharge: refreshRechargeMutation.isPending,
    isCancelingRecharge: cancelRechargeMutation.isPending,

    // Error states
    walletSummaryError,
    transactionsError,
    createRechargeError: createRechargeMutation.error,
    completeRechargeError: completeRechargeMutation.error,
    refreshRechargeError: refreshRechargeMutation.error,
    cancelRechargeError: cancelRechargeMutation.error,

    // Actions
    createRecharge: createRechargeMutation.mutate,
    createRechargeAsync: createRechargeMutation.mutateAsync,
    completeRecharge: completeRechargeMutation.mutate,
    completeRechargeAsync: completeRechargeMutation.mutateAsync,
    refreshRecharge: refreshRechargeMutation.mutate,
    refreshRechargeAsync: refreshRechargeMutation.mutateAsync,
    cancelRecharge: cancelRechargeMutation.mutate,
    cancelRechargeAsync: cancelRechargeMutation.mutateAsync,
    refetchWalletSummary,
    refetchTransactions,
  };
}
