/**
 * API Authentication — open/single-user mode (no Clerk required).
 * All requests are considered authenticated as the local user.
 */
import { NextRequest } from 'next/server';

export interface ApiAuthResult {
  authenticated: boolean;
  userId?: string;
  error?: string;
  authType?: 'clerk' | 'api-key';
}

export async function validateApiKey(_request: NextRequest): Promise<ApiAuthResult> {
  return { authenticated: true, userId: 'local-user', authType: 'clerk' };
}

export function createUnauthorizedResponse(error: string) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized', message: error }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}
