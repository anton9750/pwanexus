import { useState } from 'react';
import styles from './ToolShared.module.css';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  function generate() {
    let chars = '';
    if (lower) chars += LOWER;
    if (upper) chars += UPPER;
    if (digits) chars += DIGITS;
    if (symbols) chars += SYMBOLS;
    if (!chars) {
      setPassword('');
      return;
    }
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let out = '';
    for (let i = 0; i < length; i++) {
      out += chars[arr[i] % chars.length];
    }
    setPassword(out);
    setCopied(false);
  }

  async function copy() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <label className={styles.label}>
          Length: {length}
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(+e.target.value)}
            className={styles.range}
          />
        </label>
      </div>
      <div className={styles.checks}>
        <label>
          <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} />
          lowercase
        </label>
        <label>
          <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          UPPERCASE
        </label>
        <label>
          <input type="checkbox" checked={digits} onChange={(e) => setDigits(e.target.checked)} />
          digits
        </label>
        <label>
          <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
          symbols
        </label>
      </div>
      <div className={styles.row}>
        <button className="btn btn-primary" onClick={generate}>
          Generate
        </button>
        <button className="btn btn-ghost" onClick={copy} disabled={!password}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {password && (
        <code className={styles.codeBlock}>{password}</code>
      )}
    </div>
  );
}
