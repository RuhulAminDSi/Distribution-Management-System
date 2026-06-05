import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Phone, User, KeyRound, ArrowDown, ArrowLeft, Warehouse, Package, Users, ShoppingCart, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './PublicChat.css';

const floatingIcons = [
  { icon: MessageSquare, delay: 0, x: '10%', y: '15%' },
  { icon: Package, delay: 0.5, x: '85%', y: '20%' },
  { icon: Users, delay: 1, x: '15%', y: '70%' },
  { icon: ShoppingCart, delay: 1.5, x: '80%', y: '65%' },
  { icon: CreditCard, delay: 2, x: '5%', y: '45%' },
  { icon: Send, delay: 2.5, x: '90%', y: '40%' },
];

export default function PublicChat() {
  useEffect(() => {
    document.title = 'Chat - DMS';
  }, []);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token');
  const urlPhone = searchParams.get('phone');
  const urlName = searchParams.get('name') || '';

  const [name, setName] = useState(urlName);
  const [phone, setPhone] = useState(urlPhone || '');
  const [token, setToken] = useState(urlToken || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [mode, setMode] = useState('form');
  const [dealerToken, setDealerToken] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const bottomRef = useRef(null);
  const tokenRef = useRef(urlToken);
  const typingTimerRef = useRef(null);
  const isNearBottom = useRef(true);
  const msgContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, adminTyping]);

  useEffect(() => {
    if (urlToken) {
      loadByToken(urlToken);
    } else if (urlPhone) {
      loadByPhone(urlPhone);
    }
  }, [urlToken, urlPhone]);

  useEffect(() => {
    if (!started || !token) return;
    const interval = setInterval(async () => {
      const tok = tokenRef.current;
      if (!tok) return;
      try {
        const res = await api.get(`/public-messages/by-token/${tok}`);
        const oldLen = messages.length;
        setMessages(res.data.messages);
        const s = res.data.session;
        const msgs = res.data.messages;
        const hasNewAdminMsg = msgs.length > oldLen && msgs.some((m, i) => i >= oldLen && !m.is_from_public);
        if (hasNewAdminMsg) {
          setAdminTyping(false);
        } else if (s && s.last_admin_typing_at) {
          const elapsed = Date.now() - new Date(s.last_admin_typing_at).getTime();
          setAdminTyping(elapsed < 1000);
        } else {
          setAdminTyping(false);
        }
        if (!isNearBottom.current && res.data.messages.length > oldLen) {
          setShowScrollBtn(true);
        }
      } catch { /* ignore */ }
    }, 1000);
    return () => clearInterval(interval);
  }, [started, token, messages.length]);

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
      if (tokenRef.current) {
        api.post('/public-messages/typing', { token: tokenRef.current }).catch(() => {});
      }
    }, 300);
  }

  async function loadByToken(tok) {
    setFetching(true);
    try {
      const res = await api.get(`/public-messages/by-token/${tok}`);
      const { session, messages: msgs } = res.data;
      setToken(session.token);
      setName(session.name);
      setPhone(session.phone);
      setMessages(msgs);
      isNearBottom.current = true;
      setStarted(true);
    } catch {
      setMessages([{ id: 0, message: t('SessionNotFound'), is_from_public: 1, created_at: new Date().toISOString() }]);
      setStarted(true);
    } finally {
      setFetching(false);
    }
  }

  async function loadByPhone(ph) {
    setFetching(true);
    try {
      const res = await api.get(`/public-messages/by-phone/${encodeURIComponent(ph)}`);
      const { session, messages: msgs } = res.data;
      setToken(session.token);
      setName(session.name);
      setPhone(session.phone);
      setMessages(msgs);
      isNearBottom.current = true;
      setStarted(true);
    } catch {
      setFetching(false);
    }
  }

  async function handleTokenSubmit(e) {
    e.preventDefault();
    if (!dealerToken.trim()) return;
    const tok = dealerToken.trim().toUpperCase();
    navigate(`/public-chat?token=${tok}`, { replace: true });
  }

  async function handleStart(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/public-messages/start-session', {
        name: name.trim(),
        phone: phone.trim(),
      });
      const { token: tok } = res.data;
      navigate(`/public-chat?token=${tok}&name=${encodeURIComponent(name.trim())}&phone=${encodeURIComponent(phone.trim())}`, { replace: true });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !token) return;
    const msg = input.trim();
    setInput('');
    setLoading(true);
    try {
      await api.post('/public-messages', { name, phone, token, message: msg });
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: msg,
        is_from_public: 1,
        created_at: new Date().toISOString(),
      }]);
      isNearBottom.current = true;
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  if (fetching) {
    return (
      <div className="chat-page">
        <div className="chat-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        <div className="chat-container visible">
          <div className="chat-card" style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>{t('Loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="chat-page">
        <div className="chat-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>

        {floatingIcons.map((item, index) => (
          <div key={index} className="floating-icon" style={{ left: item.x, top: item.y, animationDelay: `${item.delay}s` }}>
            <item.icon size={32} />
          </div>
        ))}

        <div className={`chat-container ${isVisible ? 'visible' : ''}`}>
          <div className="chat-card">
            <div className="chat-header">
              <div className="chat-logo">
                <div className="logo-icon"><MessageSquare size={28} /></div>
                <h1>{t('MessageWithDealer')}</h1>
              </div>
              <p className="chat-subtitle">{t('ChatSubtitle')}</p>
            </div>

            <div className="chat-mode-tabs">
              <button className={`mode-tab ${mode === 'form' ? 'active' : ''}`} onClick={() => setMode('form')}>
                <User size={14} /> {t('NewChat')}
              </button>
              <button className={`mode-tab ${mode === 'token' ? 'active' : ''}`} onClick={() => setMode('token')}>
                <KeyRound size={14} /> {t('TrackingCode')}
              </button>
            </div>

            {mode === 'form' ? (
              <form onSubmit={handleStart}>
                <div className="form-group">
                  <label className="form-label">{t('YourName')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('EnterYourName')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('MobileNumber')}</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t('EnterYourPhone')}
                    required
                  />
                </div>
                <button type="submit" className="chat-btn" disabled={loading}>
                  {loading ? t('Starting') : t('StartChat')} <Send size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleTokenSubmit}>
                <div className="form-group">
                  <label className="form-label">{t('TrackingCode')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={dealerToken}
                    onChange={e => setDealerToken(e.target.value)}
                    placeholder={t('EnterTrackingCode')}
                    required
                  />
                </div>
                <button type="submit" className="chat-btn" disabled={loading}>
                  {loading ? t('Checking') : t('ContinueChat')} <Send size={16} />
                </button>
              </form>
            )}

            <div className="card-bottom-bar">
              <button type="button" className="card-bottom-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={15} /> {t('Back')}
              </button>
              <button className="card-bottom-btn" onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}>
                {language === 'en' ? 'বাংলা' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-bg-shapes">
        <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>

      <div className={`chat-container ${isVisible ? 'visible' : ''}`}>
        <div className="chat-card chat-active">
          <div className="chat-header">
            <div className="chat-logo">
              <div className="logo-icon"><MessageSquare size={24} /></div>
              <h1>{t('MessageWithDealer')}</h1>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
              <User size={13} /> {name} &nbsp;|&nbsp; <Phone size={13} /> {phone}
            </div>
            {token && (
              <div className="chat-token">
                <KeyRound size={12} /> Code: <strong>{token}</strong>
              </div>
            )}
          </div>

          <div className="chat-messages" ref={msgContainerRef} onScroll={handleScroll}>
            {messages.length === 0 && !adminTyping && (
              <div className="chat-empty">
                <MessageSquare size={36} />
                <p>{t('SendFirstMessage')}</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`chat-msg ${m.is_from_public ? 'sent' : 'received'}`}>
                <div className="chat-bubble">{m.message}</div>
                <div className="chat-time">
                  {new Date(m.created_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  {!m.is_from_public && ` • ${t('Dealer')}`}
                </div>
              </div>
            ))}
            {adminTyping && (
              <div className="chat-msg received">
                <div className="chat-bubble typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
                <div className="chat-time">{t('DealerIsTyping')}</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showScrollBtn && (
            <button className="chat-scroll-btn" onClick={scrollToBottom}>
              <ArrowDown size={18} />
            </button>
          )}

          <form onSubmit={handleSend} className="chat-input-row">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
                placeholder={t('TypeYourMessage')}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>

          <div className="card-bottom-bar">
            <button type="button" className="card-bottom-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={15} /> {t('Back')}
            </button>
            <button className="card-bottom-btn" onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}>
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
