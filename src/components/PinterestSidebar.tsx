import { useState, FormEvent } from 'react';
import styles from './PinterestSidebar.module.css';

export function PinterestSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [blocked, setBlocked] = useState(false);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setBlocked(false);
    setSubmittedQuery(q);
  }

  const embedUrl = submittedQuery
    ? `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(submittedQuery)}`
    : null;

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <span className={styles.title}>📌 Pinterest search</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pinterest…"
            className={styles.input}
            autoFocus={open}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className={styles.results}>
          {!submittedQuery && (
            <p className={styles.hint}>
              Search terms open results below without leaving this site.
            </p>
          )}

          {embedUrl && !blocked && (
            <iframe
              key={embedUrl}
              src={embedUrl}
              title="Pinterest search results"
              className={styles.iframe}
              onError={() => setBlocked(true)}
              // Pinterest often refuses to be framed by other sites (it sends
              // an X-Frame-Options / frame-ancestors header). If that happens
              // the browser blocks the frame silently rather than firing
              // onError, so we also show a fallback message below.
            />
          )}

          {embedUrl && (
            <div className={styles.fallback}>
              <p>
                If results don't appear above, Pinterest's security settings are blocking
                the embed for this search.
              </p>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                Open "{submittedQuery}" on Pinterest ↗
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
