
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, User, Mail, Wallet, Shield, Trash2, LogOut, AlertTriangle, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  stats: { totalTx: number; joinDate: string };
  onLogout: () => void;
  onResetData: () => void;
  onDeleteAccount: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, onClose, user, stats, onLogout, onResetData, onDeleteAccount 
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-zinc-800 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
           <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors">
              <X size={20} />
           </button>
        </div>
        
        {/* Avatar */}
        <div className="px-6 relative">
           <div className="w-24 h-24 rounded-full bg-[#0f172a] p-1.5 absolute -top-12 left-6">
              <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-xl">
                 <User size={40} className="text-emerald-400" />
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-6 px-6">
           <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <div className="flex items-center gap-2 text-zinc-400 text-sm mt-1">
                 <Mail size={14} />
                 <span>{user.email}</span>
              </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Monthly Income</p>
                 <p className="text-emerald-400 font-mono font-bold">₹{user.monthlyIncome}</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Currency</p>
                 <p className="text-white font-mono font-bold">{user.currency}</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Transactions</p>
                 <p className="text-white font-mono font-bold">{stats.totalTx}</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Plan</p>
                 <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Shield size={12} fill="currentColor" /> Pro
                 </div>
              </div>
           </div>

           {/* Actions */}
           <div className="space-y-3">
              <button 
                onClick={onLogout}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-zinc-700"
              >
                 <LogOut size={18} /> Sign Out
              </button>

              <div className="pt-4 border-t border-zinc-800 mt-4">
                 <p className="text-xs text-zinc-500 font-bold uppercase mb-3">Danger Zone</p>
                 
                 {!confirmDelete ? (
                    <div className="flex gap-3">
                        <button 
                            onClick={onResetData}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl text-sm font-medium transition-all border border-red-500/20"
                        >
                            Reset Data
                        </button>
                        <button 
                            onClick={() => setConfirmDelete(true)}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl text-sm font-medium transition-all border border-red-500/20"
                        >
                            Delete Account
                        </button>
                    </div>
                 ) : (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl animate-fade-in">
                        <div className="flex items-center gap-3 mb-3 text-red-400">
                            <AlertTriangle size={20} />
                            <p className="text-sm font-bold">Are you sure? This is permanent.</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={onDeleteAccount}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14} /> Confirm Delete
                            </button>
                        </div>
                    </div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
