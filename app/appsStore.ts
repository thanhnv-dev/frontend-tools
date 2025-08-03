import type { App } from "./mocks/apps";

let apps: App[] = [];

export const getAppsStore = () => apps;

export const setAppsStore = (newApps: App[]) => {
  apps = newApps;
};
