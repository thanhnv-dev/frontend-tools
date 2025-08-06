import apiClient, { API_ENDPOINTS } from "@/lib/api";

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
  create: async (appData: {
    appId: string;
    name: string;
    platform: "ios" | "android" | "web";
  }) => {
    const response = await apiClient.post(API_ENDPOINTS.APPS, appData);
    return response.data;
  },

  // Update app
  update: async (
    id: string,
    appData: Partial<{
      appId: string;
      name: string;
      platform: "ios" | "android" | "web";
    }>
  ) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.APP_BY_ID(id),
      appData
    );
    return response.data;
  },

  // Delete app
  delete: async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.APP_BY_ID(id));
  },
};
