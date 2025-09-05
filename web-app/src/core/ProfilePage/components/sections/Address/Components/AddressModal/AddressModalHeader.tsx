import { Plus, Target, Loader2 } from "lucide-react";

interface AddressModalHeaderProps {
  isAddingNew: boolean;
  isEditing: boolean;
  isConfirming: boolean;
  isDetectingLocation: boolean;
  onAddNew: () => void;
  onDetectLocation: () => void;
}

export default function AddressModalHeader({
  isAddingNew,
  isEditing,
  isConfirming,
  isDetectingLocation,
  onAddNew,
  onDetectLocation,
}: AddressModalHeaderProps) {
  const getTitle = () => {
    if (isAddingNew) return "Add New Address";
    if (isEditing) return "Edit Address";
    if (isConfirming) return "Confirm Address Details";
    return "Saved Addresses";
  };

  const getDescription = () => {
    if (isAddingNew || isEditing) return "Enter your address details";
    if (isConfirming) return "Review and edit your address details";
    return "Choose from your saved addresses";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
          </div>
          <p className="text-gray-600 text-sm mt-1">{getDescription()}</p>
        </div>
        
        {!isAddingNew && !isEditing && !isConfirming && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddNew}
              className="w-10 h-10 text-gray-900 cursor-pointer rounded-full flex items-center justify-center transition-colors"
              title="Add new address"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {isAddingNew && (
          <div className="flex items-center">
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="w-10 h-10 text-gray-900 cursor-pointer rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                isDetectingLocation
                  ? "Detecting location..."
                  : "Detect my location"
              }
            >
              {isDetectingLocation ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#00a871]" />
              ) : (
                <Target className="w-5 h-5" />
              )}
            </button>
            <span className="ml-2 text-xs text-gray-500">
              {isDetectingLocation ? "Loading..." : "Ready"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
