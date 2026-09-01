import { useState, useEffect, FormEvent } from 'react';
import styles from './Repos.module.css';

const USERNAME_KEY = 'nexus-hub-gh-username';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
}

export function Repos() {
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(USERNAME_KEY);
    if (saved) {
      setUsername(saved);
      setInput(saved);
      fetchRepos(saved);
    }
  }, []);

  async function fetchRepos(user: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=100`
      );
      if (!res.ok) {
        throw new Error(res.status === 404 ? `No GitHub user "${user}" found.` : `GitHub API error (${res.status})`);
      }
      const data = await res.json();
      setRepos(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load repos.');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const u = input.trim();
    if (!u) return;
    setUsername(u);
    localStorage.setItem(USERNAME_KEY, u);
    fetchRepos(u);
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📁 GitHub Repos</h1>
          <p className={styles.desc}>
            Your public repositories, pulled live from GitHub's public API and stored here as a
            folder you can browse from the hub.
          </p>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          Open GitHub ↗
        </a>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="GitHub username"
          className={styles.input}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading…' : 'Load repos'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {!username && !loading && (
        <div className="empty-state">
          <p>Enter a GitHub username above to fill this folder with their repos.</p>
        </div>
      )}

      {repos.length > 0 && (
        <div className={styles.grid}>
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
            >
              <div className={styles.cardTop}>
                <span className={styles.repoIcon}>{repo.fork ? '⑂' : '📦'}</span>
                <span className={styles.repoName}>{repo.name}</span>
              </div>
              {repo.description && <p className={styles.repoDesc}>{repo.description}</p>}
              <div className={styles.cardMeta}>
                {repo.language && <span className={styles.lang}>{repo.language}</span>}
                <span className={styles.stars}>★ {repo.stargazers_count}</span>
                <span className={styles.updated}>
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {username && !loading && repos.length === 0 && !error && (
        <div className="empty-state">
          <p>No public repos found for "{username}".</p>
        </div>
      )}
    </div>
  );
}
