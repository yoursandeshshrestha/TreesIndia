interface AddressModalFooterProps {
  isAddingNew: boolean;
  isEditing: boolean;
  isConfirming: boolean;
  addressesLength: number;
  selectedAddressId: number | null;
  isServiceAvailable: boolean | null;
  isCheckingAvailability: boolean;
  onChooseAddress: () => void;
  onBack: () => void;
  onConfirmAddress: () => void;
}

export default function AddressModalFooter({
  isAddingNew,
  isEditing,
  isConfirming,
  addressesLength,
  selectedAddressId,
  isServiceAvailable,
  isCheckingAvailability,
  onChooseAddress,
  onBack,
  onConfirmAddress,
}: AddressModalFooterProps) {
  // Don't show footer for add/edit forms (they have their own buttons)
  if (isAddingNew || isEditing) {
    return null;
  }

  // Show confirmation buttons
  if (isConfirming) {
    return (
      <div className="p-6">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={onConfirmAddress}
            className="flex-1 bg-[#00a871] hover:bg-[#009a65] text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Confirm Address
          </button>
        </div>
      </div>
    );
  }

  // Show choose address button for address list
  if (addressesLength > 0) {
    return (
      <div className="p-6">
        <button
          onClick={onChooseAddress}
          disabled={
            !selectedAddressId ||
            isServiceAvailable === false ||
            isCheckingAvailability
          }
          className="w-full bg-[#00a871] hover:bg-[#009a65] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {isCheckingAvailability
            ? "Checking availability..."
            : "Choose Address"}
        </button>
      </div>
    );
  }

  return null;
}
