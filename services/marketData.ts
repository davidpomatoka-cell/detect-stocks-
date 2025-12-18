
import { StockData, PricePoint } from '../types';
import { TICKERS } from '../constants.tsx';

export const generateStockHistory = (basePrice: number, volatility: number = 0.02): PricePoint[] => {
  const history: PricePoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const change = currentPrice * (Math.random() - 0.5) * volatility;
    currentPrice += change;
    
    // Simulate volume spikes randomly
    const isSpike = Math.random() > 0.9;
    const baseVolume = 1000000 + Math.random() * 500000;
    const volume = isSpike ? baseVolume * (2 + Math.random() * 3) : baseVolume;

    history.push({
      date: date.toISOString().split('T')[0],
      close: Number(currentPrice.toFixed(2)),
      volume: Math.floor(volume)
    });
  }
  return history;
};

export const fetchMarketSnapshot = async (): Promise<StockData[]> => {
  return TICKERS.map(t => {
    const basePrice = 100 + Math.random() * 500;
    const history = generateStockHistory(basePrice);
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    
    const avgVol = history.reduce((acc, curr) => acc + curr.volume, 0) / history.length;
    const relVol = last.volume / avgVol;

    return {
      symbol: t.symbol,
      name: t.name,
      price: last.close,
      change: last.close - prev.close,
      changePercent: ((last.close - prev.close) / prev.close) * 100,
      volume: last.volume,
      avgVolume: avgVol,
      relativeVolume: relVol,
      history
    };
  });
};
