import axios, { AxiosInstance } from 'axios';

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  const apiKey = process.env.NEXT_PUBLIC_X_API_KEY || '123';

  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add any additional request processing here
      console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      throw new Error(error.message || 'Request failed');
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
        console.error('API Error:', error.response.status, error.response.data);
        
        switch (error.response.status) {
          case 401:
            console.error('Unauthorized: Invalid API key');
            break;
          case 404:
            console.error('Resource not found');
            break;
          case 409:
            console.error('Conflict: Resource already exists');
            break;
          case 500:
            console.error('Internal server error');
            break;
          default:
            console.error('Unexpected error occurred');
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.message);
      } else {
        // Other error
        console.error('Error:', error.message);
      }
      
      throw new Error(error.response?.data?.message || error.message || 'API request failed');
    }
  );

  return instance;
};

// Create the API client instance
export const apiClient = createApiClient();

// API endpoint configurations
export const API_ENDPOINTS = {
  APPS: '/apps',
  APP_BY_ID: (id: string) => `/apps/${id}`,
};

// API methods for apps
export const appsApi = {
  // Get all apps
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.APPS);
    return response.data;
  },

  // Get app by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.APP_BY_ID(id));
    return response.data;
  },

  // Create new app
  create: async (appData: { appId: string; name: string; platform: 'ios' | 'android' | 'web' }) => {
    const response = await apiClient.post(API_ENDPOINTS.APPS, appData);
    return response.data;
  },

  // Update app
  update: async (id: string, appData: Partial<{ appId: string; name: string; platform: 'ios' | 'android' | 'web' }>) => {
    const response = await apiClient.patch(API_ENDPOINTS.APP_BY_ID(id), appData);
    return response.data;
  },

  // Delete app
  delete: async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.APP_BY_ID(id));
  },
};

export default apiClient;
