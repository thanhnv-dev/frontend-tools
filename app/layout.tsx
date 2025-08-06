import * as React from "react";
import { NextAppProvider } from "@toolpad/core/nextjs";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewListIcon from "@mui/icons-material/ViewList";
import AppsIcon from "@mui/icons-material/Apps";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Navigation } from "@toolpad/core/AppProvider";
import { SessionProvider, signIn, signOut } from "next-auth/react";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import theme from "../theme";
import { auth } from "../auth";

const AUTHENTICATION = {
  signIn,
  signOut,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const isAdmin = session?.user?.role?.toLocaleLowerCase() === "admin";

  const NAVIGATION: Navigation = [
    {
      kind: "header",
      title: "Main items",
    },
    {
      segment: "logs",
      title: "Logs",
      icon: <ViewListIcon />,
      pattern: "logs{/:logId}*",
    },
  ];

  if (isAdmin) {
    NAVIGATION[2] = NAVIGATION[1];
    NAVIGATION[1] = {
      title: "Dashboard",
      icon: <DashboardIcon />,
    };
    NAVIGATION.push(
      {
        segment: "apps",
        title: "Apps",
        icon: <AppsIcon />,
        pattern: "apps{/:appId}*",
      },
      {
        segment: "users",
        title: "Users",
        icon: <FolderSharedIcon />,
        pattern: "users{/:userId}*",
      }
    );
  }
  return (
    <html lang="en" data-toolpad-color-scheme="light">
      <body>
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <NextAppProvider
              theme={theme}
              navigation={NAVIGATION}
              session={session}
              authentication={AUTHENTICATION}
            >
              {children}
            </NextAppProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
