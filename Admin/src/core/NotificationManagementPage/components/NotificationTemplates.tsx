import React, { useState } from "react";
import { X, Plus, Edit, Copy, Check } from "lucide-react";
import { NotificationTemplate } from "../types";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import Select from "@/components/Select/Select";

interface NotificationTemplatesProps {
  templates: NotificationTemplate[];
  onSelect: (template: NotificationTemplate) => void;
  onClose: () => void;
}

const NotificationTemplates: React.FC<NotificationTemplatesProps> = ({
  templates,
  onSelect,
  onClose,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "system" as const,
    title: "",
    body: "",
    click_action: "",
    image_url: "",
  });

  const handleCreateTemplate = () => {
    // TODO: Implement template creation
    console.log("Creating template:", formData);
    setShowCreateForm(false);
    setFormData({
      name: "",
      type: "system",
      title: "",
      body: "",
      click_action: "",
      image_url: "",
    });
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      title: template.title,
      body: template.body,
      click_action: template.click_action || "",
      image_url: template.image_url || "",
    });
  };

  const handleUpdateTemplate = () => {
    // TODO: Implement template update
    console.log("Updating template:", editingTemplate?.id, formData);
    setEditingTemplate(null);
    setFormData({
      name: "",
      type: "system",
      title: "",
      body: "",
      click_action: "",
      image_url: "",
    });
  };

  const handleCopyTemplate = (template: NotificationTemplate) => {
    setCopiedTemplate(template.id);
    setTimeout(() => setCopiedTemplate(null), 2000);

    // Copy template data to clipboard
    const templateText = `Title: ${template.title}\nBody: ${template.body}\nType: ${template.type}`;
    navigator.clipboard.writeText(templateText);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      system: "bg-blue-100 text-blue-800",
      booking: "bg-green-100 text-green-800",
      promotional: "bg-purple-100 text-purple-800",
      payment: "bg-yellow-100 text-yellow-800",
      subscription: "bg-indigo-100 text-indigo-800",
      chat: "bg-pink-100 text-pink-800",
      worker_assignment: "bg-orange-100 text-orange-800",
      test: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || colors.system;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Notification Templates
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={16} className="mr-2" />
              Create Template
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showCreateForm ? (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">
                Create New Template
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Welcome Message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value as any }))
                    }
                    options={[
                      { value: "system", label: "System" },
                      { value: "booking", label: "Booking" },
                      { value: "promotional", label: "Promotional" },
                      { value: "payment", label: "Payment" },
                      { value: "subscription", label: "Subscription" },
                      { value: "chat", label: "Chat" },
                      {
                        value: "worker_assignment",
                        label: "Worker Assignment",
                      },
                      { value: "test", label: "Test" },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body
                </label>
                <Textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, body: e.target.value }))
                  }
                  placeholder="Notification message"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Click Action (Optional)
                  </label>
                  <Input
                    value={formData.click_action}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        click_action: e.target.value,
                      }))
                    }
                    placeholder="e.g., OPEN_APP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button onClick={handleCreateTemplate}>Create Template</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : editingTemplate ? (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">
                Edit Template
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Welcome Message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value as any }))
                    }
                    options={[
                      { value: "system", label: "System" },
                      { value: "booking", label: "Booking" },
                      { value: "promotional", label: "Promotional" },
                      { value: "payment", label: "Payment" },
                      { value: "subscription", label: "Subscription" },
                      { value: "chat", label: "Chat" },
                      {
                        value: "worker_assignment",
                        label: "Worker Assignment",
                      },
                      { value: "test", label: "Test" },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body
                </label>
                <Textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, body: e.target.value }))
                  }
                  placeholder="Notification message"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Click Action (Optional)
                  </label>
                  <Input
                    value={formData.click_action}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        click_action: e.target.value,
                      }))
                    }
                    placeholder="e.g., OPEN_APP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button onClick={handleUpdateTemplate}>Update Template</Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingTemplate(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => onSelect(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          template.type
                        )}`}
                      >
                        {template.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyTemplate(template);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy template"
                        >
                          {copiedTemplate === template.id ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTemplate(template);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit template"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-2">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {template.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-3">
                      {template.body}
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Created:{" "}
                          {new Date(template.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            template.is_active ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {templates.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Plus size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No templates yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first notification template to get started
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Template
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationTemplates;
