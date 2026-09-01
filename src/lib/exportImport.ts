/** Export / import all Nexus Hub localStorage app data as a single JSON blob. */

const APP_KEYS = [
  'nexus-notes',
  'nexus-tasks',
  'nexus-bookmarks',
  'nexus-weather-last',
  'nexus-theme',
  'nexus-spotify-embeds',
  'nexus-music-embeds',
] as const;

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function collectExport(): ExportPayload {
  const data: Record<string, unknown> = {};
  for (const key of APP_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw == null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  // Also include any other nexus-* keys we might have missed
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('nexus-') && !(k in data)) {
      const raw = localStorage.getItem(k);
      if (raw == null) continue;
      try {
        data[k] = JSON.parse(raw);
      } catch {
        data[k] = raw;
      }
    }
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadExport(): void {
  const payload = collectExport();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexus-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJson(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as ExportPayload;
    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      return { ok: false, error: 'Invalid backup format' };
    }
    for (const [key, value] of Object.entries(parsed.data)) {
      if (!key.startsWith('nexus-')) continue;
      localStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Parse error' };
  }
}

export function clearAllAppData(): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('nexus-')) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}
