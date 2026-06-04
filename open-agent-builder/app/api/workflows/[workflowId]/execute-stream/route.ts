import { NextRequest } from 'next/server';
import { LangGraphExecutor } from '@/lib/workflow/langgraph';
import { validateApiKey, createUnauthorizedResponse } from '@/lib/api/auth';
import { storage } from '@/lib/local-storage';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const authResult = await validateApiKey(request);
  if (!authResult.authenticated) {
    return createUnauthorizedResponse(authResult.error || 'Authentication required');
  }

  const { workflowId } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        try {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Failed to send SSE event:', error);
        }
      };

      try {
        const body = await request.json();
        const inputs = body || {};

        const workflowDoc = storage.getWorkflow(workflowId);

        if (!workflowDoc) {
          sendEvent('error', { error: `Workflow ${workflowId} not found`, workflowId });
          controller.close();
          return;
        }

        const workflow = { ...workflowDoc, id: workflowDoc.customId || workflowDoc._id } as any;

        sendEvent('workflow_started', {
          workflowId,
          workflowName: workflow.name,
          totalNodes: workflow.nodes.length,
          timestamp: new Date().toISOString(),
        });

        const executionId = `exec_${Date.now()}`;
        const nodeResults: Record<string, any> = {};

        const { getLLMApiKey } = await import('@/lib/api/llm-keys');
        const userId = authResult.userId;

        const apiKeys = {
          anthropic: await getLLMApiKey('anthropic', userId) || undefined,
          groq: await getLLMApiKey('groq', userId) || undefined,
          openai: await getLLMApiKey('openai', userId) || undefined,
          firecrawl: process.env.FIRECRAWL_API_KEY,
          arcade: process.env.ARCADE_API_KEY,
        };

        let initialInput: any = '';
        if (typeof inputs === 'object' && Object.keys(inputs).length > 0) {
          initialInput = inputs.input || inputs;
        } else {
          initialInput = inputs.url || inputs.input || '';
        }

        const threadId = `thread_${workflowId}_${Date.now()}`;

        let executor;
        try {
          executor = new LangGraphExecutor(
            workflow,
            (nodeId, result) => {
              nodeResults[nodeId] = result;
              if (result.status === 'running') {
                const node = workflow.nodes.find((n: any) => n.id === nodeId);
                sendEvent('node_started', { nodeId, nodeName: node?.data?.nodeName || node?.data?.label || nodeId, nodeType: node?.type || 'unknown', timestamp: new Date().toISOString() });
              } else if (result.status === 'completed') {
                const node = workflow.nodes.find((n: any) => n.id === nodeId);
                sendEvent('node_completed', { nodeId, nodeName: node?.data?.nodeName || node?.data?.label || nodeId, result, timestamp: new Date().toISOString() });
              } else if (result.status === 'failed') {
                const node = workflow.nodes.find((n: any) => n.id === nodeId);
                sendEvent('node_failed', { nodeId, nodeName: node?.data?.nodeName || node?.data?.label || nodeId, error: result.error, timestamp: new Date().toISOString() });
              } else if (result.status === 'pending-authorization' || result.status === 'pending-approval') {
                const node = workflow.nodes.find((n: any) => n.id === nodeId);
                sendEvent('node_paused', { nodeId, nodeName: node?.data?.nodeName || node?.data?.label || nodeId, status: result.status, timestamp: new Date().toISOString() });
              }
            },
            apiKeys
          );
        } catch (graphBuildError) {
          sendEvent('error', { error: graphBuildError instanceof Error ? graphBuildError.message : 'Graph compilation failed', timestamp: new Date().toISOString() });
          controller.close();
          return;
        }

        const executionStream = await executor.executeStream(initialInput, { threadId, executionId });
        let finalState: any = null;

        try {
          for await (const stateUpdate of executionStream) {
            const mergedState = { ...stateUpdate, nodeResults: { ...stateUpdate.nodeResults, ...nodeResults } };
            finalState = mergedState;
            sendEvent('state_update', { nodeResults: mergedState.nodeResults, currentNodeId: mergedState.currentNodeId, pendingAuth: mergedState.pendingAuth, timestamp: new Date().toISOString() });
            if (mergedState.pendingAuth) {
              sendEvent('workflow_paused', { reason: 'pending_authorization', pendingAuth: mergedState.pendingAuth, executionId, threadId, timestamp: new Date().toISOString() });
              controller.close();
              return;
            }
          }
        } catch (streamError) {
          sendEvent('error', { error: streamError instanceof Error ? streamError.message : 'Stream error', timestamp: new Date().toISOString() });
          controller.close();
          return;
        }

        sendEvent('workflow_completed', { workflowId, executionId, results: finalState?.nodeResults || {}, status: finalState?.pendingAuth ? 'waiting-auth' : 'completed', timestamp: new Date().toISOString() });
        controller.close();
      } catch (error) {
        sendEvent('error', { error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
