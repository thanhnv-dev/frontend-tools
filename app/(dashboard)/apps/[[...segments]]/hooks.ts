"use client";
import { DataModel, DataSource, DataSourceCache } from "@toolpad/core/Crud";
import { z } from "zod";
import { appsApi } from "./appApi";

type Platform = "ios" | "android" | "web";

export interface App extends DataModel {
  id: string;
  appId: string;
  name: string;
  platform: Platform;
  createdAt: string;
  updatedAt: string;
}

export const appsDataSource: DataSource<App> = {
  fields: [
    { field: "id", headerName: "ID", width: 230 },
    { field: "appId", headerName: "App ID", width: 160 },
    { field: "name", headerName: "App Name", width: 130 },
    {
      field: "platform",
      headerName: "Platform",
      type: "singleSelect",
      valueOptions: ["ios", "android", "web"],
      valueGetter: (value) => String(value).toLocaleUpperCase(),
      width: 120,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      type: "dateTime",
      valueGetter: (value) => value && new Date(value),
      width: 180,
      editable: false,
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      type: "dateTime",
      valueGetter: (value) => value && new Date(value),
      width: 180,
      editable: false,
    },
  ],
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    try {
      const apps = await appsApi.getAll();

      // Transform _id to id for frontend compatibility
      const transformedApps = apps.map((app: any) => ({
        ...app,
        id: app._id,
      }));

      // Apply client-side pagination and filtering since backend doesn't support it yet
      let filteredApps = [...transformedApps];

      // Apply filters
      if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
          if (!field || value == null) {
            return;
          }

          filteredApps = filteredApps.filter((app) => {
            const appValue = app[field];

            switch (operator) {
              case "contains":
                return String(appValue)
                  .toLowerCase()
                  .includes(String(value).toLowerCase());
              case "not":
                return appValue !== value;
              case "is":
              case "equals":
                return appValue === value;
              case "startsWith":
                return String(appValue)
                  .toLowerCase()
                  .startsWith(String(value).toLowerCase());
              case "endsWith":
                return String(appValue)
                  .toLowerCase()
                  .endsWith(String(value).toLowerCase());
              default:
                return true;
            }
          });
        });
      }

      // Apply sorting
      if (sortModel?.length) {
        const { field, sort } = sortModel[0];
        filteredApps.sort((a, b) => {
          const aValue = a[field];
          const bValue = b[field];

          if (sort === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      // Apply pagination
      const start = paginationModel.page * paginationModel.pageSize;
      const end = start + paginationModel.pageSize;
      const paginatedApps = filteredApps.slice(start, end);

      return {
        items: paginatedApps,
        itemCount: filteredApps.length,
      };
    } catch (error) {
      console.error("Error fetching apps:", error);
      throw error;
    }
  },
  getOne: async (appId) => {
    try {
      const app = await appsApi.getById(appId as string);
      return {
        ...app,
        id: app._id,
      };
    } catch (error) {
      console.error("Error fetching app:", error);
      throw error;
    }
  },
  createOne: async (data) => {
    try {
      const appData = {
        appId: data.appId!,
        name: data.name!,
        platform: data.platform! as "ios" | "android" | "web",
      };
      const app = await appsApi.create(appData);
      return {
        ...app,
        id: app._id,
      };
    } catch (error) {
      console.error("Error creating app:", error);
      throw error;
    }
  },
  updateOne: async (appId, data) => {
    try {
      const app = await appsApi.update(appId as string, {
        appId: data.appId,
        name: data.name,
        platform: data.platform,
      });
      return {
        ...app,
        id: app._id,
      };
    } catch (error) {
      console.error("Error updating app:", error);
      throw error;
    }
  },
  deleteOne: async (appId) => {
    try {
      await appsApi.delete(appId as string);
      // Return void as expected by the interface
    } catch (error) {
      console.error("Error deleting app:", error);
      throw error;
    }
  },
  validate: z.object({
    appId: z
      .string({ required_error: "App ID is required" })
      .nonempty("App ID is required"),
    name: z
      .string({ required_error: "App name is required" })
      .nonempty("App name is required"),
    platform: z.enum(["ios", "android", "web"], {
      errorMap: () => ({
        message: 'Platform must be "ios", "android" or "web"',
      }),
    }),
  })["~standard"].validate,
};

export const appsCache = new DataSourceCache();
