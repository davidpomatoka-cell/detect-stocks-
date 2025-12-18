
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import SignalTerminal from './components/SignalTerminal';
import NotificationCenter from './components/NotificationCenter';
import { StockData, TradingSignal, Notification, SignalType, DailyOutlook, MarketSentiment, SentMessage } from './types';
import { fetchMarketSnapshot } from './services/marketData';
import { analyzeStockSignal, getDailyMarketOverview } from './services/geminiService';
import { Icons, TICKERS } from './constants';

const App: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [signals, setSignals] = useState<Record<string, TradingSignal>>({});
  const [dailyOutlook, setDailyOutlook] = useState<DailyOutlook | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dispatchedMessages, setDispatchedMessages] = useState<SentMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scannerProgress, setScannerProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  const dispatchedIds = useRef(new Set<string>());

  const addNotification = useCallback((title: string, message: string, severity: Notification['severity'] = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      severity
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const dispatchMessageToUser = useCallback((stock: string, type: string, detail: string) => {
    const msgId = `${stock}-${type}-${new Date().toLocaleDateString()}`;
    if (dispatchedIds.current.has(msgId)) return;
    
    const newMessage: SentMessage = {
      id: Math.random().toString(36).substr(2, 9),
      to: "SMS USER",
      content: `⚠️ TRADE ALERT: ${stock}\nSIGNAL: ${type}\nDETAIL: ${detail}\nAnalyze now: https://tradepulse-ai.app/t/${stock}`,
      timestamp: new Date(),
      status: 'sent'
    };
    
    setDispatchedMessages(prev => [newMessage, ...prev]);
    dispatchedIds.current.add(msgId);
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Opportunity: ${stock}`, { body: `${type} detected. Check patterns.` });
    }
  }, []);

  const performAnalysis = useCallback(async (stock: StockData) => {
    setIsAnalyzing(true);
    const signal = await analyzeStockSignal(stock);
    setSignals(prev => ({ ...prev, [stock.symbol]: signal }));
    
    if (signal.type !== SignalType.NEUTRAL) {
      const isStrong = signal.type.includes('STRONG');
      addNotification(
        `${signal.type.replace('_', ' ')}: ${stock.symbol}`,
        `${signal.detectedPattern} - ${signal.reasoning.substring(0, 60)}...`,
        (signal.type.includes('BUY')) ? 'success' : 'warning'
      );

      // Threshold for messaging: High volume or strong technical conviction
      if (isStrong || signal.confidence > 0.8 || stock.relativeVolume > 2.2) {
        dispatchMessageToUser(stock.symbol, signal.type, signal.detectedPattern);
      }
    }
    setIsAnalyzing(false);
  }, [addNotification, dispatchMessageToUser]);

  const runDeepScanner = useCallback(async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScannerProgress(0);
    
    addNotification("Scanner Active", "Analyzing top 10 tickers for high-probability setups...", "info");

    // Scan top 10 tickers automatically for opportunities
    const toScan = stocks.slice(0, 10);
    for (let i = 0; i < toScan.length; i++) {
      setScannerProgress(Math.round(((i + 1) / toScan.length) * 100));
      await performAnalysis(toScan[i]);
      // Small delay to simulate processing
      await new Promise(r => setTimeout(r, 1500));
    }
    
    setIsScanning(false);
    addNotification("Scan Complete", "Market-wide sweep finished. Alerts dispatched where applicable.", "success");
  }, [stocks, isScanning, performAnalysis, addNotification]);

  const performDailyBriefing = useCallback(async () => {
    const outlook = await getDailyMarketOverview();
    setDailyOutlook(outlook);
    
    let severity: Notification['severity'] = 'info';
    if (outlook.sentiment === MarketSentiment.BULLISH) severity = 'success';
    if (outlook.sentiment === MarketSentiment.BEARISH) severity = 'error';
    if (outlook.sentiment === MarketSentiment.VOLATILE) severity = 'warning';

    addNotification(`Market Trend: ${outlook.sentiment}`, outlook.summary, severity);
    
    if (outlook.sentiment !== MarketSentiment.NEUTRAL) {
      dispatchMessageToUser('GLOBAL MARKET', outlook.sentiment, outlook.summary.substring(0, 50));
    }
  }, [addNotification, dispatchMessageToUser]);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const data = await fetchMarketSnapshot();
      setStocks(data);
      
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      await performDailyBriefing();
      setIsLoading(false);
      
      const first = data.find(s => s.symbol === 'AAPL') || data[0];
      if (first) performAnalysis(first);
    };
    initData();
  }, []);

  const handleStockSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    const stock = stocks.find(s => s.symbol === symbol);
    if (stock && !signals[symbol]) {
      performAnalysis(stock);
    }
  };

  const activeStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full" />
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-lg shadow-indigo-500/40" />
        </div>
        <div className="text-center px-6">
          <p className="font-black text-2xl tracking-widest uppercase text-white mb-2">TradePulse AI</p>
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.3em] animate-pulse">Initializing Global Scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      <Sidebar 
        stocks={stocks} 
        selectedSymbol={selectedSymbol} 
        onSelect={handleStockSelect} 
        messages={dispatchedMessages}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Deep Scanner Progress Bar */}
        {isScanning && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-900 z-50">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              style={{ width: `${scannerProgress}%` }}
            />
          </div>
        )}

        {/* Top Header / Scanner Controls */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/90 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Icons.Activity />
              </div>
              <span className="font-bold tracking-tight">Terminal</span>
            </div>
            
            <button 
              onClick={runDeepScanner}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isScanning 
                  ? 'bg-indigo-500/20 text-indigo-400 cursor-not-allowed border border-indigo-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95 border border-indigo-400/50'
              }`}
            >
              <Icons.Zap /> {isScanning ? `SCANNING ${scannerProgress}%` : 'RUN DEEP SCAN'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Connection Status</span>
              <span className="text-[10px] text-emerald-500 font-black uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> SMS GATEWAY ACTIVE
              </span>
            </div>
            <button className="p-2 bg-gray-900 border border-gray-800 rounded-lg relative hover:bg-gray-800 transition-colors">
               <Icons.Bell />
               {notifications.length > 0 && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full font-bold">
                   {notifications.length}
                 </span>
               )}
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <SignalTerminal 
          stock={activeStock} 
          signal={signals[selectedSymbol] || null} 
          dailyOutlook={dailyOutlook}
          onRefresh={() => performAnalysis(activeStock)}
          isLoading={isAnalyzing}
        />

        {/* Global UI Overlay Elements */}
        <NotificationCenter 
          notifications={notifications} 
          onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} 
        />
        
        {/* Terminal Footer */}
        <footer className="p-4 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-600 uppercase tracking-widest font-bold bg-gray-950/80 backdrop-blur gap-4">
          <div className="flex flex-wrap justify-center gap-4">
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Dispatcher v4.3.0</span>
             <span className="flex items-center gap-1 border-l border-gray-800 pl-4"><Icons.Smartphone /><span className="text-indigo-400">SMS Tunnel: Active</span></span>
             <span className="hidden md:inline border-l border-gray-800 pl-4">Tickers: {stocks.length}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-1.5">
               {stocks.slice(0, 6).map(s => (
                 <div key={s.symbol} title={s.symbol} className="w-6 h-6 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-[7px] text-white font-black hover:-translate-y-1 transition-transform cursor-pointer">{s.symbol[0]}</div>
               ))}
             </div>
             <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">GEMINI PRO 3.1</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
