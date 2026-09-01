import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { ChatMessage, streamGeminiChat, loadGeminiApiKey, saveGeminiApiKey } from '../lib/gemini';
import styles from './GeminiSidebar.module.css';

interface Attachment {
  id: string;
  name: string;
  size: number;
  content: string;
  truncated: boolean;
}

// Extensions we're confident are readable text/code, so we skip the
// binary-sniffing step for these and just read them straight away.
const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'mdx', 'json', 'yml', 'yaml', 'xml', 'csv', 'tsv', 'ini', 'toml', 'env',
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'html', 'htm', 'css', 'scss', 'sass', 'less',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'c', 'h', 'cpp', 'hpp', 'cs', 'php', 'swift',
  'sh', 'bash', 'zsh', 'sql', 'graphql', 'vue', 'svelte', 'gitignore', 'dockerfile',
  'lock', 'log', 'txt',
]);

const MAX_FILE_CHARS = 60_000; // per-file cap so one huge file can't blow the whole context
const MAX_TOTAL_FILES = 60;

function extOf(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function looksBinary(text: string): boolean {
  // Null bytes are a strong signal we accidentally read a binary file as text.
  return text.slice(0, 2000).includes('\u0000');
}

async function readAsAttachments(files: FileList | File[]): Promise<{ ok: Attachment[]; skipped: string[] }> {
  const ok: Attachment[] = [];
  const skipped: string[] = [];

  for (const file of Array.from(files)) {
    // Prefer the relative path (present on folder uploads) so Gemini can see
    // the repo's directory structure, not just flat filenames.
    const relPath = (file as any).webkitRelativePath || file.name;
    const ext = extOf(file.name);

    if (file.size > 3_000_000) {
      skipped.push(`${relPath} (too large)`);
      continue;
    }

    try {
      const text = await file.text();
      if (!TEXT_EXTENSIONS.has(ext) && looksBinary(text)) {
        skipped.push(`${relPath} (binary)`);
        continue;
      }
      const truncated = text.length > MAX_FILE_CHARS;
      ok.push({
        id: `${relPath}-${file.size}-${Date.now()}-${Math.random()}`,
        name: relPath,
        size: file.size,
        content: truncated ? text.slice(0, MAX_FILE_CHARS) : text,
        truncated,
      });
    } catch {
      skipped.push(`${relPath} (couldn't read)`);
    }
  }

  return { ok, skipped };
}

function buildContextBlock(files: Attachment[]): string {
  const header = `Here are ${files.length} file(s) for context. Use them to answer questions about this codebase/content. File contents follow, each preceded by its path:\n\n`;
  const body = files
    .map((f) => {
      const note = f.truncated ? '\n[...truncated...]' : '';
      return `--- ${f.name} ---\n${f.content}${note}`;
    })
    .join('\n\n');
  return header + body;
}

export function GeminiSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setApiKey(loadGeminiApiKey());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, open]);

  function handleSaveKey(e: FormEvent) {
    e.preventDefault();
    saveGeminiApiKey(apiKey);
  }

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    e.target.value = ''; // allow re-selecting the same file/folder later
    if (!list || list.length === 0) return;

    setUploadNotice(null);
    const { ok, skipped } = await readAsAttachments(list);

    setAttachments((prev) => {
      const combined = [...prev, ...ok];
      return combined.slice(0, MAX_TOTAL_FILES);
    });

    const notices: string[] = [];
    if (ok.length) notices.push(`Added ${ok.length} file(s).`);
    if (skipped.length) notices.push(`Skipped ${skipped.length}: ${skipped.slice(0, 5).join(', ')}${skipped.length > 5 ? '…' : ''}`);
    if (notices.length) setUploadNotice(notices.join(' '));
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function clearAttachments() {
    setAttachments([]);
    setUploadNotice(null);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!apiKey.trim()) {
      setError('Add a free Gemini API key below first (no credit card needed).');
      return;
    }
    const text = input.trim();
    if (!text || loading) return;

    const visibleHistory: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(visibleHistory);
    setInput('');
    setStreamingText('');
    setLoading(true);

    // Prepend the attached files as a synthetic exchange so Gemini has them
    // as context on every request, without cluttering the visible chat log.
    const apiHistory: ChatMessage[] = attachments.length
      ? [
          { role: 'user', text: buildContextBlock(attachments) },
          { role: 'model', text: `Got it — I've loaded ${attachments.length} file(s) and will use them to answer.` },
          ...visibleHistory,
        ]
      : visibleHistory;

    try {
      const full = await streamGeminiChat(apiHistory, apiKey.trim(), setStreamingText);
      setMessages([...visibleHistory, { role: 'model', text: full }]);
      setStreamingText('');
    } catch (err: any) {
      setError(err.message || 'Chat request failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessages([]);
    setStreamingText('');
    setError(null);
  }

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`} onClick={onClose} />
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <span className={styles.title}>💬 Gemini chat</span>
          <div className={styles.headerActions}>
            {messages.length > 0 && (
              <button className="btn btn-ghost" onClick={handleClear}>
                Clear
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className={styles.attachBar}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={styles.hiddenInput}
            onChange={handleFiles}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            className={styles.hiddenInput}
            // Non-standard attributes that enable folder selection in
            // Chromium/Firefox; not in React's typings, so cast via spread.
            {...({ webkitdirectory: 'true', directory: 'true' } as any)}
            onChange={handleFiles}
          />
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
            📎 Add files
          </button>
          <button className="btn btn-ghost" onClick={() => folderInputRef.current?.click()}>
            🗂 Add folder
          </button>
          {attachments.length > 0 && (
            <button className="btn btn-ghost" onClick={clearAttachments}>
              Clear files
            </button>
          )}
        </div>

        {uploadNotice && <div className={styles.uploadNotice}>{uploadNotice}</div>}

        {attachments.length > 0 && (
          <div className={styles.attachmentList}>
            {attachments.map((a) => (
              <div key={a.id} className={styles.attachmentChip} title={a.name}>
                <span className={styles.attachmentName}>{a.name}</span>
                <span className={styles.attachmentSize}>{Math.max(1, Math.round(a.size / 1024))}KB</span>
                <button className={styles.attachmentRemove} onClick={() => removeAttachment(a.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.chatWindow}>
          {messages.length === 0 && !streamingText && (
            <div className="empty-state">
              <p>
                {attachments.length > 0
                  ? 'Files loaded — ask a question about them below.'
                  : 'Say something below, or attach files/a folder for it to read first.'}
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`${styles.bubble} ${m.role === 'user' ? styles.userBubble : styles.modelBubble}`}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className={`${styles.bubble} ${styles.modelBubble}`}>
              {streamingText || <span className={styles.typing}>…</span>}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.inputForm} onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className={styles.input}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '…' : 'Send'}
          </button>
        </form>

        <details className={styles.keySetup}>
          <summary>Gemini API key setup</summary>
          <form className={styles.keyForm} onSubmit={handleSaveKey}>
            <p className={styles.keyHint}>
              Uses Google's Gemini API (free tier, no credit card). Get a key from{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                Google AI Studio
              </a>{' '}
              and paste it here. Saved only on this device.
            </p>
            <div className={styles.keyRow}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Gemini API key"
                className={styles.input}
              />
              <button type="submit" className="btn btn-ghost">
                Save
              </button>
            </div>
          </form>
        </details>
      </aside>
    </>
  );
}
