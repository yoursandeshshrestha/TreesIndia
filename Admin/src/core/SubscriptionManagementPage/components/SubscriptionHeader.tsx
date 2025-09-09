import { Plus } from "lucide-react";
import Button from "@/components/Button/Base/Button";

interface SubscriptionHeaderProps {
  onCreateClick: () => void;
}

export function SubscriptionHeader({ onCreateClick }: SubscriptionHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <p className="text-sm text-gray-500">
          Manage subscription plans and monitor user subscriptions
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        className="w-34 h-10 whitespace-nowrap"
        leftIcon={<Plus size={16} />}
        onClick={onCreateClick}
      >
        Create Plan
      </Button>
    </div>
  );
}
