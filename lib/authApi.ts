import axios from "axios";

const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = {
  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await authClient.post("/auth/login", credentials);
    return response.data;
  },
};
