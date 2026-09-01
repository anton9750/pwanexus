import { useEffect, useState, useCallback } from 'react';
import {
  loadNotes,
  saveNote,
  deleteNote,
  Note,
} from '../lib/notes';
import styles from './Notes.module.css';
import { shareContent, canShare, copyToClipboard } from '../lib/pwa';

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dirty, setDirty] = useState(false);

  const refresh = useCallback(() => {
    setNotes(loadNotes());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedId) {
      setTitle('');
      setBody('');
      setDirty(false);
      return;
    }
    const n = notes.find((x) => x.id === selectedId);
    if (n) {
      setTitle(n.title);
      setBody(n.body);
      setDirty(false);
    }
  }, [selectedId, notes]);

  function handleNew() {
    const n = saveNote({ title: 'Untitled', body: '' });
    refresh();
    setSelectedId(n.id);
  }

  function handleSave() {
    if (!selectedId) return;
    saveNote({ id: selectedId, title: title || 'Untitled', body });
    setDirty(false);
    refresh();
  }

  function handleDelete() {
    if (!selectedId) return;
    if (!confirm('Delete this note?')) return;
    deleteNote(selectedId);
    setSelectedId(null);
    refresh();
  }

  async function handleShare() {
    if (!selectedId) return;
    const text = `${title || 'Untitled'}\n\n${body}`.trim();
    if (canShare()) {
      const ok = await shareContent({ title: title || 'Note', text });
      if (ok) return;
    }
    await copyToClipboard(text);
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className={`page ${styles.wrap}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notes</h1>
          <p className={styles.sub}>Local notes stored on this device</p>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          + New note
        </button>
      </div>

      <div className={styles.panes}>
        <aside className={styles.list}>
          {notes.length === 0 && (
            <div className="empty-state">
              <p>No notes yet</p>
            </div>
          )}
          {notes.map((n) => (
            <button
              key={n.id}
              className={`${styles.listItem} ${selectedId === n.id ? styles.listItemActive : ''}`}
              onClick={() => setSelectedId(n.id)}
            >
              <span className={styles.listTitle}>{n.title || 'Untitled'}</span>
              <span className={styles.listMeta}>{formatDate(n.updatedAt)}</span>
              <span className={styles.listPreview}>
                {(n.body || '').slice(0, 80)}
              </span>
            </button>
          ))}
        </aside>

        <section className={styles.editor}>
          {!selectedId ? (
            <div className="empty-state">
              <p>Select a note or create a new one</p>
            </div>
          ) : (
            <>
              <div className={styles.editorToolbar}>
                <input
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Title"
                />
                <div className={styles.editorActions}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={!dirty}
                  >
                    Save
                  </button>
                  <button className="btn btn-ghost" onClick={handleShare}>
                    Share
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
              <textarea
                className={styles.bodyInput}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setDirty(true);
                }}
                placeholder="Write something…"
              />
              {dirty && <p className={styles.dirty}>Unsaved changes</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
