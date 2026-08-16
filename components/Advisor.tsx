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
    <div className="flex flex-col h-[650px] bg-surface backdrop-blur-md border border-app rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in font-sans">
      <div className="bg-surface-2 p-6 border-b border-app flex items-center gap-3">
        <div className="p-2 bg-gold/10 rounded-xl border border-gold/20 shadow-card-soft">
            <Sparkles className="w-5 h-5 text-gold" />
        </div>
        <h3 className="font-bold text-app text-lg text-glow-sm">Financial Advisor</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-brand-deep shadow-card-soft' : 'bg-surface-3 shadow-black/20'}`}>
                {msg.role === 'user' ? <User size={18} className="text-app" /> : <Bot size={18} className="text-gold" />}
              </div>
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-brand-deep text-white rounded-tr-none shadow-card-soft' 
                  : 'bg-surface-3 text-app rounded-tl-none border border-app'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
             <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center shadow-lg">
                <Bot size={18} className="text-gold" />
              </div>
              <div className="bg-surface-3 p-5 rounded-2xl rounded-tl-none border border-app flex items-center gap-2">
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 bg-surface-2 border-t border-app">
        <div className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your spending..."
            className="flex-1 bg-app-soft text-app rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand/40 border border-app shadow-inner placeholder:text-faint"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-brand-deep hover:brightness-110 disabled:opacity-50 disabled:hover:bg-brand-deep text-white px-6 rounded-2xl transition-all shadow-card"
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Advisor;