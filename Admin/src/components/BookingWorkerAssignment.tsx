import React, { useState } from "react";
import { AvailableWorkersSelector } from "./AvailableWorkersSelector";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import { User } from "@/types/user";

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
import { Calendar, Clock, User as UserIcon, CheckCircle } from "lucide-react";

interface BookingWorkerAssignmentProps {
  bookingId?: number;
  onAssignmentComplete?: (assignment: {
    bookingId: number;
    workerId: number;
    notes: string;
  }) => void;
}

export const BookingWorkerAssignment: React.FC<
  BookingWorkerAssignmentProps
> = ({ bookingId, onAssignmentComplete }) => {
  const [scheduledTime, setScheduledTime] = useState("");
  const [serviceDuration, setServiceDuration] = useState(120);
  const [selectedWorker, setSelectedWorker] = useState<WorkerUser | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleWorkerSelect = (worker: WorkerUser) => {
    setSelectedWorker(worker);
  };

  const handleAssignWorker = async () => {
    if (!selectedWorker || !bookingId) {
      return;
    }

    setIsAssigning(true);
    try {
      // Here you would call your API to assign the worker
      // const response = await assignWorkerToBooking({
      //   bookingId,
      //   workerId: selectedWorker.id,
      //   notes: assignmentNotes,
      // });

      // For demo purposes, we'll just call the callback
      onAssignmentComplete?.({
        bookingId,
        workerId: selectedWorker.ID,
        notes: assignmentNotes,
      });

      // Reset form
      setSelectedWorker(null);
      setAssignmentNotes("");
    } catch (error) {
      console.error("Failed to assign worker:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Assign Worker to Booking
        </h2>

        {/* Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Time
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="flex-1"
                placeholder="Select date and time"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Duration (minutes)
            </label>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <Input
                type="number"
                value={serviceDuration}
                onChange={(e) =>
                  setServiceDuration(parseInt(e.target.value) || 120)
                }
                min="30"
                max="480"
                className="flex-1"
                placeholder="120"
              />
            </div>
          </div>
        </div>

        {/* Available Workers */}
        <div className="mb-6">
          <AvailableWorkersSelector
            scheduledTime={scheduledTime}
            serviceDuration={serviceDuration}
            onWorkerSelect={handleWorkerSelect}
            selectedWorkerId={selectedWorker?.ID}
          />
        </div>

        {/* Assignment Notes */}
        {selectedWorker && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Notes (Optional)
            </label>
            <Textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="Add any special instructions or notes for the worker..."
              rows={3}
            />
          </div>
        )}

        {/* Selected Worker Summary */}
        {selectedWorker && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Selected Worker: {selectedWorker.name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {selectedWorker.phone} • Rating:{" "}
                    {selectedWorker.worker?.rating?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-900">
                  ₹{selectedWorker.worker?.hourly_rate || 0}/hr
                </div>
                <div className="text-xs text-blue-700">
                  {selectedWorker.worker?.experience_years || 0} years
                  experience
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWorker(null);
              setAssignmentNotes("");
            }}
            disabled={!selectedWorker}
          >
            Clear Selection
          </Button>
          <Button
            onClick={handleAssignWorker}
            disabled={!selectedWorker || !bookingId || isAssigning}
            loading={isAssigning}
          >
            {isAssigning ? "Assigning..." : "Assign Worker"}
          </Button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">How to use:</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Select the scheduled date and time for the booking</li>
          <li>Set the service duration (default: 120 minutes)</li>
          <li>Review the list of available workers</li>
          <li>Click on a worker to select them</li>
          <li>Add optional assignment notes</li>
          <li>Click &quot;Assign Worker&quot; to complete the assignment</li>
        </ol>
      </div>
    </div>
  );
};
