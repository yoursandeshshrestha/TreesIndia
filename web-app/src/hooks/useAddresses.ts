import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth-api";
import {
  fetchUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} from "@/lib/addressApi";

export function useAddresses() {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  // Fetch all user addresses
  const {
    data: addresses,
    isLoading: isLoadingAddresses,
    error: addressesError,
    refetch: refetchAddresses,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => fetchUserAddresses(),
    enabled: !!token,
  });

  // Fetch default address
  const {
    data: defaultAddress,
    isLoading: isLoadingDefaultAddress,
    error: defaultAddressError,
    refetch: refetchDefaultAddress,
  } = useQuery({
    queryKey: ["defaultAddress"],
    queryFn: () => getDefaultAddress(),
    enabled: !!token,
    retry: (failureCount, error) => {
      // Don't retry on 500 errors for default address
      if (error instanceof Error && error.message.includes('500')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: (addressData: {
      name: string;
      address: string;
      city: string;
      state: string;
      country: string;
      postal_code?: string;
      latitude?: number;
      longitude?: number;
      landmark?: string;
      house_number?: string;
      is_default?: boolean;
    }) => createAddress(addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({
      addressId,
      addressData,
    }: {
      addressId: number;
      addressData: {
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        postal_code?: string;
        latitude?: number;
        longitude?: number;
        landmark?: string;
        house_number?: string;
        is_default?: boolean;
      };
    }) => updateAddress(addressId, addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: number) => deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Set default address mutation
  const setDefaultAddressMutation = useMutation({
    mutationFn: (addressId: number) => setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });

  return {
    // Data
    addresses: addresses?.data || [],
    defaultAddress: defaultAddress?.data || null,

    // Loading states
    isLoadingAddresses,
    isLoadingDefaultAddress,
    isCreatingAddress: createAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
    isSettingDefaultAddress: setDefaultAddressMutation.isPending,

    // Error states
    addressesError,
    defaultAddressError,
    createAddressError: createAddressMutation.error,
    updateAddressError: updateAddressMutation.error,
    deleteAddressError: deleteAddressMutation.error,
    setDefaultAddressError: setDefaultAddressMutation.error,

    // Actions
    createAddress: createAddressMutation.mutate,
    createAddressAsync: createAddressMutation.mutateAsync,
    updateAddress: updateAddressMutation.mutate,
    updateAddressAsync: updateAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutate,
    deleteAddressAsync: deleteAddressMutation.mutateAsync,
    setDefaultAddress: setDefaultAddressMutation.mutate,
    refetchAddresses,
    refetchDefaultAddress,
  };
}
