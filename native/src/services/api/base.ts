import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment (dev or prod)
const EXPO_ENVIRONMENT = process.env.EXPO_ENVIRONMENT || 'dev';

// Select API URL based on environment
const getApiBaseUrl = () => {
  if (EXPO_ENVIRONMENT === 'prod') {
    return process.env.EXPO_PUBLIC_PROD_API_URL || 'http://localhost:8080/api/v1';
  }
  // Default to dev
  return process.env.EXPO_PUBLIC_DEV_API_URL || 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'treesindia_access_token',
  REFRESH_TOKEN: 'treesindia_refresh_token',
} as const;

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper function to handle API responses
export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      // Combine message and error for more detailed error info
      if (errorData.error && errorData.message && errorData.error !== errorData.message) {
        errorMessage = `${errorData.message}: ${errorData.error}`;
      } else {
        errorMessage = errorData.error || errorData.message || errorMessage;
      }
      errorCode = errorData.code;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new APIError(errorMessage, response.status, errorCode);
  }

  const data = await response.json();
  return data.data || data; // Handle both wrapped and unwrapped responses
};

// Token management
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]);
  },

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
  },

  async hasTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return !!(accessToken || refreshToken);
  },
};

// Authenticated fetch helper
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = await tokenStorage.getAccessToken();
  const refreshToken = await tokenStorage.getRefreshToken();

  // If no access token but we have refresh token, try to refresh first
  if (!accessToken && refreshToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const authData = data.data || data;
        if (authData.access_token && authData.refresh_token) {
          await tokenStorage.setTokens(authData.access_token, authData.refresh_token);
          accessToken = authData.access_token;
        }
      }
    } catch {
      await tokenStorage.clearTokens();
    }
  }

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Set Content-Type if not already set and has body
  const method = (options.method || 'GET').toUpperCase();
  const hasBody = options.body !== undefined && options.body !== null;

  if (
    !(options.headers as Record<string, string>)?.['Content-Type'] &&
    !(options.body instanceof FormData) &&
    hasBody &&
    method !== 'GET' &&
    method !== 'HEAD'
  ) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // If we get a 401, try to refresh the token and retry the request
  if (response.status === 401 && (accessToken || refreshToken)) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const authData = refreshData.data || refreshData;
        if (authData.access_token && authData.refresh_token) {
          await tokenStorage.setTokens(authData.access_token, authData.refresh_token);

          // Retry the request with the new token
          (headers as Record<string, string>).Authorization = `Bearer ${authData.access_token}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return retryResponse;
        }
      }
    } catch {
      await tokenStorage.clearTokens();
    }
  }

  return response;
};
