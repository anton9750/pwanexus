import { useState, useEffect, FormEvent } from 'react';
import {
  YouTubeResult,
  searchYouTube,
  loadYouTubeApiKey,
  saveYouTubeApiKey,
} from '../lib/youtube';
import styles from './YouTube.module.css';

export function YouTube() {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeResult[]>([]);
  const [playing, setPlaying] = useState<YouTubeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(loadYouTubeApiKey());
  }, []);

  function handleSaveKey(e: FormEvent) {
    e.preventDefault();
    saveYouTubeApiKey(apiKey);
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!apiKey.trim()) {
      setError('Add a YouTube Data API key below first (free from Google Cloud Console).');
      return;
    }
    if (!query.trim()) return;
    setLoading(true);
    try {
      const items = await searchYouTube(query.trim(), apiKey.trim());
      setResults(items);
      if (items.length > 0) setPlaying(items[0]);
    } catch (err: any) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>YouTube Search</h1>
          <p className={styles.desc}>
            Search and watch right here — the video plays in an embedded YouTube player below,
            so you never get sent to youtube.com.
          </p>
        </div>
      </div>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search YouTube…"
          className={styles.input}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {playing && (
        <div className={styles.player}>
          <iframe
            key={playing.videoId}
            src={`https://www.youtube.com/embed/${playing.videoId}?autoplay=1`}
            title={playing.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.iframe}
          />
          <p className={styles.nowPlayingTitle}>{playing.title}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.grid}>
          {results.map((r) => (
            <button
              key={r.videoId}
              className={`${styles.resultCard} ${playing?.videoId === r.videoId ? styles.active : ''}`}
              onClick={() => setPlaying(r)}
            >
              <img src={r.thumbnail} alt={r.title} className={styles.thumb} />
              <div className={styles.resultMeta}>
                <span className={styles.resultTitle}>{r.title}</span>
                <span className={styles.resultChannel}>{r.channel}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <details className={styles.keySetup}>
        <summary>YouTube API key setup</summary>
        <form className={styles.keyForm} onSubmit={handleSaveKey}>
          <p className={styles.keyHint}>
            Search uses the official YouTube Data API v3. Get a free key from the{' '}
            <a
              href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Cloud Console
            </a>{' '}
            (enable "YouTube Data API v3", create an API key) and paste it here. It's saved only
            on this device.
          </p>
          <div className={styles.keyRow}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="YouTube Data API key"
              className={styles.input}
            />
            <button type="submit" className="btn btn-ghost">
              Save key
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
