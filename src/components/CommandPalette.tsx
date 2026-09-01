import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import styles from './CommandPalette.module.css';

interface Command {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  action: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const commands: Command[] = useMemo(
    () => [
      { id: 'home', label: 'Go to Home', keywords: 'dashboard', action: () => navigate('/') },
      { id: 'files', label: 'Go to Files', keywords: 'upload storage', action: () => navigate('/files') },
      { id: 'music', label: 'Go to Music', keywords: 'spotify', action: () => navigate('/music') },
      { id: 'stocks', label: 'Go to Stocks', keywords: 'market ticker', action: () => navigate('/stocks') },
      { id: 'youtube', label: 'Go to YouTube', action: () => navigate('/youtube') },
      { id: 'repos', label: 'Go to Repos', keywords: 'github', action: () => navigate('/repos') },
      { id: 'notes', label: 'Go to Notes', action: () => navigate('/notes') },
      { id: 'tasks', label: 'Go to Tasks', keywords: 'todo', action: () => navigate('/tasks') },
      { id: 'bookmarks', label: 'Go to Bookmarks', keywords: 'links', action: () => navigate('/bookmarks') },
      { id: 'weather', label: 'Go to Weather', action: () => navigate('/weather') },
      { id: 'tools', label: 'Go to Tools', keywords: 'calculator password qr', action: () => navigate('/tools') },
      { id: 'settings', label: 'Go to Settings', keywords: 'theme export', action: () => navigate('/settings') },
      {
        id: 'theme',
        label: 'Toggle theme',
        keywords: 'dark light',
        hint: 'appearance',
        action: () => toggleTheme(),
      },
      {
        id: 'google',
        label: 'Search Google…',
        keywords: 'web search',
        action: () => {
          const q = prompt('Search Google');
          if (q?.trim()) {
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(q.trim())}`,
              '_blank'
            );
          }
        },
      },
    ],
    [navigate, toggleTheme]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.keywords && c.keywords.includes(q)) ||
        (c.hint && c.hint.includes(q))
    );
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[index];
        if (cmd) {
          cmd.action();
          onClose();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, index, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          ref={inputRef}
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command or search…"
        />
        <ul className={styles.list}>
          {filtered.length === 0 && (
            <li className={styles.empty}>No matching commands</li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                className={`${styles.item} ${i === index ? styles.itemActive : ''}`}
                onClick={() => {
                  c.action();
                  onClose();
                }}
                onMouseEnter={() => setIndex(i)}
              >
                <span>{c.label}</span>
                {c.hint && <span className={styles.hint}>{c.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
