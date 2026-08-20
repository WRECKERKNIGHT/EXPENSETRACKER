import React, { useState } from 'react';
import { parseSMSAPI } from '../services/apiService';
import { Expense } from '../types';

interface SmsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported?: () => void;
}

const SmsImportModal: React.FC<SmsImportModalProps> = ({ isOpen, onClose, onImported }) => {
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    setError(null);
    if (!text.trim()) {
      setError('Paste SMS text to parse');
      return;
    }

    setIsLoading(true);
    try {
      const parsed: any = await parseSMSAPI(text, sender || '');

      // Backend returns a transaction object; we just imported it
      // On success, refresh expenses and close
      setText('');
      setSender('');
      onImported && onImported();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to parse SMS');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xl p-4">
      <div className="w-full max-w-2xl bg-surface/90 backdrop-blur-xl border border-gold/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.5)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Import SMS Transactions</h3>
          <button onClick={onClose} className="text-soft hover:text-app">Close</button>
        </div>

        <p className="text-sm text-soft mb-4">Paste the raw SMS content below (you can paste multiple messages separated by newlines). Optionally enter the sender/bank name to assist parsing.</p>

        <div className="mb-3">
          <input
            placeholder="Sender (e.g., HDFCBNK)"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="input-glass w-full bg-app-soft border border-app rounded-lg px-3 py-2 text-app mb-2"
          />
          <textarea
            placeholder="Paste SMS content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="input-glass w-full bg-app-soft border border-app rounded-lg px-3 py-2 text-app font-mono"
          />
        </div>

        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-surface-3 text-soft">Cancel</button>
          <button onClick={handleParse} disabled={isLoading} className="px-4 py-2 rounded-lg bg-brand-deep text-white font-bold">
            {isLoading ? 'Parsing...' : 'Parse & Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmsImportModal;
