import {
  Worker,
  WorkersResponse,
  WorkerFilters,
  WorkerStats,
} from "@/types/worker";
import { authenticatedFetch } from "./auth-api";
import {
  transformWorkerData,
  transformWorkersData,
  RawWorker,
} from "@/utils/workerTransformers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function fetchWorkers(
  filters: WorkerFilters = {}
): Promise<WorkersResponse> {
  const searchParams = new URLSearchParams();

  // Add filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/public/workers?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch workers: ${response.statusText}`);
  }

  const rawResponse = await response.json();

  // Transform the raw workers data
  if (rawResponse.data?.workers) {
    rawResponse.data.workers = transformWorkersData(
      rawResponse.data.workers as RawWorker[]
    );
  }

  return rawResponse;
}

export async function fetchWorkerById(id: number): Promise<{
  success: boolean;
  message: string;
  data: Worker;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/public/workers/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker: ${response.statusText}`);
  }

  const rawResponse = await response.json();

  // Transform the raw worker data and flatten the structure
  if (rawResponse.data?.worker) {
    console.log("Raw worker data:", rawResponse.data.worker);
    const transformedWorker = transformWorkerData(
      rawResponse.data.worker as RawWorker
    );
    console.log("Transformed worker data:", transformedWorker);
    // Flatten the structure: data.worker -> data
    rawResponse.data = transformedWorker;
  }

  return rawResponse;
}

export async function searchWorkers(
  query: string,
  filters: WorkerFilters = {}
): Promise<WorkersResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);

  // Add additional filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/public/workers/search?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search workers: ${response.statusText}`);
  }

  const rawResponse = await response.json();

  // Transform the raw workers data
  if (rawResponse.data?.workers) {
    rawResponse.data.workers = transformWorkersData(
      rawResponse.data.workers as RawWorker[]
    );
  }

  return rawResponse;
}

export async function fetchWorkersByType(
  workerType: string,
  filters: WorkerFilters = {}
): Promise<WorkersResponse> {
  const searchParams = new URLSearchParams();

  // Add filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/public/workers/type/${workerType}?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch workers by type: ${response.statusText}`);
  }

  const rawResponse = await response.json();

  // Transform the raw workers data
  if (rawResponse.data?.workers) {
    rawResponse.data.workers = transformWorkersData(
      rawResponse.data.workers as RawWorker[]
    );
  }

  return rawResponse;
}

export async function fetchWorkerStats(): Promise<{
  success: boolean;
  message: string;
  data: WorkerStats;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/workers/stats`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker stats: ${response.statusText}`);
  }

  return response.json();
}
