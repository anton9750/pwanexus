import { useState } from 'react';
import styles from './Calculator.module.css';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  function inputDigit(d: string) {
    if (fresh) {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
    } else {
      if (d === '.' && display.includes('.')) return;
      setDisplay(display === '0' && d !== '.' ? d : display + d);
    }
  }

  function clear() {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setFresh(true);
  }

  function applyOp(nextOp: string) {
    const current = parseFloat(display);
    if (prev !== null && op && !fresh) {
      const result = compute(prev, current, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setFresh(true);
  }

  function equals() {
    if (prev === null || !op) return;
    const current = parseFloat(display);
    const result = compute(prev, current, op);
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setFresh(true);
  }

  function compute(a: number, b: number, operator: string): number {
    switch (operator) {
      case '+':
        return a + b;
      case '−':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  const keys = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  function onKey(k: string) {
    if (k === 'C') return clear();
    if (k === '=') return equals();
    if (k === '±') {
      setDisplay(String(parseFloat(display) * -1));
      return;
    }
    if (k === '%') {
      setDisplay(String(parseFloat(display) / 100));
      return;
    }
    if (['+', '−', '×', '÷'].includes(k)) return applyOp(k);
    inputDigit(k);
  }

  return (
    <div className={styles.calc}>
      <div className={styles.display}>{display}</div>
      <div className={styles.keys}>
        {keys.flat().map((k) => (
          <button
            key={k}
            className={`${styles.key} ${
              ['+', '−', '×', '÷', '='].includes(k) ? styles.op : ''
            } ${k === '0' ? styles.zero : ''} ${k === 'C' ? styles.clear : ''}`}
            onClick={() => onKey(k)}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
