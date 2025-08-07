import * as React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { DataSource, DataModel } from "@toolpad/core/Crud";
import { logsApi, Log } from "./logApi";

export interface LogWithId extends Log, DataModel {
  id: string;
  [key: string]: any;
}

export const useLogsData = (isAdmin: boolean) => {
  const dataSource: DataSource<LogWithId> = {
    fields: [
      {
        field: "createdAt",
        headerName: "Created At",
        type: "dateTime",
        valueGetter: (value) => value && new Date(value),
        width: 180,
        editable: false,
      },
      {
        field: "userId",
        headerName: "User ID",
        width: 120,
        editable: true,
        hideSortIcons: false,
        sortable: false,
      },
      {
        field: "deviceInfoString",
        headerName: "Device Info",
        width: 200,
        editable: true,
        hideSortIcons: false,
        sortable: false,
        type: "string",
      },
      {
        field: "version",
        headerName: "Version",
        width: 120,
        editable: true,
        hideSortIcons: false,
        sortable: false,
      },
      {
        field: "isSuccess",
        headerName: "Status",
        width: 120,
        editable: true,
        hideSortIcons: false,
        sortable: false,
        type: "singleSelect",
        valueOptions: [
          { value: true, label: "Success" },
          { value: false, label: "Failed" },
        ],
        renderCell: (params) => {
          const isSuccess = params.value;
          return React.createElement(
            "span",
            {
              style: {
                color: isSuccess ? "#2e7d32" : "#d32f2f",
                fontWeight: "bold",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: isSuccess ? "#e8f5e8" : "#fde8e8",
                fontSize: "0.875rem",
              },
            },
            isSuccess ? "Success" : "Failed"
          );
        },
      },
      {
        field: "appString",
        headerName: "App",
        width: 200,
        editable: false,
        hideSortIcons: false,
        sortable: false,
        renderCell: (params) => {
          const app = params.row.app;
          if (app) {
            return `${app.name} (${app.platform})`;
          }
          return params.row.appId || "N/A";
        },
      },
      {
        field: "env",
        headerName: "ENV",
        width: 120,
        editable: false,
        hideSortIcons: false,
        sortable: false,
      },
      {
        field: "reasonListString",
        headerName: "Reasons",
        width: 300,
        editable: true,
        hideSortIcons: false,
        sortable: false,
        type: "string",
      },
      {
        field: "customDataString",
        headerName: "Custom Data",
        width: 200,
        editable: true,
        hideSortIcons: false,
        sortable: false,
      },
      {
        field: "updatedAt",
        headerName: "Updated At",
        type: "dateTime",
        valueGetter: (value) => value && new Date(value),
        width: 180,
        editable: false,
      },
      {
        field: "id",
        headerName: "ID",
        width: 100,
        editable: false,
        hideSortIcons: false,
        sortable: false,
      },
    ] as GridColDef[],

    getMany: async ({ paginationModel, filterModel, sortModel }) => {
      try {
        // Build pagination query from frontend parameters
        const query: any = {
          page: paginationModel.page + 1, // Backend uses 1-based pagination
          limit: paginationModel.pageSize,
        };

        // Apply sorting
        if (sortModel?.length) {
          const { field, sort } = sortModel[0];
          query.sortBy = field;
          query.sortOrder = sort;
        }

        // Get paginated data from server
        const result = await logsApi.getPaginated(query);

        // Transform _id to id for frontend compatibility
        let transformedLogs = result.data.map((log: any) => ({
          ...log,
          id: log._id,
          deviceInfoString: `${log?.deviceInfo?.info || ""} (${
            log?.deviceInfo?.id || ""
          })`.trim(),
          customDataString: log.customData
            ? JSON.stringify(log.customData)
            : "",
          reasonListString: log.reasonList.join(" --> "),
          appString: log.app ? JSON.stringify(log.app) : "",
          env: String(log.customData?.env).toLocaleUpperCase() || "N/A",
        }));

        if (filterModel?.items?.length) {
          filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
              return {
                items: transformedLogs,
                itemCount: result.pagination.total,
              };
            }

            transformedLogs = transformedLogs.filter((log) => {
              const logValue = log[field];
              console.log("operator", operator);

              switch (operator) {
                case "contains":
                  return String(logValue)
                    .toLowerCase()
                    .includes(String(value).toLowerCase());
                case "not":
                  return logValue !== value;
                case "is":
                case "equals":
                  return logValue === value;
                case "startsWith":
                  return String(logValue)
                    .toLowerCase()
                    .startsWith(String(value).toLowerCase());
                case "endsWith":
                  return String(logValue)
                    .toLowerCase()
                    .endsWith(String(value).toLowerCase());
                case ">":
                  return (logValue as number) > value;
                case "<":
                  return (logValue as number) < value;
                default:
                  return true;
              }
            });
          });
        }

        return {
          items: transformedLogs,
          itemCount: result.pagination.total,
        };
      } catch (error) {
        console.error("Error fetching logs:", error);
        throw error;
      }
    },

    getOne: async (logId) => {
      try {
        const log = await logsApi.getById(logId as string);
        return {
          ...log,
          id: log._id,
          deviceInfoString: `${log?.deviceInfo?.info || ""} (${
            log?.deviceInfo?.id || ""
          })`.trim(),
          customDataString: log.customData
            ? JSON.stringify(log.customData)
            : "",
          reasonListString: log.reasonList.join(" --> "),
          appString: log.app ? JSON.stringify(log.app) : "",
          env: String(log.customData?.env).toLocaleUpperCase() || "N/A",
        };
      } catch (error) {
        console.error("Error fetching log:", error);
        throw error;
      }
    },

    createOne: async (data) => {
      try {
        let reasonList: string[] = [];
        if (Array.isArray(data.reasonList)) {
          reasonList = data.reasonList;
        } else if (data.reasonList) {
          reasonList = [data.reasonList as string];
        }

        const logData = {
          reasonList,
          userId: data.userId,
          version: data.version,
          isSuccess: Boolean(data.isSuccess),
          appId: data.appId,
          deviceInfo: data.deviceInfo,
          customData: data.customData,
        };
        const log = await logsApi.create(logData);
        return {
          ...log,
          id: log._id,
        };
      } catch (error) {
        console.error("Error creating log:", error);
        throw error;
      }
    },

    updateOne: async (logId, data) => {
      try {
        let reasonList: string[] | undefined = undefined;
        if (Array.isArray(data.reasonList)) {
          reasonList = data.reasonList;
        } else if (data.reasonList) {
          reasonList = [data.reasonList as string];
        }

        const logData = {
          reasonList,
          userId: data.userId,
          version: data.version,
          isSuccess:
            data.isSuccess !== undefined ? Boolean(data.isSuccess) : undefined,
          appId: data.appId,
          deviceInfo: data.deviceInfo,
          customData: data.customData,
        };
        const log = await logsApi.update(logId as string, logData);
        return {
          ...log,
          id: log._id,
        };
      } catch (error) {
        console.error("Error updating log:", error);
        throw error;
      }
    },

    deleteOne: isAdmin
      ? async (logId) => {
          try {
            await logsApi.delete(logId as string);
          } catch (error) {
            console.error("Error deleting log:", error);
            throw error;
          }
        }
      : undefined,
  };

  return dataSource;
};
