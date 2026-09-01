import { useState, useEffect, useCallback } from 'react';
import styles from './Stocks.module.css';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Seed data — prices update with small random walk for demo feel
const SEED: Omit<Stock, 'price' | 'change' | 'changePercent'>[] = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NFLX', name: 'Netflix' },
  { symbol: 'AMD', name: 'AMD' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
];

const BASE_PRICES: Record<string, number> = {
  AAPL: 228.5,
  MSFT: 425.2,
  GOOGL: 178.4,
  AMZN: 185.6,
  NVDA: 128.3,
  TSLA: 248.9,
  META: 512.7,
  NFLX: 685.4,
  AMD: 142.1,
  SPY: 562.8,
};

function randomWalk(base: number): { price: number; change: number; changePercent: number } {
  const changePercent = (Math.random() - 0.48) * 3.5; // slight upward bias
  const change = (base * changePercent) / 100;
  const price = +(base + change).toFixed(2);
  return {
    price,
    change: +change.toFixed(2),
    changePercent: +changePercent.toFixed(2),
  };
}

function buildStocks(): Stock[] {
  return SEED.map((s) => {
    const base = BASE_PRICES[s.symbol] ?? 100;
    const { price, change, changePercent } = randomWalk(base);
    return { ...s, price, change, changePercent };
  });
}

export function Stocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    // Simulate brief network delay
    setTimeout(() => {
      setStocks(buildStocks());
      setLastUpdated(new Date());
      setLoading(false);
    }, 400);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Stock Market</h1>
          <p className={styles.desc}>
            Live-feel snapshot of popular stocks. Prices are simulated for demo (refresh every 30s).
            Click any ticker for real charts on Yahoo Finance.
          </p>
        </div>
        <button className="btn btn-primary" onClick={refresh} disabled={loading}>
          {loading ? 'Updating…' : 'Refresh'}
        </button>
      </div>

      {lastUpdated && (
        <p className={styles.updated}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th className={styles.right}>Price</th>
              <th className={styles.right}>Change</th>
              <th className={styles.right}>%</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s) => {
              const up = s.change >= 0;
              return (
                <tr key={s.symbol}>
                  <td>
                    <span className={styles.symbol}>{s.symbol}</span>
                  </td>
                  <td className={styles.name}>{s.name}</td>
                  <td className={styles.right}>
                    <span className={styles.price}>${s.price.toFixed(2)}</span>
                  </td>
                  <td className={styles.right}>
                    <span className={up ? styles.up : styles.down}>
                      {up ? '+' : ''}
                      {s.change.toFixed(2)}
                    </span>
                  </td>
                  <td className={styles.right}>
                    <span className={`${styles.badge} ${up ? styles.badgeUp : styles.badgeDown}`}>
                      {up ? '▲' : '▼'} {Math.abs(s.changePercent).toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <a
                      href={`https://finance.yahoo.com/quote/${s.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.chartLink}
                    >
                      Chart →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.note}>
        <strong>Note:</strong> This is a client-side demo with simulated prices. For real-time data,
        connect a free API key from{' '}
        <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer">
          Finnhub
        </a>{' '}
        or{' '}
        <a href="https://polygon.io" target="_blank" rel="noopener noreferrer">
          Polygon
        </a>
        .
      </div>
    </div>
  );
}
