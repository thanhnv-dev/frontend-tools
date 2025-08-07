"use client";
import * as React from "react";
import { DataSourceCache, List, Show } from "@toolpad/core/Crud";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useLogsData, LogWithId } from "./hooks";

export default function LogsCrudPage() {
  const logsCache = new DataSourceCache();
  const { status, data, update } = useSession();
  const user = data?.user;
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const params = useParams();
  const router = useRouter();
  const [logId] = params.segments ?? [];

  const logsDataSource = useLogsData(isAdmin);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      update();
    }
  }, [status, update]);

  const loading = status === "loading";

  const handleRowClick = React.useCallback(
    (logId: string | number) => {
      router.push(`/logs/${logId}`);
    },
    [router]
  );

  const handleCreateClick = React.useCallback(() => {
    console.log("Create click");
  }, []);

  const handleEditClick = React.useCallback((logId: string | number) => {
    console.log(`Edit click with id ${logId}`);
  }, []);

  const handleDelete = React.useCallback((logId: string | number) => {
    console.log(`Log with id ${logId} deleted`);
  }, []);

  // Show loading while session is being fetched
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {logId ? (
        <Show<LogWithId>
          id={logId}
          dataSource={logsDataSource as any}
          dataSourceCache={logsCache}
          onDelete={isAdmin ? handleDelete : undefined}
          pageTitle={`Log ${logId}`}
        />
      ) : (
        <List<LogWithId>
          dataSource={logsDataSource as any}
          dataSourceCache={logsCache}
          initialPageSize={25}
          onRowClick={handleRowClick}
          onCreateClick={isAdmin ? handleCreateClick : undefined}
          onEditClick={isAdmin ? handleEditClick : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      )}
    </>
  );
}
