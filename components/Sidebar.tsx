
import React, { useState } from 'react';
import { Icons } from '../constants';
import { StockData, SentMessage } from '../types';

interface SidebarProps {
  stocks: StockData[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  messages: SentMessage[];
}

const Sidebar: React.FC<SidebarProps> = ({ stocks, selectedSymbol, onSelect, messages }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'messages'>('market');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-gray-800 h-screen overflow-hidden flex flex-col bg-gray-950/50 backdrop-blur-xl hidden lg:flex">
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Icons.Activity />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">TradePulse AI</h1>
          <p className="text-xs text-gray-500 uppercase font-semibold">Intelligence Terminal</p>
        </div>
      </div>

      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('market')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'market' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Tickers ({stocks.length})
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'messages' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Alerts {messages.length > 0 && <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[8px] flex items-center justify-center animate-pulse">{messages.length}</span>}
        </button>
      </div>

      {activeTab === 'market' && (
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <Icons.Search />
            </div>
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {activeTab === 'market' ? (
          <>
            <p className="px-2 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Companies</p>
            {filteredStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => onSelect(stock.symbol)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                  selectedSymbol === stock.symbol 
                    ? 'bg-indigo-600/10 border border-indigo-500/50 shadow-inner' 
                    : 'hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${stock.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div>
                    <div className="font-bold flex items-center gap-2">
                       {stock.symbol}
                       {stock.relativeVolume > 2 && (
                         <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 animate-pulse">VOL!</span>
                       )}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate w-32">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">${stock.price.toFixed(2)}</div>
                  <div className={`text-[10px] font-bold ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sent Alert History</p>
            {messages.length === 0 ? (
              <div className="text-center py-12 opacity-30 px-6">
                <Icons.Smartphone />
                <p className="text-xs mt-4">No alerts dispatched yet. Strong signals trigger automatic messaging.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 space-y-2 group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-indigo-400">ALERT: {msg.to}</span>
                    <span className="text-[9px] text-gray-600">{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-snug font-mono whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-tighter">Delivered via API</span>
                    </div>
                    <Icons.Check />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
