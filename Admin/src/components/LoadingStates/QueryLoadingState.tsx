import React from "react";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import Spinner from "../Loader/Spinner/Spinner";
import { cn } from "@/utils/cn";

interface QueryLoadingStateProps {
  query:
    | UseQueryResult<unknown, unknown>
    | UseMutationResult<unknown, unknown, unknown>;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
}

export const QueryLoadingState: React.FC<QueryLoadingStateProps> = ({
  query,
  children,
  loadingComponent,
  errorComponent,
  className,
}) => {
  const isLoading = "isLoading" in query ? query.isLoading : query.isPending;
  const isError = query.isError;
  const error = query.error;
  const refetch = "refetch" in query ? query.refetch : undefined;

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        {loadingComponent || (
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        {errorComponent || (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Something went wrong
            </h3>
            <p className="text-gray-600 max-w-md">
              {(error as unknown as { message: string })?.message ||
                "An unexpected error occurred. Please try again."}
            </p>
            <button
              onClick={() => refetch?.()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show children when data is available
  return <>{children}</>;
};
