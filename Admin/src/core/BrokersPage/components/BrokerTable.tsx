import React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, Building2 } from "lucide-react";
import { format } from "date-fns";
import Table from "@/components/Table/Table";
import { EnhancedBroker } from "@/types/broker";

interface BrokerTableProps {
  brokers: EnhancedBroker[];
  selectionMode: boolean;
  selectedBrokers: string[];
  onSelectionChange: (selected: EnhancedBroker[]) => void;
  onRowClick: (broker: EnhancedBroker) => void;
  onDeleteBroker: (broker: EnhancedBroker) => void;
}

function BrokerTable({
  brokers,

  onDeleteBroker,
}: BrokerTableProps) {
  const router = useRouter();

  const getStatusBadge = (isActive: boolean) => {
    const statusConfig = {
      true: { color: "bg-green-100 text-green-800", label: "Active" },
      false: { color: "bg-red-100 text-red-800", label: "Inactive" },
    };

    const config = statusConfig[String(isActive) as keyof typeof statusConfig];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (broker: EnhancedBroker) => {
    router.push(`/dashboard/brokers/${broker.user_id}`);
  };

  const getProfilePic = (broker: EnhancedBroker) => {
    if (broker.documents?.profile_pic) {
      return broker.documents.profile_pic;
    }
    if (broker.user?.avatar) {
      return broker.user.avatar;
    }
    return "/default-avatar.png";
  };

  const getLocation = (broker: EnhancedBroker) => {
    if (broker.address) {
      return {
        city: broker.address.city,
        state: broker.address.state,
      };
    }
    return { city: "Not provided", state: "Not provided" };
  };

  const columns = [
    {
      header: "Broker",
      accessor: (broker: EnhancedBroker) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full"
              src={getProfilePic(broker)}
              alt=""
            />
          </div>
          <div className="ml-4">
            {broker.user?.name && broker.user.name.trim() !== "" && (
              <div className="text-sm font-medium text-gray-900">
                {broker.user.name}
              </div>
            )}
            <div className="text-sm text-gray-500">
              {broker.user?.email || broker.user?.phone || "No contact"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Agency",
      accessor: (broker: EnhancedBroker) => (
        <div className="text-sm text-gray-900">
          {broker.agency || "Not provided"}
        </div>
      ),
    },
    {
      header: "License",
      accessor: (broker: EnhancedBroker) => (
        <div className="text-sm text-gray-900 font-mono">
          {broker.license || "Not provided"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (broker: EnhancedBroker) =>
        getStatusBadge(broker.user?.is_active || false),
    },
    {
      header: "Location",
      accessor: (broker: EnhancedBroker) => {
        const location = getLocation(broker);
        return (
          <div>
            <div className="text-sm text-gray-900">
              {location.city}, {location.state}
            </div>
            <div className="text-sm text-gray-500">India</div>
          </div>
        );
      },
    },
    {
      header: "Contact",
      accessor: (broker: EnhancedBroker) => (
        <div className="text-sm text-gray-500">
          {broker.contact_info?.alternative_number || "Not provided"}
        </div>
      ),
    },
    {
      header: "Joined",
      accessor: (broker: EnhancedBroker) => (
        <div className="text-sm text-gray-500">
          {format(
            new Date(broker.user?.CreatedAt || broker.CreatedAt),
            "MMM dd, yyyy"
          )}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "View",
      icon: <Eye size={14} />,
      onClick: handleViewDetails,
      className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      onClick: onDeleteBroker,
      className: "text-red-700 bg-red-100 hover:bg-red-200",
    },
  ];

  if (brokers.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 text-gray-400 mx-auto mb-4">
          <Building2 className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No brokers found
        </h3>
        <p className="text-gray-600">
          No brokers match your current filters. Try adjusting your search
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table<EnhancedBroker>
        data={brokers}
        columns={columns}
        keyField="ID"
        actions={actions}
        onRowClick={handleViewDetails}
      />
    </div>
  );
}

export default BrokerTable;
