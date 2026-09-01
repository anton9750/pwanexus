import { useState, useEffect, useCallback, useMemo, DragEvent, ChangeEvent } from 'react';
import {
  StoredFile,
  loadFiles,
  addFile,
  removeFile,
  clearAllFiles,
  estimateStorage,
  requestPersistentStorage,
} from '../lib/storage';
import styles from './Files.module.css';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(type: string) {
  return type.startsWith('image/');
}

// IndexedDB has no fixed low ceiling like localStorage — this is just a
// sane per-file guardrail, not a hard browser limit.
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB per file

export function Files() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ usage: number; quota: number } | null>(null);
  const [persisted, setPersisted] = useState(false);

  const refreshUsage = useCallback(() => {
    estimateStorage().then(setUsage);
  }, []);

  useEffect(() => {
    loadFiles().then(setFiles);
    refreshUsage();
  }, [refreshUsage]);

  // Object URLs for image thumbnails — created from Blobs, revoked on cleanup.
  const objectUrls = useMemo(() => {
    const map = new Map<string, string>();
    for (const file of files) {
      if (isImage(file.type)) {
        map.set(file.id, URL.createObjectURL(file.blob));
      }
    }
    return map;
  }, [files]);

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const arr = Array.from(fileList);

      for (const file of arr) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`"${file.name}" is too large (max ${formatSize(MAX_FILE_SIZE)} per file).`);
          continue;
        }
        try {
          const stored: StoredFile = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            blob: file,
            createdAt: Date.now(),
          };
          await addFile(stored);
          const updated = await loadFiles();
          setFiles(updated);
          refreshUsage();
        } catch (err) {
          setError(`Failed to save "${file.name}" — you may be out of storage space.`);
        }
      }
    },
    [refreshUsage]
  );

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }

  async function handleRemove(id: string) {
    await removeFile(id);
    setFiles(await loadFiles());
    refreshUsage();
  }

  async function handleClear() {
    if (confirm('Delete all stored files from this device?')) {
      await clearAllFiles();
      setFiles([]);
      refreshUsage();
    }
  }

  function handleDownload(file: StoredFile) {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handlePersist() {
    const granted = await requestPersistentStorage();
    setPersisted(granted);
  }

  const usagePercent = usage && usage.quota > 0 ? (usage.usage / usage.quota) * 100 : 0;

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Files & Images</h1>
          <p className={styles.desc}>
            Drop files here. Stored in this browser&apos;s IndexedDB — stays on this device only,
            with room for gigabytes rather than the few MB localStorage allows.
          </p>
        </div>
        {files.length > 0 && (
          <button className="btn btn-danger" onClick={handleClear}>
            Clear all
          </button>
        )}
      </div>

      {usage && usage.quota > 0 && (
        <div className={styles.usageBar}>
          <div className={styles.usageTrack}>
            <div
              className={styles.usageFill}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <span className={styles.usageText}>
            {formatSize(usage.usage)} used of ~{formatSize(usage.quota)} available
            {!persisted && (
              <button className={styles.persistBtn} onClick={handlePersist}>
                Protect storage
              </button>
            )}
            {persisted && ' · protected'}
          </span>
        </div>
      )}

      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className={styles.dropIcon}>↓</div>
        <p className={styles.dropText}>Drag & drop files here</p>
        <p className={styles.dropSub}>or</p>
        <label className="btn btn-primary">
          Choose files
          <input
            type="file"
            multiple
            onChange={onInputChange}
            className={styles.hiddenInput}
          />
        </label>
        <p className={styles.limit}>Max {formatSize(MAX_FILE_SIZE)} per file · Images, PDFs, docs, etc.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {files.length === 0 ? (
        <div className="empty-state">
          <p>No files yet. Drop something to get started.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {files.map((file) => (
            <div key={file.id} className={styles.card}>
              {isImage(file.type) ? (
                <img src={objectUrls.get(file.id)} alt={file.name} className={styles.thumb} />
              ) : (
                <div className={styles.fileIcon}>📄</div>
              )}
              <div className={styles.meta}>
                <span className={styles.name} title={file.name}>
                  {file.name}
                </span>
                <span className={styles.size}>{formatSize(file.size)}</span>
              </div>
              <div className={styles.actions}>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  ↓
                </button>
                {isImage(file.type) && (
                  <a
                    href={objectUrls.get(file.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    title="Open"
                  >
                    ↗
                  </a>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemove(file.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
