"use client";
import * as React from "react";
import { Crud } from "@toolpad/core/Crud";
import { useParams } from "next/navigation";
import CustomDataGrid from "@/app/components/CustomDataGrid";
import { User, usersCache, usersDataSource } from "./hooks";

export default function UsersCrudPage() {
  const params = useParams();
  const [userId] = params.segments ?? [];

  return (
    <Crud<User>
      dataSource={usersDataSource}
      dataSourceCache={usersCache}
      rootPath="/users"
      initialPageSize={20}
      defaultValues={{ title: "User" }}
      pageTitles={{
        show: `User ${userId}`,
        create: "New User",
        edit: `User ${userId} - Edit`,
      }}
      slots={{
        list: {
          dataGrid: CustomDataGrid,
        },
      }}
    />
  );
}
