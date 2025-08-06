"use client";
import * as React from "react";
import {
  DataModel,
  DataSource,
  DataSourceCache,
  List,
  Show,
} from "@toolpad/core/Crud";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export interface Person extends DataModel {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

let peopleStore: Person[] = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 6, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 7, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 8, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 10, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 11, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 12, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 13, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 14, lastName: "Roxie", firstName: "Harvey", age: 65 },
];

export default function LogsCrudPage() {
  const peopleCache = new DataSourceCache();
  const { status, data, update } = useSession();
  const user = data?.user;

  React.useEffect(() => {
    if (status === "unauthenticated") {
      update();
    }
  }, [status]);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const loading = status === "loading";

  const params = useParams();
  const router = useRouter();
  const [logId] = params.segments ?? [];

  const handleRowClick = React.useCallback(
    (personId: string | number) => {
      router.push(`/logs/${personId}`);
    },
    [router]
  );

  const handleCreateClick = React.useCallback(() => {
    console.log("Create click");
  }, []);

  const handleEditClick = React.useCallback((personId: string | number) => {
    console.log(`Edit click with id ${personId}`);
  }, []);

  const handleDelete = React.useCallback((personId: string | number) => {
    console.log(`Person with id ${personId} deleted`);
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

  const peopleDataSourceShow: DataSource<Person> &
    Required<Pick<DataSource<Person>, "getOne">> = {
    fields: [
      { field: "id", headerName: "ID" },
      {
        field: "firstName",
        headerName: "First name",
      },
      {
        field: "lastName",
        headerName: "Last name",
      },
      {
        field: "age",
        headerName: "Age",
        type: "number",
      },
    ],
    getOne: async (personId) => {
      // Simulate loading delay
      await new Promise((resolve) => {
        setTimeout(resolve, 750);
      });

      const personToShow = peopleStore.find(
        (person) => person.id === Number(personId)
      );

      if (!personToShow) {
        throw new Error("Person not found");
      }
      return personToShow;
    },
    deleteOne: async (personId) => {
      // Simulate loading delay
      await new Promise((resolve) => {
        setTimeout(resolve, 750);
      });

      peopleStore = peopleStore.filter(
        (person) => person.id !== Number(personId)
      );
    },
  };

  const peopleDataSourceList: DataSource<Person> &
    Required<Pick<DataSource<Person>, "getMany">> = {
    fields: [
      { field: "id", headerName: "ID" },
      {
        field: "firstName",
        headerName: "First name",
      },
      {
        field: "lastName",
        headerName: "Last name",
      },
      {
        field: "age",
        headerName: "Age",
        type: "number",
      },
    ],
    getMany: async ({ paginationModel, filterModel, sortModel }) => {
      // Simulate loading delay
      await new Promise((resolve) => {
        setTimeout(resolve, 750);
      });

      let processedPeople = [...peopleStore];

      // Apply filters (demo only)
      if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
          if (!field || value == null) {
            return;
          }

          processedPeople = processedPeople.filter((person) => {
            const personValue = person[field];

            switch (operator) {
              case "contains":
                return String(personValue)
                  .toLowerCase()
                  .includes(String(value).toLowerCase());
              case "equals":
                return personValue === value;
              case "startsWith":
                return String(personValue)
                  .toLowerCase()
                  .startsWith(String(value).toLowerCase());
              case "endsWith":
                return String(personValue)
                  .toLowerCase()
                  .endsWith(String(value).toLowerCase());
              case ">":
                return (personValue as number) > value;
              case "<":
                return (personValue as number) < value;
              default:
                return true;
            }
          });
        });
      }

      // Apply sorting
      if (sortModel?.length) {
        processedPeople.sort((a, b) => {
          for (const { field, sort } of sortModel) {
            if ((a[field] as number) < (b[field] as number)) {
              return sort === "asc" ? -1 : 1;
            }
            if ((a[field] as number) > (b[field] as number)) {
              return sort === "asc" ? 1 : -1;
            }
          }
          return 0;
        });
      }

      // Apply pagination
      const start = paginationModel.page * paginationModel.pageSize;
      const end = start + paginationModel.pageSize;
      const paginatedPeople = processedPeople.slice(start, end);

      return {
        items: paginatedPeople,
        itemCount: processedPeople.length,
      };
    },
    deleteOne: async (personId) => {
      // Simulate loading delay
      await new Promise((resolve) => {
        setTimeout(resolve, 750);
      });

      peopleStore = peopleStore.filter(
        (person) => person.id !== Number(personId)
      );
    },
  };

  if (!isAdmin) {
    peopleDataSourceShow.deleteOne = undefined;
    peopleDataSourceList.deleteOne = undefined;
  }

  return (
    <>
      {logId ? (
        <Show<Person>
          id={logId}
          dataSource={peopleDataSourceShow}
          dataSourceCache={peopleCache}
          onDelete={isAdmin ? handleDelete : undefined}
          pageTitle={`Log ${logId}`}
        />
      ) : (
        <List<Person>
          dataSource={peopleDataSourceList}
          dataSourceCache={peopleCache}
          initialPageSize={10}
          onRowClick={handleRowClick}
          onCreateClick={isAdmin ? handleCreateClick : undefined}
          onEditClick={isAdmin ? handleEditClick : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      )}
    </>
  );
}
