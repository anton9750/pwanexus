import { useState, useMemo } from 'react';
import styles from './ToolShared.module.css';

type Category = 'length' | 'weight' | 'temperature' | 'data';

const UNITS: Record<Category, { id: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]> = {
  length: [
    { id: 'm', label: 'Meters', toBase: (v) => v, fromBase: (v) => v },
    { id: 'km', label: 'Kilometers', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'cm', label: 'Centimeters', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { id: 'mi', label: 'Miles', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { id: 'ft', label: 'Feet', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { id: 'in', label: 'Inches', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  ],
  weight: [
    { id: 'kg', label: 'Kilograms', toBase: (v) => v, fromBase: (v) => v },
    { id: 'g', label: 'Grams', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: 'lb', label: 'Pounds', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { id: 'oz', label: 'Ounces', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
  ],
  temperature: [
    {
      id: 'c',
      label: 'Celsius',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    {
      id: 'f',
      label: 'Fahrenheit',
      toBase: (v) => ((v - 32) * 5) / 9,
      fromBase: (v) => (v * 9) / 5 + 32,
    },
    {
      id: 'k',
      label: 'Kelvin',
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
  ],
  data: [
    { id: 'b', label: 'Bytes', toBase: (v) => v, fromBase: (v) => v },
    { id: 'kb', label: 'Kilobytes', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    { id: 'mb', label: 'Megabytes', toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
    { id: 'gb', label: 'Gigabytes', toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
  ],
};

export function UnitConverter() {
  const [cat, setCat] = useState<Category>('length');
  const [fromId, setFromId] = useState('m');
  const [toId, setToId] = useState('km');
  const [value, setValue] = useState('1');

  const units = UNITS[cat];

  const result = useMemo(() => {
    const n = parseFloat(value);
    if (isNaN(n)) return '—';
    const from = units.find((u) => u.id === fromId);
    const to = units.find((u) => u.id === toId);
    if (!from || !to) return '—';
    const base = from.toBase(n);
    const out = to.fromBase(base);
    return Number.isInteger(out) ? String(out) : out.toPrecision(8).replace(/\.?0+$/, '');
  }, [value, fromId, toId, units]);

  function changeCat(c: Category) {
    setCat(c);
    setFromId(UNITS[c][0].id);
    setToId(UNITS[c][1]?.id ?? UNITS[c][0].id);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {(Object.keys(UNITS) as Category[]).map((c) => (
          <button
            key={c}
            className={`${styles.tab} ${cat === c ? styles.tabActive : ''}`}
            onClick={() => changeCat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <select
          className={styles.select}
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
        >
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.arrow}>→</div>
      <div className={styles.row}>
        <div className={styles.result}>{result}</div>
        <select
          className={styles.select}
          value={toId}
          onChange={(e) => setToId(e.target.value)}
        >
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
