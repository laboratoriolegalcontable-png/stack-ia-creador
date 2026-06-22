/**
 * MCP Resolver — local registry version (Convex removed)
 */
import { getEnabledMCPServers, getMCPServerById } from '@/lib/mcp/mcp-registry';

export async function resolveMCPServers(serverIds: string[]): Promise<any[]> {
  if (!serverIds || serverIds.length === 0) return [];

  // Handle legacy format (full config objects instead of IDs)
  if (typeof serverIds[0] === 'object') return serverIds;

  const all = getEnabledMCPServers();
  return serverIds
    .map(id => all.find((s: any) => s._id === id || s.id === id || s.name === id))
    .filter(Boolean)
    .map((s: any) => ({
      name: s.name,
      url: s.url,
      description: s.description,
      authType: s.authType || 'none',
      availableTools: s.tools || [],
    }));
}

export async function resolveMCPServer(serverId: string): Promise<any | null> {
  if (!serverId) return null;
  const server = getMCPServerById(serverId);
  if (!server) return null;
  return {
    name: server.name,
    url: server.url,
    description: server.description,
    authType: server.authType || 'none',
    availableTools: server.tools || [],
  };
}

export function migrateMCPData(data: any): any {
  return data;
}
