import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/local-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  const workflow = storage.getWorkflow(workflowId);

  if (!workflow) {
    return NextResponse.json({ error: `Workflow ${workflowId} not found` }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    workflow: { ...workflow, id: workflow.customId || workflow._id },
    source: 'local',
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  const deleted = storage.deleteWorkflow(workflowId);

  if (!deleted) {
    return NextResponse.json({ error: `Workflow ${workflowId} not found` }, { status: 404 });
  }

  return NextResponse.json({ success: true, source: 'local' });
}
