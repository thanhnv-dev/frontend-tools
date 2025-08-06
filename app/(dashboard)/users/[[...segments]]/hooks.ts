"use client";
import { DataModel, DataSource, DataSourceCache } from "@toolpad/core/Crud";
import { z } from "zod";
import { userApi } from "./userApi";

type Role = "user" | "admin";

export interface User extends DataModel {
  id: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export const usersDataSource: DataSource<User> = {
  fields: [
    { field: "id", headerName: "ID", width: 230 },
    { field: "email", headerName: "Email", width: 160, hideSortIcons: true },
    {
      field: "password",
      headerName: "Password",
      renderCell: () => "******",
      width: 180,
      hideSortIcons: true,
    },
    {
      field: "role",
      headerName: "Role",
      type: "singleSelect",
      valueOptions: ["user", "admin"],
      valueGetter: (value) => String(value).toLocaleUpperCase(),
      width: 120,
      hideSortIcons: true,
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
      const apps = await userApi.getAll();

      // Transform _id to id for frontend compatibility và set password empty cho security
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
      console.log("paginatedApps:", paginatedApps);

      return {
        items: paginatedApps,
        itemCount: filteredApps.length,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
  getOne: async (userId) => {
    try {
      const user = await userApi.getById(userId as string);
      return {
        ...user,
        id: user._id,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },
  createOne: async (data) => {
    try {
      // Validate password is required for creation
      if (!data.password || data.password.trim() === "") {
        throw new Error("Password is required for creating a new user");
      }

      const userData = {
        email: data.email!,
        password: data.password!,
        role: data.role! as "user" | "admin",
      };
      const user = await userApi.create(userData);
      return {
        ...user,
        id: user._id,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  updateOne: async (userId, data) => {
    console.log("Updating user:", userId, data);
    try {
      const updateData: any = {};

      if (data.email) {
        updateData.email = data.email;
      }

      if (data.role) {
        updateData.role = data.role;
      }

      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      const user = await userApi.update(userId as string, updateData);
      return {
        ...user,
        id: user._id,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
  deleteOne: async (userId) => {
    try {
      await userApi.delete(userId as string);
      // Return void as expected by the interface
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
  validate: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .nonempty("Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password must be at most 100 characters long")
      .nonempty("Email is required"),
    // .optional(),
    // .or(z.literal("")),
    role: z.enum(["user", "admin"], {
      errorMap: () => ({
        message: 'Role must be "user" or "admin"',
      }),
    }),
    id: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })["~standard"].validate,
};

export const usersCache = new DataSourceCache();
