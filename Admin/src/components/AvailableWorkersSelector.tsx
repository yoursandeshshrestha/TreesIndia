import React from "react";
import { useAvailableWorkers } from "@/hooks/useAvailableWorkers";
import { User } from "@/types/user";
import Button from "@/components/Button/Base/Button";
import Spinner from "@/components/Loader/Spinner/Spinner";
import { User as UserIcon, Clock, Star, IndianRupee } from "lucide-react";

interface WorkerUser extends User {
  worker?: {
    id: number;
    user_id: number;
    service_id: number;
    hourly_rate: number;
    is_available: boolean;
    rating: number;
    total_bookings: number;
    worker_type: "treesindia" | "independent";
    skills?: string;
    experience_years?: number;
    service_areas?: string;
    earnings: number;
    total_jobs: number;
    service?: {
      id: number;
      name: string;
      price?: number;
      category_id: number;
    };
  };
}

interface AvailableWorkersSelectorProps {
  scheduledTime: string;
  serviceDuration?: number;
  serviceId?: number;
  location?: string;
  onWorkerSelect?: (worker: WorkerUser) => void;
  selectedWorkerId?: number;
}

export const AvailableWorkersSelector: React.FC<
  AvailableWorkersSelectorProps
> = ({
  scheduledTime,
  serviceDuration = 120,
  serviceId,
  location,
  onWorkerSelect,
  selectedWorkerId,
}) => {
  const { workers, loading, error, refetch } = useAvailableWorkers({
    scheduledTime,
    serviceDuration,
    serviceId,
    location,
    enabled: !!scheduledTime,
  });

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getWorkerRating = (worker: WorkerUser) => {
    return worker.worker?.rating || 0;
  };

  const getWorkerExperience = (worker: WorkerUser) => {
    return worker.worker?.experience_years || 0;
  };

  const getWorkerHourlyRate = (worker: WorkerUser) => {
    return worker.worker?.hourly_rate || 0;
  };

  const getWorkerSkills = (worker: WorkerUser) => {
    try {
      const skills = worker.worker?.skills;
      if (skills) {
        return JSON.parse(skills);
      }
    } catch {
      // If parsing fails, return as string
      return worker.worker?.skills || "No skills listed";
    }
    return "No skills listed";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Loading available workers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <div className="text-red-600">
            <span className="font-medium">Error:</span> {error}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!scheduledTime) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-gray-600">
          Please select a scheduled time to view available workers.
        </div>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-yellow-800">
          <span className="font-medium">No available workers found</span>
          <p className="text-sm mt-1">
            No workers are available for the selected time slot:{" "}
            {formatTime(scheduledTime)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Available Workers ({workers.length})
        </h3>
        <Button variant="outline" size="sm" onClick={refetch}>
          Refresh
        </Button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Scheduled for: {formatTime(scheduledTime)} ({serviceDuration} minutes)
      </div>

      <div className="grid gap-4">
        {workers.map((worker) => {
          const workerUser = worker as WorkerUser;
          const workerId = (worker as { id?: number }).id || worker.ID;
          return (
            <div
              key={workerId}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedWorkerId === workerId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => onWorkerSelect?.(workerUser)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{worker.name}</h4>
                    <p className="text-sm text-gray-600">{worker.phone}</p>
                    {worker.email && (
                      <p className="text-sm text-gray-600">{worker.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    {getWorkerRating(workerUser).toFixed(1)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-500 mr-1" />
                    {getWorkerExperience(workerUser)}y
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <IndianRupee className="w-4 h-4 text-green-500 mr-1" />
                    {getWorkerHourlyRate(workerUser)}/hr
                  </div>
                </div>
              </div>

              {workerUser.worker?.service && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Service:</span>{" "}
                    {workerUser.worker.service.name}
                  </div>
                </div>
              )}

              <div className="mt-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Skills:</span>{" "}
                  {Array.isArray(getWorkerSkills(workerUser))
                    ? getWorkerSkills(workerUser).join(", ")
                    : getWorkerSkills(workerUser)}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span>{" "}
                  <span className="capitalize">
                    {workerUser.worker?.worker_type || "Unknown"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Total Jobs:</span>{" "}
                  {workerUser.worker?.total_jobs || 0}
                </div>
              </div>

              {selectedWorkerId === workerId && (
                <div className="mt-3 p-2 bg-blue-100 border border-blue-200 rounded">
                  <div className="text-sm text-blue-800 font-medium">
                    ✓ Selected for assignment
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
