const KEY = 'nexus-notes';

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
  createdAt: number;
}

function read(): Note[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(notes: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

export function loadNotes(): Note[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getNote(id: string): Note | undefined {
  return read().find((n) => n.id === id);
}

export function saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Note {
  const notes = read();
  const now = Date.now();
  if (note.id) {
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      const updated: Note = {
        ...notes[idx],
        title: note.title,
        body: note.body,
        updatedAt: now,
      };
      notes[idx] = updated;
      write(notes);
      return updated;
    }
  }
  const created: Note = {
    id: crypto.randomUUID(),
    title: note.title || 'Untitled',
    body: note.body || '',
    createdAt: now,
    updatedAt: now,
  };
  notes.unshift(created);
  write(notes);
  return created;
}

export function deleteNote(id: string): void {
  write(read().filter((n) => n.id !== id));
}

export function clearNotes(): void {
  localStorage.removeItem(KEY);
}
