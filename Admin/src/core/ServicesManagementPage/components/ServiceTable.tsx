import {
  Edit,
  Trash2,
  Image as ImageIcon,
  Package,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import Table from "@/components/Table/Table";
import Toggle from "@/components/Toggle";
import { Service } from "../types";

interface ServiceTableProps {
  services: Service[];
  togglingItems: Set<number>;
  onEditService: (service: Service) => void;
  onDeleteService: (service: Service) => void;
  onToggleServiceStatus: (service: Service) => void;
}

export default function ServiceTable({
  services,
  togglingItems,
  onEditService,
  onDeleteService,
  onToggleServiceStatus,
}: ServiceTableProps) {
  const formatPrice = (price: number | undefined, priceType: string) => {
    if (priceType === "inquiry") {
      return "Inquiry Based";
    }
    if (price === undefined || price === null) {
      return "N/A";
    }
    return `₹${price.toLocaleString()}`;
  };

  const getPriceTypeIcon = (priceType: string) => {
    if (priceType === "fixed") {
      return <DollarSign size={16} className="text-green-600" />;
    }
    return <MessageSquare size={16} className="text-blue-600" />;
  };

  const getPriceTypeBadge = (priceType: string) => {
    if (priceType === "fixed") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <DollarSign size={12} className="mr-1" />
          Fixed Price
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <MessageSquare size={12} className="mr-1" />
        Inquiry Based
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      header: "Service Name",
      accessor: (service: Service) => (
        <div className="flex items-center space-x-3">
          {service.images && service.images.length > 0 ? (
            <img
              src={service.images[0]}
              alt={service.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon size={16} className="text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{service.name}</div>
            {service.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {service.description}
              </div>
            )}
            <div className="mt-1">{getPriceTypeBadge(service.price_type)}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (service: Service) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {service.category_name || "N/A"}
          </div>
          <div className="text-gray-500">
            {service.subcategory_name || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Images",
      accessor: (service: Service) => (
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {service.images ? service.images.length : 0}
          </span>
        </div>
      ),
    },
    {
      header: "Service Areas",
      accessor: (service: Service) => (
        <div className="text-sm">
          {service.service_areas && service.service_areas.length > 0 ? (
            <div className="space-y-1">
              {service.service_areas.slice(0, 2).map((area, index) => (
                <div key={area.id} className="text-gray-900">
                  {area.city}, {area.state}
                </div>
              ))}
              {service.service_areas.length > 2 && (
                <div className="text-gray-500 text-xs">
                  +{service.service_areas.length - 2} more
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">No areas</span>
          )}
        </div>
      ),
    },
    {
      header: "Pricing",
      accessor: (service: Service) => (
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-1">
            {getPriceTypeIcon(service.price_type)}
            <div className="font-medium text-gray-900">
              {formatPrice(service.price, service.price_type)}
            </div>
          </div>
          {service.duration && (
            <div className="text-gray-500 text-xs">
              Duration: {service.duration}
            </div>
          )}
          {service.price_type === "inquiry" && (
            <div className="text-blue-600 text-xs">Quote-based pricing</div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (service: Service) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <Toggle
            checked={service.is_active}
            onChange={() => onToggleServiceStatus(service)}
            disabled={togglingItems.has(service.id)}
            size="sm"
          />
          <span className="text-sm text-gray-600 w-16 text-center">
            {service.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      header: "Created",
      accessor: (service: Service) => (
        <div className="text-sm text-gray-500">
          {formatDate(service.created_at)}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: onEditService,
      className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      onClick: onDeleteService,
      className: "text-red-700 bg-red-100 hover:bg-red-200",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <Table<Service>
        data={services}
        columns={columns}
        keyField="id"
        actions={actions}
        emptyState={
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">
              No services found
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        }
      />
    </div>
  );
}
