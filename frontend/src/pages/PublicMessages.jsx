import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Phone, User, ArrowDown } from 'lucide-react';
import api from '../services/api';

export default function PublicMessages() {
  const [conversations, setConversations] = useState([]);
  const [activePhone, setActivePhone] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [publicTyping, setPublicTyping] = useState(false);
  const [sessionTyping, setSessionTyping] = useState({});
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef(null);
  const activePhoneRef = useRef(null);
  const messagesLenRef = useRef(0);
  const typingTimerRef = useRef(null);
  const isNearBottom = useRef(true);

  useEffect(() => {
    activePhoneRef.current = activePhone;
  }, [activePhone]);

  useEffect(() => {
    messagesLenRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => {
      loadConversations();
      const ph = activePhoneRef.current;
      if (ph) {
        loadMessagesSilent(ph);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, publicTyping]);

  async function loadConversations() {
    try {
      const res = await api.get('/public-messages/conversations');
      setConversations(res.data);
      const typing = {};
      for (const c of res.data) {
        if (c.last_public_typing_at) {
          const elapsed = Date.now() - new Date(c.last_public_typing_at).getTime();
          typing[c.phone] = elapsed < 1000;
        }
      }
      setSessionTyping(typing);

      if (activePhoneRef.current && typing[activePhoneRef.current]) {
        setPublicTyping(true);
      } else {
        setPublicTyping(false);
      }
    } catch { /* ignore */ }
  }

  async function loadMessages(phone) {
    setActivePhone(phone);
    setMessages([]);
    isNearBottom.current = true;
    try {
      const res = await api.get(`/public-messages/${encodeURIComponent(phone)}`);
      setMessages(res.data);
    } catch { /* ignore */ }
  }

  async function loadMessagesSilent(phone) {
    const oldLen = messagesLenRef.current;
    try {
      const res = await api.get(`/public-messages/${encodeURIComponent(phone)}`);
      setMessages(res.data);
      if (!isNearBottom.current && res.data.length > oldLen) {
        setShowScrollBtn(true);
      }
    } catch { /* ignore */ }
  }

  function handleScroll(e) {
    const el = e.target;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    isNearBottom.current = near;
    if (near) setShowScrollBtn(false);
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBtn(false);
    isNearBottom.current = true;
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (activePhoneRef.current) {
        api.post('/public-messages/typing-admin', { phone: activePhoneRef.current }).catch(() => {});
      }
    }, 300);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !activePhone) return;
    const msg = input.trim();
    setInput('');

    try {
      await api.post('/public-messages/reply', { phone: activePhone, message: msg });
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: msg,
        is_from_public: 0,
        created_at: new Date().toISOString(),
        name: 'Admin',
      }]);
      isNearBottom.current = true;
    } catch { /* ignore */ }
  }

  const activeConv = conversations.find(c => c.phone === activePhone);

  return (
    <div style={{ position: 'relative', display: 'flex', height: 'calc(100vh - 60px)', background: '#0f1a2e', color: '#eaf5ff', fontFamily: 'inherit' }}>
      {/* Conversation list */}
      <div style={{ width: 320, borderRight: '1px solid rgba(160,188,225,0.12)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(160,188,225,0.12)', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={20} style={{ color: '#28e7c5' }} />
          <span>Public Messages</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'rgba(160,188,225,0.4)', fontSize: '0.9rem' }}>
              No messages yet
            </div>
          )}
          {conversations.map(c => (
            <div
              key={c.phone}
              onClick={() => loadMessages(c.phone)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(160,188,225,0.06)',
                background: activePhone === c.phone ? 'rgba(40,231,197,0.08)' : 'transparent',
                borderLeft: activePhone === c.phone ? '3px solid #28e7c5' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <strong>{c.name}</strong>
                {c.token && <span style={{ fontSize: '0.7rem', color: 'rgba(233,69,96,0.6)', background: 'rgba(233,69,96,0.08)', padding: '1px 6px', borderRadius: 4 }}>{c.token}</span>}
                <span style={{ fontSize: '0.75rem', color: 'rgba(160,188,225,0.5)' }}>
                  {new Date(c.last_message_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'rgba(160,188,225,0.6)' }}>
                <Phone size={12} /> {c.phone}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: '0.8rem', alignItems: 'center' }}>
                <span style={{ color: 'rgba(160,188,225,0.4)' }}>{c.total_messages} msg</span>
                {parseInt(c.unread_count) > 0 && (
                  <span style={{ background: '#28e7c5', color: '#0a1628', borderRadius: 10, padding: '0 8px', fontWeight: 700 }}>
                    {c.unread_count} new
                  </span>
                )}
                {sessionTyping[c.phone] && (
                  <span style={{ color: '#28e7c5', fontSize: '0.75rem' }}>typing...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .typing-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(160,188,225,0.4);
          animation: msgTypingBounce 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes msgTypingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {!activePhone ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(160,188,225,0.3)', flexDirection: 'column', gap: 12 }}>
            <MessageSquare size={48} />
            <span>Select a conversation</span>
          </div>
        ) : (
          <>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(160,188,225,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(40,231,197,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#28e7c5' }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {activeConv?.name || 'Unknown'}
                  {activeConv?.token && <span style={{ fontSize: '0.7rem', color: 'rgba(233,69,96,0.7)', background: 'rgba(233,69,96,0.08)', padding: '1px 6px', borderRadius: 4 }}>{activeConv.token}</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(160,188,225,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> {activePhone}
                  {publicTyping && <span style={{ color: '#28e7c5', marginLeft: 8 }}>typing...</span>}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }} onScroll={handleScroll}>
              {messages.map(m => (
                <div key={m.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.is_from_public ? 'flex-start' : 'flex-end',
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: 16,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    background: m.is_from_public ? 'rgba(255,255,255,0.06)' : 'rgba(40,231,197,0.12)',
                    border: `1px solid ${m.is_from_public ? 'rgba(160,188,225,0.12)' : 'rgba(40,231,197,0.2)'}`,
                    color: '#eaf5ff',
                  }}>
                    {m.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(160,188,225,0.5)', marginTop: 4, padding: '0 4px' }}>
                    {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {!m.is_from_public && <span style={{ marginLeft: 6 }}>• Admin</span>}
                  </div>
                </div>
              ))}
              {publicTyping && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    fontSize: '0.9rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(160,188,225,0.12)',
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                  }}>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {showScrollBtn && (
              <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
                <button
                  onClick={scrollToBottom}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(40,231,197,0.3)',
                    background: 'rgba(9,22,42,0.9)', color: '#28e7c5', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} style={{
              display: 'flex', gap: 8, padding: '12px 14px',
              borderTop: '1px solid rgba(160,188,225,0.12)',
            }}>
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type a reply..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 12,
                  border: '1px solid rgba(160,188,225,0.18)',
                  background: 'rgba(255,255,255,0.06)', color: '#f7fbff',
                  fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button type="submit" disabled={!input.trim()} style={{
                width: 42, height: 42, borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #28e7c5, #5aa7ff)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default', opacity: input.trim() ? 1 : 0.4,
              }}>
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
