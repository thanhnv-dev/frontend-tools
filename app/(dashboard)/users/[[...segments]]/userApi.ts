import apiClient, { API_ENDPOINTS } from "@/lib/api";

export const userApi = {
  // Get all users
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS);
    return response.data;
  },

  // Get user by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.USER_BY_ID(id));
    return response.data;
  },

  // Create new user
  create: async (userData: {
    email: string;
    password: string;
    role: "user" | "admin";
  }) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS, userData);
    return response.data;
  },

  // Update user
  update: async (
    id: string,
    userData: Partial<{
      email: string;
      password: string;
      role: "user" | "admin";
    }>
  ) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.USER_BY_ID(id),
      userData
    );
    return response.data;
  },

  // Delete user
  delete: async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.USER_BY_ID(id));
  },
};
