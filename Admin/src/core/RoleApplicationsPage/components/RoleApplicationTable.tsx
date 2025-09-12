import React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import Table from "@/components/Table/Table";
import { EnhancedRoleApplication } from "@/types/roleApplication";

interface RoleApplicationTableProps {
  applications: EnhancedRoleApplication[];
  selectionMode: boolean;
  selectedApplications: string[];
  onSelectionChange: (selected: EnhancedRoleApplication[]) => void;
  onRowClick: (application: EnhancedRoleApplication) => void;
  onDeleteApplication: (application: EnhancedRoleApplication) => void;
}

function RoleApplicationTable({
  applications,

  onDeleteApplication,
}: RoleApplicationTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      worker: { color: "bg-blue-100 text-blue-800", label: "Worker" },
      broker: { color: "bg-purple-100 text-purple-800", label: "Broker" },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.worker;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (application: EnhancedRoleApplication) => {
    router.push(`/dashboard/role-applications/${application.ID}`);
  };

  const getProfilePic = (application: EnhancedRoleApplication) => {
    // First try to get avatar from user object
    if (application.user?.avatar) {
      return application.user.avatar;
    }
    // Fallback to documents profile pic
    if (application.worker?.documents?.profile_pic) {
      return application.worker.documents.profile_pic;
    }
    if (application.broker?.documents?.profile_pic) {
      return application.broker.documents.profile_pic;
    }
    return "/default-avatar.png";
  };

  const getLocation = (application: EnhancedRoleApplication) => {
    if (application.worker?.address) {
      return {
        city: application.worker.address.city,
        state: application.worker.address.state,
      };
    }
    if (application.broker?.address) {
      return {
        city: application.broker.address.city,
        state: application.broker.address.state,
      };
    }
    return { city: "Not provided", state: "Not provided" };
  };

  const columns = [
    {
      header: "Applicant",
      accessor: (application: EnhancedRoleApplication) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full"
              src={getProfilePic(application)}
              alt=""
            />
          </div>
          <div className="ml-4">
            {application.user?.name && application.user.name.trim() !== "" && (
              <div className="text-sm font-medium text-gray-900">
                {application.user.name}
              </div>
            )}
            <div className="text-sm text-gray-500">
              {application.user?.email ||
                application.user?.phone ||
                "No contact"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (application: EnhancedRoleApplication) => (
        <div>{getRoleBadge(application.requested_role)}</div>
      ),
    },
    {
      header: "Status",
      accessor: (application: EnhancedRoleApplication) =>
        getStatusBadge(application.status),
    },
    {
      header: "Location",
      accessor: (application: EnhancedRoleApplication) => {
        const location = getLocation(application);
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
      header: "Submitted",
      accessor: (application: EnhancedRoleApplication) => (
        <div className="text-sm text-gray-500">
          {format(new Date(application.submitted_at), "MMM dd, yyyy")}
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
      onClick: onDeleteApplication,
      className: "text-red-700 bg-red-100 hover:bg-red-200",
    },
  ];

  if (applications.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 text-gray-400 mx-auto mb-4">
          <FileText className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No applications found
        </h3>
        <p className="text-gray-600">
          No applications match your current filters. Try adjusting your search
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table<EnhancedRoleApplication>
        data={applications}
        columns={columns}
        keyField="ID"
        actions={actions}
        onRowClick={handleViewDetails}
      />
    </div>
  );
}

export default RoleApplicationTable;
