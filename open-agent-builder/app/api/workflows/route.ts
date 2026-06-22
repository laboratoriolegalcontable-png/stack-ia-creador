import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/local-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const workflows = storage.listWorkflows();
  return NextResponse.json({
    workflows: workflows.map((w: any) => ({
      id: w.customId || w._id,
      name: w.name,
      description: w.description,
      category: w.category,
      tags: w.tags,
      difficulty: w.difficulty,
      estimatedTime: w.estimatedTime,
      nodes: w.nodes,
      edges: w.edges,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      nodeCount: w.nodes?.length || 0,
      edgeCount: w.edges?.length || 0,
      isTemplate: w.isTemplate,
    })),
    total: workflows.length,
    source: 'local',
  });
}

export async function POST(request: NextRequest) {
  let workflow: any;
  try {
    const body = await request.text();
    if (!body?.trim()) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }
    workflow = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (!workflow.id && !workflow.name) {
    return NextResponse.json({ error: 'Workflow must have either id or name' }, { status: 400 });
  }
  if (!Array.isArray(workflow.nodes)) {
    return NextResponse.json({ error: 'Workflow must have a nodes array' }, { status: 400 });
  }
  if (!Array.isArray(workflow.edges)) {
    return NextResponse.json({ error: 'Workflow must have an edges array' }, { status: 400 });
  }

  const customId = workflow.id || `workflow_${Date.now()}`;
  const savedId = storage.saveWorkflow({
    customId,
    name: workflow.name || 'Untitled Workflow',
    description: workflow.description,
    category: workflow.category,
    tags: workflow.tags,
    difficulty: workflow.difficulty,
    estimatedTime: workflow.estimatedTime,
    nodes: workflow.nodes,
    edges: workflow.edges,
    version: workflow.version,
    isTemplate: workflow.isTemplate,
    userId: 'local-user',
  });

  return NextResponse.json({ success: true, workflowId: savedId, source: 'local' });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('id');

  if (!workflowId) {
    return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
  }

  const deleted = storage.deleteWorkflow(workflowId);
  if (!deleted) {
    return NextResponse.json({ error: `Workflow ${workflowId} not found` }, { status: 404 });
  }

  return NextResponse.json({ success: true, source: 'local' });
}
