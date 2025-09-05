import { MapPin, Loader2, Trash2, Edit } from "lucide-react";
import { Address } from "@/types/booking";

interface AddressListProps {
  addresses: Address[];
  isLoading: boolean;
  selectedAddressId: number | null;
  loadingAddressId: number | null;
  isDeletingAddress: boolean;
  onAddressSelection: (addressId: number) => void;
  onDeleteAddress: (addressId: number) => void;
  onEditAddress?: (address: Address) => void;
}

export default function AddressList({
  addresses,
  isLoading,
  selectedAddressId,
  loadingAddressId,
  isDeletingAddress,
  onAddressSelection,
  onDeleteAddress,
  onEditAddress,
}: AddressListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading addresses...</span>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No saved addresses</p>
        <p className="text-sm text-gray-500 mt-1">
          Click the + button to add your first address
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="py-3 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onAddressSelection(address.id)}
        >
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              id={`address-${address.id}`}
              name="selectedAddress"
              value={address.id}
              checked={selectedAddressId === address.id}
              onChange={(e) => onAddressSelection(Number(e.target.value))}
              className="mt-1 w-4 h-4 !text-[#00a871] border-gray-300 !focus:ring-[#00a871] !checked:bg-[#00a871] !checked:border-[#00a871]"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <label
                  htmlFor={`address-${address.id}`}
                  className="font-medium text-gray-900 cursor-pointer"
                >
                  {address.name}
                </label>
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                <p className="break-words">
                  {address.house_number && `${address.house_number}, `}
                  {address.address}
                  {address.landmark && `, Near ${address.landmark}`}
                  {", "}
                  {address.city}, {address.state}
                  {address.postal_code && ` ${address.postal_code}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {loadingAddressId === address.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <>
                  {onEditAddress && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAddress(address);
                      }}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                      title="Edit address"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAddress(address.id);
                    }}
                    disabled={isDeletingAddress}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
