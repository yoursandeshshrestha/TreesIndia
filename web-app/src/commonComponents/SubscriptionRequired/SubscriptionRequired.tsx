"use client";

import { Lock, ArrowRight, Building, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProjectStats } from "@/types/project";
import { VendorStats } from "@/types/vendor";
import { WorkerStats } from "@/types/worker";
import { SubscriptionPlanCard } from "@/core/SubscriptionPlansPage/components/SubscriptionPlanCard";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionRequiredProps {
  title?: string;
  description?: string;
  features?: string[];
  onGetSubscription?: () => void;
  projectStats?: ProjectStats;
  vendorStats?: VendorStats;
  workerStats?: WorkerStats;
}

export function SubscriptionRequired({
  title = "Subscription Required",
  description = "You need an active subscription to access this feature.",
  onGetSubscription,
  projectStats,
  vendorStats,
  workerStats,
}: SubscriptionRequiredProps) {
  const router = useRouter();
  const { groupedPlan, loading: subscriptionLoading } = useSubscription();

  const handleGetSubscription = () => {
    if (onGetSubscription) {
      onGetSubscription();
    } else {
      router.push("/subscription-plans");
    }
  };

  const handlePlanSelect = () => {
    router.push("/subscription-plans");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-8 py-12 text-center border-b border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              {title}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Project Stats */}
            {projectStats && (
              <div className="mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {projectStats.total}
                  </p>
                  <p className="text-lg text-gray-600">Projects Available</p>
                </div>
              </div>
            )}

            {/* Vendor Stats */}
            {vendorStats && (
              <div className="mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {vendorStats.total_vendors}
                  </p>
                  <p className="text-lg text-gray-600">Vendors Available</p>
                </div>
              </div>
            )}

            {/* Worker Stats */}
            {workerStats && (
              <div className="mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {workerStats.total}
                  </p>
                  <p className="text-lg text-gray-600">Workers Available</p>
                </div>
              </div>
            )}

            {/* Subscription Plans */}
            {!subscriptionLoading && groupedPlan && (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6 text-center">
                  Choose Your Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groupedPlan.monthly && (
                    <SubscriptionPlanCard
                      plan={groupedPlan.monthly}
                      onSelect={handlePlanSelect}
                      isPopular={false}
                    />
                  )}
                  {groupedPlan.yearly && (
                    <SubscriptionPlanCard
                      plan={groupedPlan.yearly}
                      onSelect={handlePlanSelect}
                      isPopular={true}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Fallback CTA */}
            {subscriptionLoading && (
              <div className="text-center">
                <button
                  onClick={handleGetSubscription}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Get Subscription
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Cancel anytime • No hidden fees
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
