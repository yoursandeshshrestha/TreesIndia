import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { callMaskingApi } from "@/lib/callMaskingApi";

export const TestCallPage: React.FC = () => {
  const [bookingId, setBookingId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleTestCall = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await callMaskingApi.testCall(phoneNumber);
      toast.success(`Test call initiated: ${response.call_sid}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to make test call");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!bookingId) {
      toast.error("Please enter a booking ID");
      return;
    }

    setLoading(true);
    try {
      await callMaskingApi.initiateCall(parseInt(bookingId));
      toast.success("Call initiated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initiate call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Test Call Masking</h1>

      <div className="space-y-6">
        {/* Test Call Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test Call</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button
              onClick={handleTestCall}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Calling..." : "Make Test Call"}
            </Button>
          </CardContent>
        </Card>

        {/* Call Masking Section */}
        <Card>
          <CardHeader>
            <CardTitle>Call Masking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bookingId">Booking ID</Label>
              <Input
                id="bookingId"
                type="number"
                placeholder="123"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={handleInitiateCall}
                disabled={loading}
                variant="default"
              >
                Initiate Call
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                1. <strong>Test Call:</strong> Enter a phone number to make a
                test call
              </p>
              <p>
                2. <strong>Initiate Masking:</strong> Create a call masking
                session for a booking
              </p>
              <p>
                3. <strong>Initiate Call:</strong> Start a call between customer
                and worker
              </p>
              <p>
                4. <strong>Terminate Masking:</strong> End the call masking
                session
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
