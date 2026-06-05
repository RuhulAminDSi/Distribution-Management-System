import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Bot, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './ChatBot.css';

const suggestions = [
  { label: '📊 Today Sales', msg: 'today sales' },
  { label: '📦 Total Products', msg: 'how many products' },
  { label: '⚠️ Low Stock', msg: 'low stock' },
  { label: '🕐 Pending Orders', msg: 'pending order' },
  { label: '💰 Outstanding', msg: 'total outstanding' },
  { label: '❓ Help', msg: 'help' },
  { label: '📤 Upload Guide', msg: 'how to upload a document' },
  { label: '🔍 Search Guide', msg: 'how to search' },
];

export default function ChatBot({ onToggle }) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'bot',
        text: '👋 Hi! I am the DMS chatbot. Ask me anything or tap a suggestion below.'
      }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(msg) {
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await api.post('/chatbot/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="chatbot-toggle-wrap">
        <button className={`chatbot-toggle ${open ? 'is-open' : ''}`} onClick={() => { const next = !open; setOpen(next); onToggle?.(next); }} aria-label="Toggle chatbot">
          {open ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
        {!open && <span className="fab-tooltip">{language === 'bn' ? 'সাহায্য ও তথ্য' : 'Help & info'}</span>}
      </div>

      <div className={`chatbot-window ${open ? 'is-open' : ''}`}>
        <div className="chatbot-header">
          <Bot size={20} />
          <span>DMS Assistant</span>
        </div>

        <div className="chatbot-body">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div className="chat-msg-icon">{m.role === 'bot' ? <Bot size={16} /> : <User size={16} />}</div>
              <div className="chat-msg-text">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg bot">
              <div className="chat-msg-icon"><Bot size={16} /></div>
              <div className="chat-msg-text typing"><span></span><span></span><span></span></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chatbot-suggestions">
          {(showAll ? suggestions : suggestions.slice(0, 3)).map((s, i) => (
            <button
              key={i}
              className="chip"
              onClick={() => sendMessage(s.msg)}
              disabled={loading}
            >
              {s.label}
            </button>
          ))}
          <button className="chip chip-toggle" onClick={() => setShowAll(o => !o)}>
            {showAll ? '▲ Show less' : '▼ More'}
          </button>
        </div>
      </div>
    </>
  );
}
