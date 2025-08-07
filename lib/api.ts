import axios, { AxiosInstance } from "axios";

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const apiKey = process.env.NEXT_PUBLIC_X_API_KEY;

  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add any additional request processing here
      console.log(
        `Making ${config.method?.toUpperCase()} request to ${config.url}`
      );
      return config;
    },
    (error) => {
      console.error("Request error:", error);
      throw new Error(error.message || "Request failed");
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      // Handle successful responses
      return response;
    },
    (error) => {
      // Handle errors globally
      if (error.response) {
        // Server responded with error status
        console.error("API Error:", error.response.status, error.response.data);

        switch (error.response.status) {
          case 401:
            console.error("Unauthorized: Invalid API key");
            break;
          case 404:
            console.error("Resource not found");
            break;
          case 409:
            console.error("Conflict: Resource already exists");
            break;
          case 500:
            console.error("Internal server error");
            break;
          default:
            console.error("Unexpected error occurred");
        }
      } else if (error.request) {
        // Network error
        console.error("Network error:", error.message);
      } else {
        // Other error
        console.error("Error:", error.message);
      }

      throw new Error(
        error.response?.data?.message || error.message || "API request failed"
      );
    }
  );

  return instance;
};

// Create the API client instance
export const apiClient = createApiClient();

// API endpoint configurations
export const API_ENDPOINTS = {
  APPS: "/apps",
  APP_BY_ID: (id: string) => `/apps/${id}`,
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,
  AUTH_LOGIN: "/auth/login",
};

export default apiClient;
