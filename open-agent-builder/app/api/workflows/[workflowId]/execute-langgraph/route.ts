import { NextRequest, NextResponse } from 'next/server';
import { LangGraphExecutor } from '@/lib/workflow/langgraph';
import { getWorkflow } from '@/lib/workflow/storage';
import { getServerAPIKeys } from '@/lib/api/config';
import { validateApiKey } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const authResult = await validateApiKey(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || 'Authentication required' }, { status: 401 });
    }

    const { workflowId } = await params;
    const body = await request.json();
    const { input, threadId } = body;

    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const { getLLMApiKey } = await import('@/lib/api/llm-keys');
    const userId = authResult.userId;

    const apiKeys = {
      anthropic: await getLLMApiKey('anthropic', userId) || undefined,
      groq: await getLLMApiKey('groq', userId) || undefined,
      openai: await getLLMApiKey('openai', userId) || undefined,
      firecrawl: process.env.FIRECRAWL_API_KEY,
      arcade: process.env.ARCADE_API_KEY,
    };

    const executor = new LangGraphExecutor(workflow, undefined, apiKeys || undefined);
    const result = await executor.execute(input, { threadId });

    return NextResponse.json({
      success: true,
      executionId: result.id,
      status: result.status,
      nodeResults: result.nodeResults,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
    });
  } catch (error) {
    console.error('LangGraph execution error:', error);
    return NextResponse.json({ error: 'Workflow execution failed', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
