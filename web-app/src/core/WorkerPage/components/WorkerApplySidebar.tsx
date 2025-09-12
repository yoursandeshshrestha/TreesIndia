"use client";

import { Check } from "lucide-react";

interface WorkerApplyStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed";
  editable: boolean;
}

interface WorkerApplySidebarProps {
  steps: WorkerApplyStep[];
  onStepClick?: (stepId: string) => void;
  onEditStep?: (stepId: string) => void;
}

export default function WorkerApplySidebar({
  steps,
  onEditStep,
}: WorkerApplySidebarProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 w-full mr-4">
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-3 top-6 w-0.5 h-12 ${
                  step.status === "completed" ? "bg-[#00a871]" : "bg-gray-300"
                }`}
              />
            )}

            {/* Step Content */}
            <div className="flex items-start space-x-3">
              {/* Status Indicator */}
              <div className="flex-shrink-0">
                {step.status === "completed" ? (
                  <div className="w-6 h-6 bg-[#00a871] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : step.status === "active" ? (
                  <div className="w-6 h-6 border-2 border-[#00a871] rounded-full flex items-center justify-center bg-white">
                    <div className="w-1.5 h-1.5 bg-[#00a871] rounded-full" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full bg-white" />
                )}
              </div>

              {/* Step Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-semibold ${
                      step.status === "active"
                        ? "text-gray-900"
                        : step.status === "completed"
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.status === "completed" &&
                    step.editable &&
                    onEditStep && (
                      <button
                        onClick={() => onEditStep(step.id)}
                        className="text-[#00a871] hover:text-[#008f5f] text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                    )}
                </div>
                <p
                  className={`text-xs mt-1 ${
                    step.status === "active"
                      ? "text-gray-500"
                      : step.status === "completed"
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
