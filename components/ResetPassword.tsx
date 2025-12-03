import React, { useState } from 'react';
import { resetPasswordAPI } from '../services/apiService';

const ResetPassword: React.FC<{ token?: string; onDone?: () => void }> = ({ token: initialToken, onDone }) => {
  const [token, setToken] = useState(initialToken || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!token) return setError('Reset token required');
    if (!password || password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      await resetPasswordAPI(token, password);
      setMessage('Password reset successful. You can now sign in.');
      setTimeout(() => {
        onDone && onDone();
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative font-sans">
      <div className="relative z-10 w-full max-w-md bg-[#121215]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[1.25rem] shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        <p className="text-sm text-zinc-400 mb-4">Enter the reset token and choose a new password.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Reset Token</label>
            <input value={token} onChange={(e) => setToken(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white" placeholder="paste token from email" />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white" placeholder="New password" />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white" placeholder="Confirm password" />
          </div>

          {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">{error}</div>}
          {message && <div className="text-emerald-300 text-sm bg-emerald-900/20 p-3 rounded-xl">{message}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 py-3 rounded-xl font-semibold hover:opacity-95">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
