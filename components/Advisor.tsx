import React, { useState, useRef, useEffect } from 'react';
import { Expense, ChatMessage } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface AdvisorProps {
  expenses: Expense[];
}

const Advisor: React.FC<AdvisorProps> = ({ expenses }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI financial assistant powered by Gemini. Ask me about your spending habits, budget advice, or specific transactions.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for API (exclude the latest added message as it's passed as 'userMessage')
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const responseText = await getFinancialAdvice(history, expenses, userMsg.text);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error analyzing your finances. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-[#0f172a]/80 backdrop-blur-md border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in font-sans">
      <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <Sparkles className="w-5 h-5 text-teal-400" />
        </div>
        <h3 className="font-bold text-zinc-100 text-lg text-glow-sm">Financial Advisor</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-zinc-800 shadow-black/20'}`}>
                {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-teal-400" />}
              </div>
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-zinc-800/80 text-zinc-200 rounded-tl-none border border-zinc-700/50'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
             <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shadow-lg">
                <Bot size={18} className="text-teal-400" />
              </div>
              <div className="bg-zinc-800/80 p-5 rounded-2xl rounded-tl-none border border-zinc-700/50 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 bg-zinc-900/50 border-t border-zinc-800">
        <div className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your spending..."
            className="flex-1 bg-black/40 text-zinc-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-zinc-700/50 shadow-inner placeholder:text-zinc-600"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-6 rounded-2xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Advisor;