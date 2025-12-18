
import React from 'react';
import { StockData, TradingSignal, SignalType, DailyOutlook, MarketSentiment } from '../types';
import StockChart from './StockChart';
import { Icons } from '../constants';

interface SignalTerminalProps {
  stock: StockData;
  signal: TradingSignal | null;
  dailyOutlook: DailyOutlook | null;
  onRefresh: () => void;
  isLoading: boolean;
}

const SignalTerminal: React.FC<SignalTerminalProps> = ({ stock, signal, dailyOutlook, onRefresh, isLoading }) => {
  const getSignalColor = (type: SignalType) => {
    switch (type) {
      case SignalType.BUY:
      case SignalType.STRONG_BUY: return 'text-emerald-500';
      case SignalType.SELL:
      case SignalType.STRONG_SELL: return 'text-rose-500';
      default: return 'text-amber-500';
    }
  };

  const getSignalBg = (type: SignalType) => {
    switch (type) {
      case SignalType.BUY:
      case SignalType.STRONG_BUY: return 'bg-emerald-500/10 border-emerald-500/30';
      case SignalType.SELL:
      case SignalType.STRONG_SELL: return 'bg-rose-500/10 border-rose-500/30';
      default: return 'bg-amber-500/10 border-amber-500/30';
    }
  };

  const getSentimentStyles = (sentiment: MarketSentiment) => {
    switch (sentiment) {
      case MarketSentiment.BULLISH: return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case MarketSentiment.BEARISH: return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      case MarketSentiment.VOLATILE: return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      default: return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
      {/* Daily Market Pulse Banner */}
      {dailyOutlook && (
        <div className={`p-5 rounded-3xl border ${getSentimentStyles(dailyOutlook.sentiment).bg} ${getSentimentStyles(dailyOutlook.sentiment).border} backdrop-blur-md animate-fade-in`}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="md:border-r border-white/5 pr-6 min-w-[180px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getSentimentStyles(dailyOutlook.sentiment).color.replace('text', 'bg')} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${getSentimentStyles(dailyOutlook.sentiment).color.replace('text', 'bg')}`}></span>
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Market Pulse</p>
              </div>
              <h2 className={`text-2xl font-black ${getSentimentStyles(dailyOutlook.sentiment).color}`}>
                {dailyOutlook.sentiment}
              </h2>
            </div>
            
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-gray-300 leading-relaxed max-w-2xl">
                {dailyOutlook.summary}
              </p>
              <div className="flex flex-wrap gap-3">
                {dailyOutlook.topNews.map((news, idx) => (
                  <a 
                    key={idx} 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1 rounded-full text-gray-400 transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                    {news.title} • <span className="opacity-50">{news.source}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h2 className="text-4xl font-black">{stock.symbol}</h2>
             <span className="bg-gray-800 text-gray-400 text-sm px-3 py-1 rounded-full font-medium">NASDAQ</span>
          </div>
          <h3 className="text-xl text-gray-400 font-medium">{stock.name}</h3>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl min-w-[120px]">
             <p className="text-xs text-gray-500 font-bold uppercase mb-1">Current Price</p>
             <p className="text-2xl font-mono font-bold">${stock.price.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl min-w-[120px]">
             <p className="text-xs text-gray-500 font-bold uppercase mb-1">Volume (24h)</p>
             <p className="text-2xl font-mono font-bold">{(stock.volume / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl min-w-[120px]">
             <p className="text-xs text-gray-500 font-bold uppercase mb-1">Rel. Volume</p>
             <p className={`text-2xl font-mono font-bold ${stock.relativeVolume > 2 ? 'text-amber-500' : ''}`}>
               {stock.relativeVolume.toFixed(2)}x
             </p>
          </div>
        </div>
      </div>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
               <h4 className="font-bold flex items-center gap-2">
                 <Icons.Activity /> Performance 30D
               </h4>
               <div className="flex gap-2">
                  <button className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold">Price & Vol</button>
               </div>
            </div>
            <StockChart data={stock.history} color={stock.change >= 0 ? '#10b981' : '#f43f5e'} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-2xl">
                <p className="text-xs text-gray-500 mb-1">Avg Vol</p>
                <p className="font-mono text-sm">{(stock.avgVolume / 1000000).toFixed(1)}M</p>
             </div>
             <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-2xl">
                <p className="text-xs text-gray-500 mb-1">Day High</p>
                <p className="font-mono text-sm">${(stock.price * 1.02).toFixed(2)}</p>
             </div>
             <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-2xl">
                <p className="text-xs text-gray-500 mb-1">Day Low</p>
                <p className="font-mono text-sm">${(stock.price * 0.98).toFixed(2)}</p>
             </div>
             <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-2xl">
                <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                <p className="font-mono text-sm">Large Cap</p>
             </div>
          </div>
        </div>

        {/* Signal Column */}
        <div className="space-y-6">
          <div className="bg-gray-900/80 border border-gray-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Icons.Activity />
            </div>
            
            <div className="flex items-center justify-between mb-6">
               <h4 className="font-bold uppercase text-xs tracking-widest text-gray-400">AI Intelligence</h4>
               <button 
                 onClick={onRefresh}
                 disabled={isLoading}
                 className="p-2 hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
               >
                 <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/></svg>
               </button>
            </div>

            {isLoading ? (
              <div className="space-y-4 py-8">
                <div className="h-12 bg-gray-800 rounded-xl animate-pulse" />
                <div className="h-24 bg-gray-800 rounded-xl animate-pulse" />
                <div className="h-8 bg-gray-800 rounded-xl animate-pulse w-1/2" />
              </div>
            ) : signal ? (
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border ${getSignalBg(signal.type)}`}>
                  <p className="text-[10px] font-black uppercase mb-1 tracking-wider opacity-60">Verdict</p>
                  <p className={`text-3xl font-black ${getSignalColor(signal.type)}`}>{signal.type.replace('_', ' ')}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase mb-1 tracking-wider text-gray-500">Pattern Detected</p>
                    <p className="text-sm font-semibold text-white">{signal.detectedPattern}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black uppercase mb-1 tracking-wider text-gray-500">Analysis</p>
                    <p className="text-sm text-gray-400 leading-relaxed italic">"{signal.reasoning}"</p>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-gray-500">Confidence Score</span>
                      <span className="text-xs font-mono font-bold">{(signal.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${signal.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                 <p className="text-gray-500 text-sm">Start scanning to generate AI signals</p>
                 <button 
                  onClick={onRefresh}
                  className="mt-4 px-6 py-2 bg-indigo-600 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
                 >
                   Scan Ticker
                 </button>
              </div>
            )}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
            <h5 className="text-amber-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
               Scanner Warning
            </h5>
            <p className="text-xs text-amber-500/80 leading-snug">
              Relative volume is currently {stock.relativeVolume.toFixed(2)}x. 
              {stock.relativeVolume > 1.5 
                ? " Significant institutional activity detected. Watch for breakout." 
                : " Standard accumulation phase. No immediate breakout expected."}
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SignalTerminal;
