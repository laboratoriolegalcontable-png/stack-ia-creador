import { NextResponse } from 'next/server';
import { storage } from '@/lib/local-storage';

export async function DELETE() {
  const deleted = storage.deleteOrphaned();
  return NextResponse.json({ success: true, deleted });
}
