import { NextResponse } from 'next/server';
import { listTemplates, getTemplate } from '@/lib/workflow/templates';
import { storage } from '@/lib/local-storage';

export const dynamic = 'force-dynamic';

export async function POST() {
  const templateList = listTemplates();
  const updated: string[] = [];
  const failed: string[] = [];

  for (const info of templateList) {
    const template = getTemplate(info.id);
    if (!template) continue;
    try {
      storage.saveWorkflow({
        customId: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        difficulty: template.difficulty,
        estimatedTime: template.estimatedTime,
        nodes: template.nodes,
        edges: template.edges,
        isTemplate: true,
        userId: 'local-user',
      });
      updated.push(template.name);
    } catch {
      failed.push(template.name);
    }
  }

  return NextResponse.json({ success: true, updated: updated.length, failed: failed.length, total: templateList.length });
}
