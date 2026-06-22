import { NextResponse } from 'next/server';
import { listTemplates, getTemplate } from '@/lib/workflow/templates';
import { storage } from '@/lib/local-storage';

export const dynamic = 'force-dynamic';

export async function POST() {
  const templateList = listTemplates();
  const seeded: string[] = [];
  const skipped: string[] = [];

  for (const info of templateList) {
    const template = getTemplate(info.id);
    if (!template) continue;
    const existing = storage.getWorkflow(template.id);
    if (existing) { skipped.push(template.name); continue; }
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
    seeded.push(template.name);
  }

  return NextResponse.json({
    success: true,
    seeded: seeded.length,
    skipped: skipped.length,
    total: templateList.length,
    seededTemplates: seeded,
    skippedTemplates: skipped,
  });
}
