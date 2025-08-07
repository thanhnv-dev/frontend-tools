import { apiClient } from "../../../../lib/api";

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  appId?: string;
  userId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Log {
  _id: string;
  reasonList: string[];
  userId?: string;
  version?: string;
  isSuccess: boolean;
  deviceInfo?: {
    id?: string;
    info?: string;
  };
  customData?: Record<string, any>;
  appId?: string;
  app?: {
    _id: string;
    appId: string;
    name: string;
    platform: string;
  };
  createdAt: string;
  updatedAt: string;
  deviceInfoString?: string;
  customDataString?: string;
  appString?: string;
  reasonListString?: string;
  env?: string;
}

export interface CreateLogData {
  reasonList?: string[];
  userId?: string;
  version?: string;
  isSuccess?: boolean;
  deviceInfo?: {
    id?: string;
    info?: string;
  };
  customData?: Record<string, any>;
  appId?: string;
}

export interface UpdateLogData {
  reasonList?: string[];
  userId?: string;
  version?: string;
  isSuccess?: boolean;
  deviceInfo?: {
    id?: string;
    info?: string;
  };
  customData?: Record<string, any>;
  appId?: string;
}

// API endpoints
const API_ENDPOINTS = {
  LOGS: "/logs",
  LOG_BY_ID: (id: string) => `/logs/${id}`,
};

// Build query string from pagination parameters
const buildQueryString = (params: PaginationQuery): string => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.appId) queryParams.append("appId", params.appId);
  if (params.userId) queryParams.append("userId", params.userId);

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const logsApi = {
  // Get logs with pagination
  getPaginated: async (
    query: PaginationQuery = {}
  ): Promise<PaginatedResponse<Log>> => {
    const queryString = buildQueryString(query);
    const response = await apiClient.get<PaginatedResponse<Log>>(
      `${API_ENDPOINTS.LOGS}${queryString}`
    );
    return response.data;
  },

  // Get all logs (deprecated - use getPaginated instead)
  getAll: async (): Promise<Log[]> => {
    // For backward compatibility, fetch a large page
    const response = await apiClient.get<PaginatedResponse<Log>>(
      `${API_ENDPOINTS.LOGS}?limit=1000`
    );
    return response.data.data;
  },

  // Get logs by app ID
  getByAppId: async (
    appId: string,
    query: Omit<PaginationQuery, "appId"> = {}
  ): Promise<PaginatedResponse<Log>> => {
    const fullQuery = { ...query, appId };
    return logsApi.getPaginated(fullQuery);
  },

  // Get logs by user ID
  getByUserId: async (
    userId: string,
    query: Omit<PaginationQuery, "userId"> = {}
  ): Promise<PaginatedResponse<Log>> => {
    const fullQuery = { ...query, userId };
    return logsApi.getPaginated(fullQuery);
  },

  // Get log by ID
  getById: async (id: string): Promise<Log> => {
    const response = await apiClient.get<Log>(API_ENDPOINTS.LOG_BY_ID(id));
    return response.data;
  },

  // Create new log
  create: async (logData: CreateLogData): Promise<Log> => {
    const response = await apiClient.post<Log>(API_ENDPOINTS.LOGS, logData);
    return response.data;
  },

  // Update log
  update: async (id: string, logData: UpdateLogData): Promise<Log> => {
    const response = await apiClient.patch<Log>(
      API_ENDPOINTS.LOG_BY_ID(id),
      logData
    );
    return response.data;
  },

  // Delete log
  delete: async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.LOG_BY_ID(id));
  },
};
