import React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, Users } from "lucide-react";
import Table from "@/components/Table/Table";
import { EnhancedWorker } from "@/types/worker";

interface WorkerTableProps {
  workers: EnhancedWorker[];
  onDeleteWorker: (worker: EnhancedWorker) => void;
}

function WorkerTable({
  workers,
  onDeleteWorker,
}: WorkerTableProps) {
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

  const getWorkerTypeBadge = (workerType: string) => {
    const typeConfig = {
      normal: { color: "bg-blue-100 text-blue-800", label: "Normal" },
      treesindia_worker: {
        color: "bg-purple-100 text-purple-800",
        label: "TreesIndia",
      },
    };

    const config =
      typeConfig[workerType as keyof typeof typeConfig] || typeConfig.normal;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (worker: EnhancedWorker) => {
    router.push(`/dashboard/workers/${worker.ID}`);
  };

  const getProfilePic = (worker: EnhancedWorker) => {
    if (worker.documents?.profile_pic) {
      return worker.documents.profile_pic;
    }
    if (worker.user?.avatar) {
      return worker.user.avatar;
    }
    return "/default-avatar.png";
  };

  const getLocation = (worker: EnhancedWorker) => {
    if (worker.address) {
      return {
        city: worker.address.city,
        state: worker.address.state,
      };
    }
    return { city: "Not provided", state: "Not provided" };
  };

  const columns = [
    {
      header: "Worker",
      accessor: (worker: EnhancedWorker) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full"
              src={getProfilePic(worker)}
              alt={worker.user?.name || "Worker avatar"}
            />
          </div>
          <div className="ml-4">
            {worker.user?.name && worker.user.name.trim() !== "" && (
              <div className="text-sm font-medium text-gray-900">
                {worker.user.name}
              </div>
            )}
            <div className="text-sm text-gray-500">
              {worker.user?.email || worker.user?.phone || "No contact"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (worker: EnhancedWorker) => (
        <div>{getWorkerTypeBadge(worker.worker_type)}</div>
      ),
    },
    {
      header: "Status",
      accessor: (worker: EnhancedWorker) =>
        getStatusBadge(worker.user?.is_active || false),
    },
    {
      header: "Location",
      accessor: (worker: EnhancedWorker) => {
        const location = getLocation(worker);
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
      onClick: onDeleteWorker,
      className: "text-red-700 bg-red-100 hover:bg-red-200",
    },
  ];

  if (workers.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 text-gray-400 mx-auto mb-4">
          <Users className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No workers found
        </h3>
        <p className="text-gray-600">
          No workers match your current filters. Try adjusting your search
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table<EnhancedWorker>
        data={workers}
        columns={columns}
        keyField="ID"
        actions={actions}
        onRowClick={handleViewDetails}
      />
    </div>
  );
}

export default WorkerTable;
