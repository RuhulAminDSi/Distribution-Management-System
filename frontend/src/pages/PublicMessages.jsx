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
      if (res.data.length > oldLen) {
        setPublicTyping(false);
        if (!isNearBottom.current) {
          setShowScrollBtn(true);
        }
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

  const styles = {
    wrap: {
      display: 'flex',
      height: 'calc(100vh - 120px)',
      background: 'var(--background)',
      color: 'var(--text-primary)',
      fontFamily: 'inherit',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid var(--border)',
    },
    sidebar: {
      width: 300,
      flexShrink: 0,
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarHeader: {
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)',
      fontWeight: 700,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      color: 'var(--text-primary)',
    },
    sidebarList: {
      flex: 1,
      overflowY: 'auto',
      minHeight: 0,
    },
    convItem: (active) => ({
      padding: '11px 14px',
      cursor: 'pointer',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: active ? 'rgba(233,69,96,0.08)' : 'transparent',
      borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
      transition: 'background 0.2s',
    }),
    convHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3,
    },
    convName: {
      fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)',
    },
    convToken: {
      fontSize: '0.65rem', color: 'rgba(233,69,96,0.6)', background: 'rgba(233,69,96,0.1)',
      padding: '1px 5px', borderRadius: 4, marginLeft: 6,
    },
    convDate: {
      fontSize: '0.72rem', color: 'var(--text-secondary)',
    },
    convMeta: {
      display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)',
    },
    convBadges: {
      display: 'flex', gap: 6, marginTop: 3, fontSize: '0.78rem', alignItems: 'center',
    },
    unreadBadge: {
      background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '0 7px',
      fontWeight: 700, fontSize: '0.7rem',
    },
    typingBadge: {
      color: 'var(--primary)', fontSize: '0.72rem',
    },
    chatArea: {
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative',
    },
    emptyState: {
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-secondary)', opacity: 0.4, flexDirection: 'column', gap: 12,
    },
    chatHeader: {
      padding: '12px 16px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
    },
    avatar: {
      width: 34, height: 34, borderRadius: '50%',
      background: 'rgba(233,69,96,0.12)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
    },
    chatName: {
      fontWeight: 600, fontSize: '0.9rem',
    },
    chatSub: {
      fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4,
    },
    messagesArea: {
      flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0,
    },
    bubble: (isPublic) => ({
      maxWidth: '75%',
      padding: '9px 13px',
      borderRadius: 16,
      fontSize: '0.88rem',
      lineHeight: 1.5,
      background: isPublic ? 'rgba(255,255,255,0.05)' : 'rgba(233,69,96,0.1)',
      border: `1px solid ${isPublic ? 'var(--border)' : 'rgba(233,69,96,0.2)'}`,
      color: 'var(--text-primary)',
    }),
    time: {
      fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 3, padding: '0 4px',
    },
    inputRow: {
      display: 'flex', gap: 8, padding: '10px 14px',
      borderTop: '1px solid var(--border)', flexShrink: 0,
    },
    inputField: {
      flex: 1, padding: '9px 13px', borderRadius: 10,
      border: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)',
      fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit',
    },
    sendBtn: (disabled) => ({
      width: 40, height: 40, borderRadius: 10, border: 'none',
      background: disabled ? 'rgba(233,69,96,0.3)' : 'var(--primary)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer',
    }),
    scrollBtn: {
      position: 'absolute', bottom: 66, left: '50%', transform: 'translateX(-50%)', zIndex: 2,
      width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(233,69,96,0.3)',
      background: 'var(--surface)', color: 'var(--primary)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    },
  };

  return (
    <>
      <style>{`
        .typing-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.35);
          animation: pmBounce 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pmBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>

      <div style={styles.wrap}>
        {/* Conversation list */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
            <span>Public Messages</span>
          </div>
          <div style={styles.sidebarList}>
            {conversations.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.5, fontSize: '0.85rem' }}>
                No messages yet
              </div>
            )}
            {conversations.map(c => (
              <div key={c.phone} onClick={() => loadMessages(c.phone)} style={styles.convItem(activePhone === c.phone)}>
                <div style={styles.convHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <span style={styles.convName}>{c.name}</span>
                    {c.token && <span style={styles.convToken}>{c.token}</span>}
                  </div>
                  <span style={styles.convDate}>
                    {new Date(c.last_message_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.convMeta}>
                  <Phone size={11} /> {c.phone}
                </div>
                <div style={styles.convBadges}>
                  <span style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>{c.total_messages} msg</span>
                  {parseInt(c.unread_count) > 0 && (
                    <span style={styles.unreadBadge}>{c.unread_count} new</span>
                  )}
                  {sessionTyping[c.phone] && (
                    <span style={styles.typingBadge}>typing...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={styles.chatArea}>
          {!activePhone ? (
            <div style={styles.emptyState}>
              <MessageSquare size={44} />
              <span>Select a conversation</span>
            </div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.avatar}><User size={17} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ ...styles.chatName, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {activeConv?.name || 'Unknown'}
                    {activeConv?.token && <span style={styles.convToken}>{activeConv.token}</span>}
                  </div>
                  <div style={styles.chatSub}>
                    <Phone size={10} /> {activePhone}
                    {publicTyping && <span style={{ color: 'var(--primary)', marginLeft: 6 }}>typing...</span>}
                  </div>
                </div>
              </div>

              <div style={styles.messagesArea} onScroll={handleScroll}>
                {messages.map(m => (
                  <div key={m.id} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: m.is_from_public ? 'flex-start' : 'flex-end',
                  }}>
                    <div style={styles.bubble(!!m.is_from_public)}>{m.message}</div>
                    <div style={styles.time}>
                      {new Date(m.created_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      {!m.is_from_public && <span style={{ marginLeft: 5 }}>• Admin</span>}
                    </div>
                  </div>
                ))}
                {publicTyping && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{
                      ...styles.bubble(true), padding: '11px 15px', display: 'flex', gap: 3,
                    }}>
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {showScrollBtn && (
                <div style={styles.scrollBtn}>
                  <button onClick={scrollToBottom} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}>
                    <ArrowDown size={17} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} style={styles.inputRow}>
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type a reply..."
                  style={styles.inputField}
                />
                <button type="submit" disabled={!input.trim()} style={styles.sendBtn(!input.trim())}>
                  <Send size={17} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
