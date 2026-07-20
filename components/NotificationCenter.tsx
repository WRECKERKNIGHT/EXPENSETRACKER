import React, { useState } from 'react';
import { Bell, Volume2, Clock, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { getNotificationPreferences, setNotificationPreferences } from '../services/themeService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'budget', title: 'Budget Alert', message: 'You are 85% of your Food budget', time: '2 hours ago', read: false },
    { id: 2, type: 'recurring', title: 'Recurring Bill', message: 'Your Netflix subscription is due tomorrow', time: '5 hours ago', read: false },
    { id: 3, type: 'savings', title: 'Savings Milestone', message: 'You have reached 50% of your vacation fund', time: 'Yesterday', read: true },
  ]);

  const [prefs, setPrefs] = useState(getNotificationPreferences());

  const handleToggle = (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setNotificationPreferences(updated);
  };

  const clearNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 w-full sm:w-96 h-screen bg-[#0f172a] border-l border-zinc-800 shadow-2xl z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="text-white" size={20} />
            <h2 className="text-lg font-bold text-white">Notifications</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-zinc-300">✕</button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Bell size={32} opacity={0.5} />
              <p className="mt-2 text-sm">All caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border ${
                  notif.read
                    ? 'bg-zinc-900/30 border-zinc-800'
                    : 'bg-indigo-600/10 border-indigo-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{notif.title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{notif.message}</p>
                    <p className="text-xs text-zinc-500 mt-1">{notif.time}</p>
                  </div>
                  <button
                    onClick={() => clearNotification(notif.id)}
                    className="text-zinc-500 hover:text-white transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="border-t border-zinc-800 p-4 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase">Notification Settings</h3>
          {Object.entries(prefs).map(([key, value]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleToggle(key as keyof typeof prefs)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 cursor-pointer"
              />
              <span className="text-sm text-zinc-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
