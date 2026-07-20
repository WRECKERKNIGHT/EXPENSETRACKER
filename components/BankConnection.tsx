import React, { useState, useEffect } from 'react';
import { Category, Expense } from '../types';
import {
  getBankConnectionsAPI,
  disconnectBankAPI,
  connectBankAPI,
  getPlaidLinkTokenAPI,
  exchangePlaidTokenAPI,
  syncPlaidTransactionsAPI,
  getPlaidPendingAPI,
  labelPlaidTransactionAPI,
  importPlaidTransactionAPI,
} from '../services/apiService';
import {
  Link2,
  Unlink,
  RefreshCw,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
  Wallet,
} from 'lucide-react';

interface BankConnectionProps {
  onExpensesImported: (expenses: Expense[]) => void;
}

interface BankConnectionData {
  id: string;
  bankName: string;
  accountNumber: string;
  isConnected: boolean;
  lastSyncedAt: number | null;
  plaidAccessToken?: string;
}

interface PendingTransaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  merchantName?: string;
  pending: boolean;
  bankName: string;
}

const BankConnection: React.FC<BankConnectionProps> = ({ onExpensesImported }) => {
  const [connections, setConnections] = useState<BankConnectionData[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showManualConnect, setShowManualConnect] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [labelingTx, setLabelingTx] = useState<PendingTransaction | null>(null);
  const [labelText, setLabelText] = useState('');
  const [labelCategory, setLabelCategory] = useState<Category>(Category.OTHER);

  useEffect(() => {
    loadConnections();
    loadPendingTransactions();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await getBankConnectionsAPI();
      setConnections(data);
    } catch (err: any) {
      console.error('Failed to load connections:', err);
    }
  };

  const loadPendingTransactions = async () => {
    try {
      const data = await getPlaidPendingAPI();
      setPendingTransactions(data);
    } catch (err) {
      // Plaid might not be configured
    }
  };

  const handlePlaidConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const { link_token } = await getPlaidLinkTokenAPI();
      
      // In a real app, you'd use the Plaid Link SDK here
      // For now, we'll simulate the flow with a manual token exchange
      const publicToken = prompt(
        'Plaid Link would open here in production.\n\n' +
        'For development, paste a public_token from Plaid sandbox:'
      );
      
      if (!publicToken) {
        setLoading(false);
        return;
      }

      await exchangePlaidTokenAPI(publicToken, 'Connected Bank', '****' + Math.floor(1000 + Math.random() * 9000));
      setSuccess('Bank connected successfully!');
      await loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to connect bank');
    } finally {
      setLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (!bankName || !accountNumber) {
      setError('Please enter bank name and account number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await connectBankAPI(bankName, accountNumber);
      setSuccess(`${bankName} connected successfully!`);
      setShowManualConnect(false);
      setBankName('');
      setAccountNumber('');
      await loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);
    setError('');
    try {
      const result = await syncPlaidTransactionsAPI(connectionId);
      setSuccess(`Synced ${result.synced} new transactions!`);
      await loadConnections();
      await loadPendingTransactions();
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this bank?')) return;
    try {
      await disconnectBankAPI(connectionId);
      setSuccess('Bank disconnected');
      await loadConnections();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLabelTransaction = (tx: PendingTransaction) => {
    setLabelingTx(tx);
    setLabelText(tx.merchantName || tx.description);
    setLabelCategory(Category.OTHER);
  };

  const handleSaveLabel = async () => {
    if (!labelingTx || !labelText) return;
    try {
      await labelPlaidTransactionAPI(labelingTx.id, labelText, labelCategory);
      const imported = await importPlaidTransactionAPI(labelingTx.id);
      onExpensesImported([imported]);
      setPendingTransactions(prev => prev.filter(tx => tx.id !== labelingTx.id));
      setLabelingTx(null);
      setSuccess('Transaction imported!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Bank Connections</h3>
            <p className="text-sm text-zinc-400">Connect accounts to auto-sync transactions</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 animate-fade-in">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400 animate-fade-in">
          <CheckCircle2 size={18} />
          <span className="text-sm">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {/* Connect Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plaid Connect */}
        <button
          onClick={handlePlaidConnect}
          disabled={loading}
          className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 p-6 rounded-2xl flex flex-col items-center gap-4 transition-all hover:border-blue-500/50 hover:from-blue-600/30 hover:to-cyan-600/30 group"
        >
          <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            {loading ? (
              <Loader2 size={24} className="text-blue-400 animate-spin" />
            ) : (
              <Link2 size={24} className="text-blue-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-white font-bold">Connect via Plaid</p>
            <p className="text-xs text-zinc-400 mt-1">Auto-sync bank transactions</p>
          </div>
        </button>

        {/* Manual Connect */}
        <button
          onClick={() => setShowManualConnect(true)}
          className="bg-zinc-900/50 border border-zinc-700 p-6 rounded-2xl flex flex-col items-center gap-4 transition-all hover:border-zinc-500 hover:bg-zinc-800/50 group"
        >
          <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard size={24} className="text-zinc-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold">Manual Connect</p>
            <p className="text-xs text-zinc-400 mt-1">Add bank account details</p>
          </div>
        </button>
      </div>

      {/* Manual Connect Form */}
      {showManualConnect && (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl animate-fade-in space-y-4">
          <h4 className="font-bold text-white flex items-center gap-2">
            <Wallet size={18} className="text-zinc-400" />
            Add Bank Account
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-2">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., HDFC, SBI, ICICI"
                className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-2">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Last 4 digits"
                className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowManualConnect(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleManualConnect}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} />}
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Connected Banks */}
      {connections.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Connected Accounts</h4>
          {connections.map((conn) => (
            <div key={conn.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-bold">{conn.bankName}</p>
                  <p className="text-xs text-zinc-500">
                    {conn.accountNumber} · Last synced: {formatDate(conn.lastSyncedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {conn.plaidAccessToken && (
                  <button
                    onClick={() => handleSync(conn.id)}
                    disabled={syncing === conn.id}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-all text-emerald-400"
                    title="Sync Transactions"
                  >
                    {syncing === conn.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDisconnect(conn.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all text-red-400"
                  title="Disconnect"
                >
                  <Unlink size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Transactions Needing Labels */}
      {pendingTransactions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider flex items-center gap-2">
            <Tag size={14} />
            {pendingTransactions.length} Transaction{pendingTransactions.length > 1 ? 's' : ''} Need Labeling
          </h4>
          {pendingTransactions.map((tx) => (
            <div key={tx.id} className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                  {tx.amount > 0 ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{tx.merchantName || tx.description}</p>
                  <p className="text-xs text-zinc-500">{tx.date} · {tx.bankName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {tx.amount > 0 ? '-' : '+'} ₹{Math.abs(tx.amount).toFixed(2)}
                </span>
                <button
                  onClick={() => handleLabelTransaction(tx)}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Tag size={14} /> Label
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Label Modal */}
      {labelingTx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag size={20} className="text-orange-400" />
                Label Transaction
              </h3>
              <button onClick={() => setLabelingTx(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <p className="text-sm text-zinc-400">Original Description</p>
              <p className="text-white font-medium mt-1">{labelingTx.merchantName || labelingTx.description}</p>
              <p className="text-xs text-zinc-500 mt-1">{labelingTx.date} · ₹{Math.abs(labelingTx.amount).toFixed(2)}</p>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-2">
                What did you buy?
              </label>
              <input
                type="text"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                placeholder="e.g., Groceries, Wireless Headphones"
                className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-2">
                Category
              </label>
              <select
                value={labelCategory}
                onChange={(e) => setLabelCategory(e.target.value as Category)}
                className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setLabelingTx(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition-all"
              >
                Skip
              </button>
              <button
                onClick={handleSaveLabel}
                disabled={!labelText}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Save & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankConnection;
