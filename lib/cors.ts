import { NextRequest, NextResponse } from 'next/server';

export function corsMiddleware(req: NextRequest) {
  // Handle CORS
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-api-key, Accept, Origin, X-Requested-With'
  );
  
  return response;
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, Accept, Origin, X-Requested-With',
    },
  });
}
