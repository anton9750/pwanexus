import { useState, useEffect, FormEvent } from 'react';
import { usePlayer } from '../context/PlayerContext';
import styles from './Music.module.css';

const STORAGE_KEY = 'nexus-hub-spotify-embeds';

interface Embed {
  id: string;
  url: string;
  label: string;
}

const DEFAULT_EMBEDS: Embed[] = [
  {
    id: 'default-1',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
    label: "Today's Top Hits",
  },
];

function loadEmbeds(): Embed[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EMBEDS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EMBEDS;
  }
}

function saveEmbeds(embeds: Embed[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(embeds));
}

function toEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  // Already an embed URL
  if (trimmed.includes('open.spotify.com/embed/')) {
    return trimmed.split('?')[0];
  }
  // Regular Spotify URL → convert
  const match = trimmed.match(
    /open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/
  );
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  }
  // Just an ID with type hint? Accept playlist IDs as fallback
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return `https://open.spotify.com/embed/playlist/${trimmed}`;
  }
  return null;
}

export function Music() {
  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const [input, setInput] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { play, nowPlaying } = usePlayer();

  useEffect(() => {
    setEmbeds(loadEmbeds());
  }, []);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const embedUrl = toEmbedUrl(input);
    if (!embedUrl) {
      setError('Paste a valid Spotify link (track, album, playlist, or artist).');
      return;
    }
    const newEmbed: Embed = {
      id: crypto.randomUUID(),
      url: embedUrl,
      label: label.trim() || 'Spotify',
    };
    const next = [newEmbed, ...embeds];
    setEmbeds(next);
    saveEmbeds(next);
    setInput('');
    setLabel('');
  }

  function handleRemove(id: string) {
    const next = embeds.filter((e) => e.id !== id);
    setEmbeds(next);
    saveEmbeds(next);
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Spotify Music</h1>
          <p className={styles.desc}>
            Paste any Spotify link to embed and listen right here. Your embeds are saved on this device.
            Hit "Play across pages" on a track and it keeps playing in a mini-player docked at the
            bottom of the screen — even after you navigate to Home, Files, or anywhere else.
          </p>
        </div>
        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Open Spotify
        </a>
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Spotify URL (playlist, track, album…)"
          className={styles.input}
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className={styles.inputSmall}
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        {embeds.map((embed) => (
          <div key={embed.id} className={styles.playerCard}>
            <div className={styles.playerHeader}>
              <span className={styles.playerLabel}>{embed.label}</span>
              <div className={styles.playerHeaderActions}>
                <button
                  className={`btn ${nowPlaying?.url === embed.url ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => play({ url: embed.url, label: embed.label })}
                  title="Keep playing after you leave this page"
                >
                  {nowPlaying?.url === embed.url ? '♫ Playing everywhere' : '▶ Play across pages'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemove(embed.id)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src={`${embed.url}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className={styles.iframe}
              title={embed.label}
            />
          </div>
        ))}
      </div>

      {embeds.length === 0 && (
        <div className="empty-state">
          <p>No embeds yet. Paste a Spotify link above.</p>
        </div>
      )}
    </div>
  );
}
