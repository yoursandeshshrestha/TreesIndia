import React from "react";
import { Edit2, Trash2, MapPin } from "lucide-react";
import Table from "@/components/Table/Table";
import Badge from "@/components/Badge/Badge";
import { ServiceArea } from "@/core/ServicesManagementPage/types";

interface ServiceAreaTableProps {
  serviceAreas: ServiceArea[];
  onEdit: (area: ServiceArea) => void;
  onDelete: (area: ServiceArea) => void;
}

const ServiceAreaTable = ({
  serviceAreas,
  onEdit,
  onDelete,
}: ServiceAreaTableProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate statistics
  const stats = {
    total: serviceAreas.length,
    active: serviceAreas.filter((a) => a.is_active).length,
    inactive: serviceAreas.filter((a) => !a.is_active).length,
    withPincodes: serviceAreas.filter(
      (a) => a.pincodes && a.pincodes.length > 0
    ).length,
    totalPincodes: serviceAreas.reduce(
      (sum, a) => sum + (a.pincodes?.length || 0),
      0
    ),
  };

  return (
    <div className="mt-2">
      {/* Statistics Summary */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            Total Areas
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Inactive</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            With Pincodes
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.withPincodes}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            Total Pincodes
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalPincodes}
          </div>
        </div>
      </div>

      {/* Service Areas Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={[
            {
              header: "Last Updated",
              accessor: (area: ServiceArea) => (
                <div className="text-sm">
                  <div className="text-gray-900 font-medium">
                    {formatDate(area.updated_at)}
                  </div>
                  {area.created_at && (
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(area.created_at)}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Location",
              accessor: (area: ServiceArea) => (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {area.city}, {area.state}
                    </div>
                    <div className="text-sm text-gray-500">{area.country}</div>
                  </div>
                </div>
              ),
            },
            {
              header: "Pincodes",
              accessor: (area: ServiceArea) => (
                <div>
                  {area.pincodes && area.pincodes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {area.pincodes.slice(0, 5).map((pincode) => (
                        <Badge
                          key={pincode}
                          variant="outline"
                          className="bg-gray-50 text-gray-700 border-gray-200"
                        >
                          {pincode}
                        </Badge>
                      ))}
                      {area.pincodes.length > 5 && (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-500 border-gray-200"
                        >
                          +{area.pincodes.length - 5} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No pincodes</span>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              accessor: (area: ServiceArea) => (
                <Badge
                  variant={area.is_active ? "success" : "danger"}
                  className="capitalize"
                >
                  {area.is_active ? "Active" : "Inactive"}
                </Badge>
              ),
            },
          ]}
          data={serviceAreas}
          keyField="id"
          actions={[
            {
              label: "Edit",
              onClick: (area: ServiceArea) => onEdit(area),
              className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
              icon: <Edit2 size={14} />,
            },
            {
              label: "Delete",
              onClick: (area: ServiceArea) => onDelete(area),
              className: "text-red-700 bg-red-100 hover:bg-red-200",
              icon: <Trash2 size={14} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ServiceAreaTable;
