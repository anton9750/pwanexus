import { useEffect, useState, FormEvent } from 'react';
import {
  loadBookmarks,
  addBookmark,
  deleteBookmark,
  Bookmark,
} from '../lib/bookmarks';
import styles from './Bookmarks.module.css';

export function Bookmarks() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [filter, setFilter] = useState('');

  function refresh() {
    setItems(loadBookmarks());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    addBookmark(
      title,
      url,
      tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    );
    setTitle('');
    setUrl('');
    setTags('');
    refresh();
  }

  const filtered = items.filter((b) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bookmarks</h1>
          <p className={styles.sub}>{items.length} saved links</p>
        </div>
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
        />
        <input
          className={styles.input}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          required
        />
        <input
          className={styles.input}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags, comma, separated"
        />
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </form>

      <div className={styles.filterRow}>
        <input
          className={styles.filterInput}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter bookmarks…"
        />
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>{items.length === 0 ? 'No bookmarks yet' : 'No matches'}</p>
          </div>
        )}
        {filtered.map((b) => (
          <a
            key={b.id}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <div className={styles.cardTop}>
              {b.favicon ? (
                <img src={b.favicon} alt="" className={styles.favicon} />
              ) : (
                <span className={styles.faviconFallback}>🔗</span>
              )}
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteBookmark(b.id);
                  refresh();
                }}
                title="Remove"
              >
                ×
              </button>
            </div>
            <span className={styles.cardTitle}>{b.title}</span>
            <span className={styles.cardUrl}>{b.url.replace(/^https?:\/\//, '')}</span>
            {b.tags.length > 0 && (
              <div className={styles.tags}>
                {b.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
