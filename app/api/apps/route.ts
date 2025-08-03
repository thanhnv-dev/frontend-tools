import { NextRequest, NextResponse } from 'next/server';
import { getAppsStore, setAppsStore } from '../../appsStore';
import type { App } from '../../mocks/apps';
import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import type { OmitId } from '@toolpad/core/Crud';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page: GridPaginationModel['page'] = Number(searchParams.get('page')) || 0;
  const pageSize: GridPaginationModel['pageSize'] = Number(searchParams.get('pageSize')) || 10;
  const sortModel: GridSortModel = searchParams.get('sort')
    ? JSON.parse(searchParams.get('sort')!)
    : [];
  const filterModel: GridFilterModel = searchParams.get('filter')
    ? JSON.parse(searchParams.get('filter')!)
    : [];

  const appsStore = getAppsStore();

  let filteredApps = [...appsStore];

  // Apply filters (example only)
  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, value, operator }) => {
      if (!field || value == null) {
        return;
      }

      filteredApps = filteredApps.filter((app) => {
        const appValue = app[field as keyof App];

        switch (operator) {
          case 'contains':
            return String(appValue).toLowerCase().includes(String(value).toLowerCase());
          case 'equals':
            return appValue === value;
          case 'startsWith':
            return String(appValue).toLowerCase().startsWith(String(value).toLowerCase());
          case 'endsWith':
            return String(appValue).toLowerCase().endsWith(String(value).toLowerCase());
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
      let aValue = a[field as keyof App];
      let bValue = b[field as keyof App];

      // Handle dates specifically
      if (field === 'createdAt' || field === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if ((aValue as number | string) < (bValue as number | string)) {
        return sort === 'asc' ? -1 : 1;
      }
      if ((aValue as number | string) > (bValue as number | string)) {
        return sort === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Apply pagination
  const start = page * pageSize;
  const paginatedApps = filteredApps.slice(start, start + pageSize);

  return NextResponse.json({
    items: paginatedApps,
    itemCount: filteredApps.length,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as OmitId<App>;

  const appsStore = getAppsStore();
  const newApp: App = {
    ...body,
    id: (appsStore.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedApps = [...appsStore, newApp];
  setAppsStore(updatedApps);

  return NextResponse.json(newApp, { status: 201 });
}
