import { NextRequest, NextResponse } from 'next/server';
import { getAppsStore, setAppsStore } from '../../../appsStore';
import type { App } from '../../../mocks/apps';
import type { OmitId } from '@toolpad/core/Crud';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const appsStore = getAppsStore();
  const app = appsStore.find((app) => app.id === id);

  if (!app) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  return NextResponse.json(app);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const body = (await req.json()) as OmitId<App>;

  const appsStore = getAppsStore();
  const appIndex = appsStore.findIndex((app) => app.id === id);

  if (appIndex === -1) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  const updatedApp: App = {
    ...appsStore[appIndex],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  const updatedApps = [...appsStore];
  updatedApps[appIndex] = updatedApp;
  setAppsStore(updatedApps);

  return NextResponse.json(updatedApp);
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const appsStore = getAppsStore();
  const appIndex = appsStore.findIndex((app) => app.id === id);

  if (appIndex === -1) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  const updatedApps = appsStore.filter((app) => app.id !== id);
  setAppsStore(updatedApps);

  return NextResponse.json({ message: 'App deleted successfully' });
}
