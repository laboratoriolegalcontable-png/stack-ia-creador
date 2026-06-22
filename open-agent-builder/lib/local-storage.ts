/**
 * File-based JSON storage — replaces Convex for local/standalone operation.
 * Data lives in .data/workflows.json (gitignored).
 */
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const WORKFLOWS_FILE = path.join(DATA_DIR, 'workflows.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readWorkflows(): any[] {
  ensureDataDir();
  if (!fs.existsSync(WORKFLOWS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(WORKFLOWS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeWorkflows(workflows: any[]) {
  ensureDataDir();
  fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify(workflows, null, 2));
}

function generateId(): string {
  return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const storage = {
  listWorkflows(): any[] {
    return readWorkflows();
  },

  getWorkflow(id: string): any | null {
    return readWorkflows().find(w => w._id === id || w.customId === id) || null;
  },

  saveWorkflow(data: any): string {
    const workflows = readWorkflows();
    const customId = data.customId || generateId();
    const now = new Date().toISOString();
    const idx = workflows.findIndex(w => w.customId === customId);

    if (idx >= 0) {
      workflows[idx] = { ...workflows[idx], ...data, customId, updatedAt: now };
      writeWorkflows(workflows);
      return workflows[idx]._id;
    }

    const _id = generateId();
    workflows.push({ ...data, _id, customId, createdAt: now, updatedAt: now });
    writeWorkflows(workflows);
    return _id;
  },

  deleteWorkflow(id: string): boolean {
    const before = readWorkflows();
    const after = before.filter(w => w._id !== id && w.customId !== id);
    if (after.length === before.length) return false;
    writeWorkflows(after);
    return true;
  },

  deleteOrphaned(): number {
    const before = readWorkflows();
    const after = before.filter(w => w.userId);
    writeWorkflows(after);
    return before.length - after.length;
  },
};
