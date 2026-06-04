/**
 * Convex client stub — replaced by local file-based storage.
 * Keeps the same export interface so API routes need minimal changes.
 */

export function getConvexClient() {
  return null;
}

export async function getAuthenticatedConvexClient() {
  return null;
}

export function isConvexConfigured(): boolean {
  // Always "configured" — storage is local files
  return true;
}

export const api = {} as any;
