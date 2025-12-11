import {
  Edit,
  Trash2,
  Image as ImageIcon,
  Package,
  MessageSquare,
  ExternalLink,
  IndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Table from "@/components/Table/Table";
import Toggle from "@/components/Toggle";
import { HTMLRenderer } from "@/components/HTMLRenderer";
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
  const router = useRouter();
  const formatPrice = (price: number | undefined, priceType: string) => {
    if (priceType === "inquiry") {
      return "Inquiry Based";
    }
    if (price === undefined || price === null) {
      return "N/A";
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const getPriceTypeIcon = (priceType: string) => {
    if (priceType === "fixed") {
      return <IndianRupee size={16} className="text-green-600" />;
    }
    return <MessageSquare size={16} className="text-blue-600" />;
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  `;
                }
              }}
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
                <HTMLRenderer
                  html={service.description}
                  className="truncate"
                  stripDataAttributes={true}
                />
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (service: Service) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {service.category?.name || service.category_name || "N/A"}
          </div>
          <div className="text-gray-500">
            {service.subcategory?.name || service.subcategory_name || "N/A"}
          </div>
        </div>
      ),
    },

    {
      header: "Service Areas",
      accessor: (service: Service) => (
        <div className="text-sm">
          {service.service_areas && service.service_areas.length > 0 ? (
            <div className="space-y-1">
              {service.service_areas.slice(0, 2).map((area) => (
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
      label: "View",
      icon: <ExternalLink size={14} />,
      onClick: (service: Service) => {
        // Navigate in the same tab
        router.push(`/dashboard/services/${service.id}`);
      },
      className: "text-green-700 bg-green-100 hover:bg-green-200",
    },
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
