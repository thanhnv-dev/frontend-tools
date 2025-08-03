"use client";
import * as React from "react";
import { Crud } from "@toolpad/core/Crud";
import { useParams } from "next/navigation";
import { appsDataSource, App, appsCache } from "../../../mocks/apps";
import CustomDataGrid from "@/app/components/CustomDataGrid";

export default function LogsCrudPage() {
  const params = useParams();
  const [logId] = params.segments ?? [];

  return (
    <Crud<App>
      dataSource={appsDataSource}
      dataSourceCache={appsCache}
      rootPath="/apps"
      initialPageSize={20}
      defaultValues={{ title: "New App" }}
      pageTitles={{
        show: `Log ${logId}`,
        edit: `Log ${logId} - Edit`,
      }}
      slots={{
        list: {
          dataGrid: CustomDataGrid,
        },
      }}
    />
  );
}
