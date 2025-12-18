
import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { Icons } from '../constants';

interface NotificationCenterProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onDismiss }) => {
  const visibleNotifications = notifications.slice(0, 3); // Only show top 3

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 md:w-96 pointer-events-none">
      {visibleNotifications.map((n) => (
        <div 
          key={n.id}
          className="pointer-events-auto bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-slide-in"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div className={`mt-1 p-1.5 rounded-lg ${
            n.severity === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
            n.severity === 'warning' ? 'bg-amber-500/20 text-amber-500' :
            n.severity === 'error' ? 'bg-rose-500/20 text-rose-500' :
            'bg-indigo-500/20 text-indigo-500'
          }`}>
            <Icons.Bell />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-gray-100">{n.title}</h4>
            <p className="text-xs text-gray-400 mt-1">{n.message}</p>
            <p className="text-[10px] text-gray-600 mt-2 font-mono">{n.timestamp.toLocaleTimeString()}</p>
          </div>
          <button 
            onClick={() => onDismiss(n.id)}
            className="p-1 hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
