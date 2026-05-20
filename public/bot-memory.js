const SESSION_ID = crypto.randomUUID();
const DB_NAME = 'BotMemory';
const DB_VERSION = 3;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('events')) {
        const ev = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        ev.createIndex('botId', 'botId', { unique: false });
        ev.createIndex('ts', 'ts', { unique: false });
        ev.createIndex('botId_ts', ['botId', 'ts'], { unique: false });
        ev.createIndex('sessionId', 'sessionId', { unique: false });
      }
      if (!db.objectStoreNames.contains('snapshots')) {
        const sn = db.createObjectStore('snapshots', { keyPath: 'id', autoIncrement: true });
        sn.createIndex('botId', 'botId', { unique: false });
        sn.createIndex('botId_ts', ['botId', 'ts'], { unique: false });
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function txPromise(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
    tx.onabort = (e) => reject(e.target.error);
  });
}

function cursorAll(store, indexName, range) {
  return new Promise((resolve, reject) => {
    const results = [];
    const source = indexName ? store.index(indexName) : store;
    const req = source.openCursor(range);
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

export class BotMemory {
  constructor(botId) {
    this.botId = botId;
    this._db = null;
  }

  async open() {
    try {
      this._db = await openDB();
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] open failed`, err);
    }
  }

  async append(event) {
    try {
      if (!this._db) return null;
      const record = {
        botId: this.botId,
        type: event.type,
        data: event.data,
        ts: Date.now(),
        sessionId: SESSION_ID,
      };
      const tx = this._db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const req = store.add(record);
      await txPromise(tx);
      return req.result;
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] append failed`, err);
      return null;
    }
  }

  async search(query, limit = 20) {
    try {
      if (!this._db) return [];
      const q = query.toLowerCase();
      const tx = this._db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const all = await cursorAll(store, 'botId', IDBKeyRange.only(this.botId));
      const matches = all
        .filter((e) => {
          const serialized = JSON.stringify(e.data ?? null);
          return typeof serialized === 'string' && serialized.toLowerCase().includes(q);
        })
        .sort((a, b) => b.ts - a.ts)
        .slice(0, limit);
      return matches;
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] search failed`, err);
      return [];
    }
  }

  async recent(limit = 50) {
    try {
      if (!this._db) return [];
      const tx = this._db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const all = await cursorAll(store, 'botId', IDBKeyRange.only(this.botId));
      return all.sort((a, b) => b.ts - a.ts).slice(0, limit);
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] recent failed`, err);
      return [];
    }
  }

  async summarize() {
    try {
      if (!this._db) return null;
      const events = await this.recent(100);
      const ts = Date.now();
      const eventCount = events.length;
      const types = [...new Set(events.map((e) => e.type))].join(', ');
      const dataBlob = events
        .map((e) => JSON.stringify(e.data))
        .join(' ')
        .slice(0, 500);
      const summary =
        `[SNAPSHOT ${ts}] Bot: ${this.botId} — ${eventCount} eventos\n` +
        `Últimas acciones: ${types}\n` +
        `Datos clave: ${dataBlob}`;
      const snapshot = { botId: this.botId, ts, summary, eventCount };
      const tx = this._db.transaction('snapshots', 'readwrite');
      tx.objectStore('snapshots').add(snapshot);
      await txPromise(tx);
      return summary;
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] summarize failed`, err);
      return null;
    }
  }

  async getSnapshots(limit = 10) {
    try {
      if (!this._db) return [];
      const tx = this._db.transaction('snapshots', 'readonly');
      const store = tx.objectStore('snapshots');
      const all = await cursorAll(store, 'botId', IDBKeyRange.only(this.botId));
      return all.sort((a, b) => b.ts - a.ts).slice(0, limit);
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] getSnapshots failed`, err);
      return [];
    }
  }

  async stats() {
    try {
      if (!this._db) return null;
      const txE = this._db.transaction('events', 'readonly');
      const allEvents = await cursorAll(txE.objectStore('events'), 'botId', IDBKeyRange.only(this.botId));
      const txS = this._db.transaction('snapshots', 'readonly');
      const allSnaps = await cursorAll(txS.objectStore('snapshots'), 'botId', IDBKeyRange.only(this.botId));

      const eventCount = allEvents.length;
      const snapshotCount = allSnaps.length;
      if (eventCount === 0) {
        return { eventCount: 0, snapshotCount, oldestEvent: null, newestEvent: null, avgEventsPerDay: 0 };
      }
      const timestamps = allEvents.map((e) => e.ts);
      const oldest = Math.min(...timestamps);
      const newest = Math.max(...timestamps);
      const days = Math.max(1, (newest - oldest) / 86400000);
      const avgEventsPerDay = Math.round(eventCount / days);
      return {
        eventCount,
        snapshotCount,
        oldestEvent: new Date(oldest).toISOString(),
        newestEvent: new Date(newest).toISOString(),
        avgEventsPerDay,
      };
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] stats failed`, err);
      return null;
    }
  }

  async exportJSON() {
    try {
      if (!this._db) return null;
      const txE = this._db.transaction('events', 'readonly');
      const events = await cursorAll(txE.objectStore('events'), 'botId', IDBKeyRange.only(this.botId));
      const txS = this._db.transaction('snapshots', 'readonly');
      const snapshots = await cursorAll(txS.objectStore('snapshots'), 'botId', IDBKeyRange.only(this.botId));
      return JSON.stringify({ botId: this.botId, exportedAt: new Date().toISOString(), events, snapshots }, null, 2);
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] exportJSON failed`, err);
      return null;
    }
  }

  async importJSON(json) {
    try {
      if (!this._db) return null;
      const payload = JSON.parse(json);
      const incomingEvents = Array.isArray(payload.events) ? payload.events : [];
      const incomingSnapshots = Array.isArray(payload.snapshots) ? payload.snapshots : [];

      // Always key by the target botId (this.botId), so events tagged with a different
      // botId in the export still dedupe correctly against existing events for this bot.
      const keyFor = (e) => `${e.ts}|${this.botId}|${e.type}|${JSON.stringify(e.data ?? null)}`;
      const snapKeyFor = (s) => `${s.ts}|${this.botId}|${(s.summary ?? '').slice(0, 80)}`;

      let importedEvents = 0;
      let importedSnapshots = 0;

      // Events
      const txE = this._db.transaction('events', 'readwrite');
      const storeE = txE.objectStore('events');
      const existingEvents = await cursorAll(storeE, 'botId', IDBKeyRange.only(this.botId));
      const seenEvents = new Set(existingEvents.map(keyFor));
      for (const ev of incomingEvents) {
        const key = keyFor(ev);
        if (!seenEvents.has(key)) {
          const { id: _id, ...clean } = ev;
          storeE.add({ ...clean, botId: this.botId });
          seenEvents.add(key);
          importedEvents++;
        }
      }
      await txPromise(txE);

      // Snapshots
      if (incomingSnapshots.length > 0) {
        const txS = this._db.transaction('snapshots', 'readwrite');
        const storeS = txS.objectStore('snapshots');
        const existingSnaps = await cursorAll(storeS, 'botId', IDBKeyRange.only(this.botId));
        const seenSnaps = new Set(existingSnaps.map(snapKeyFor));
        for (const sn of incomingSnapshots) {
          const key = snapKeyFor(sn);
          if (!seenSnaps.has(key)) {
            const { id: _id, ...clean } = sn;
            storeS.add({ ...clean, botId: this.botId });
            seenSnaps.add(key);
            importedSnapshots++;
          }
        }
        await txPromise(txS);
      }

      return { events: importedEvents, snapshots: importedSnapshots };
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] importJSON failed`, err);
      return null;
    }
  }

  async clearOlderThan(days) {
    try {
      if (!this._db) return null;
      const cutoff = Date.now() - days * 86400000;
      const tx = this._db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const all = await cursorAll(store, 'botId', IDBKeyRange.only(this.botId));
      let deleted = 0;
      for (const ev of all) {
        if (ev.ts < cutoff) {
          store.delete(ev.id);
          deleted++;
        }
      }
      await txPromise(tx);
      return deleted;
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] clearOlderThan failed`, err);
      return null;
    }
  }

  async getLastSession() {
    try {
      if (!this._db) return [];
      const tx = this._db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const all = await cursorAll(store, 'botId', IDBKeyRange.only(this.botId));
      if (all.length === 0) return [];
      all.sort((a, b) => b.ts - a.ts);
      const lastSessionId = all[0].sessionId;
      return all.filter((e) => e.sessionId === lastSessionId).sort((a, b) => a.ts - b.ts);
    } catch (err) {
      console.warn(`[BotMemory:${this.botId}] getLastSession failed`, err);
      return [];
    }
  }
}

export const botMemories = {
  lucrecia: new BotMemory('lucrecia'),
  oraculo: new BotMemory('oraculo'),
  valentina: new BotMemory('valentina'),
  megan: new BotMemory('megan'),
};

export async function initAllMemories() {
  await Promise.all(Object.values(botMemories).map((m) => m.open()));
}
