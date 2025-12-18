
export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  NEUTRAL = 'NEUTRAL',
  STRONG_BUY = 'STRONG_BUY',
  STRONG_SELL = 'STRONG_SELL'
}

export enum MarketSentiment {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL',
  VOLATILE = 'VOLATILE'
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
}

export interface DailyOutlook {
  sentiment: MarketSentiment;
  summary: string;
  topNews: NewsItem[];
  timestamp: string;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  relativeVolume: number;
  history: PricePoint[];
}

export interface PricePoint {
  date: string;
  close: number;
  volume: number;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  timestamp: string;
  type: SignalType;
  reasoning: string;
  confidence: number;
  detectedPattern: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface SentMessage {
  id: string;
  to: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'failed';
}
