const KEY = 'nexus-bookmarks';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  tags: string[];
  createdAt: number;
}

function read(): Bookmark[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Bookmark[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: Bookmark[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function faviconFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return '';
  }
}

export function loadBookmarks(): Bookmark[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function addBookmark(
  title: string,
  url: string,
  tags: string[] = []
): Bookmark {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  const item: Bookmark = {
    id: crypto.randomUUID(),
    title: title.trim() || normalized,
    url: normalized,
    favicon: faviconFromUrl(normalized),
    tags: tags.map((t) => t.trim()).filter(Boolean),
    createdAt: Date.now(),
  };
  const items = read();
  items.unshift(item);
  write(items);
  return item;
}

export function deleteBookmark(id: string): void {
  write(read().filter((b) => b.id !== id));
}

export function clearBookmarks(): void {
  localStorage.removeItem(KEY);
}
