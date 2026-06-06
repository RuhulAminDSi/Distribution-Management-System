import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import { 
  Package, Eye, EyeOff, ArrowLeft,
  TrendingUp, Users, CreditCard,
  ShoppingCart, BarChart3, Building2, Truck,
  Circle
} from 'lucide-react';

const floatingIcons = [
  { icon: Package, delay: 0, x: '10%', y: '15%' },
  { icon: TrendingUp, delay: 0.5, x: '85%', y: '20%' },
  { icon: Users, delay: 1, x: '15%', y: '70%' },
  { icon: CreditCard, delay: 1.5, x: '80%', y: '65%' },
  { icon: ShoppingCart, delay: 2, x: '5%', y: '45%' },
  { icon: BarChart3, delay: 2.5, x: '90%', y: '45%' },
  { icon: Building2, delay: 3, x: '25%', y: '85%' },
  { icon: Truck, delay: 3.5, x: '75%', y: '85%' },
];

function OtpTimer({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0
  );
  const called = useRef(false);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0 && !called.current) {
        called.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  if (!expiresAt) return null;

  const total = 60;
  const pct = (remaining / total) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const color = remaining <= 10 ? '#e74c3c' : remaining <= 20 ? '#f39c12' : '#27ae60';
  const dash = 2 * Math.PI * 44;
  const offset = dash - (pct / 100) * dash;

  return (
    <div style={{ textAlign: 'center', marginTop: '8px' }}>
      <svg width="72" height="72" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto 4px' }}>
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border-color)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="44" fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={dash} strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s linear' }}
        />
        <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" fill={color} fontFamily="monospace">
          {remaining > 0
            ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
            : '✕'}
        </text>
      </svg>
    </div>
  );
}

export default function Login() {
  const { t, language, setLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMethod, setForgotMethod] = useState('email');
  const [otpStep, setOtpStep] = useState('request');
  const [otp, setOtp] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [showOtpPassword, setShowOtpPassword] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpRequestPhone, setOtpRequestPhone] = useState('');
  const [timerTick, setTimerTick] = useState(0);

  useEffect(() => {
    if (!otpExpiresAt) return;
    if (Date.now() >= otpExpiresAt) return;
    const id = setInterval(() => setTimerTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [otpExpiresAt]);
  const [isVisible, setIsVisible] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = `${t('SignIn') || 'Sign In'} - DMS`;
  }, [t]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Only redirect if not already authenticated
    if (user) return;
    
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (token && tokenExpiry && new Date(tokenExpiry) > new Date()) {
      sessionStorage.setItem('fromLanding', 'true');
      navigate('/dashboard');
    }
  }, [navigate, user]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(username, password);
      
      const token = localStorage.getItem('token') || 
        document.cookie.split('token=')[1]?.split(';')[0];
      if (token) {
        localStorage.setItem('token', token);
      }
      
      sessionStorage.setItem('fromLanding', 'true');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || '';
      if (errorMsg.includes('deactivated') || errorMsg.includes('নিষ্ক্রিয়')) {
        setError(t('AccountDeactivated'));
      } else {
        setError(t('LoginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotLoading(true);

    try {
      const response = await authService.forgotPassword({ email: forgotEmail });
      const msg = response.data.message || '';
      
      if (response.data.resetLink) {
        const link = response.data.resetLink;
        setForgotMessage(
          <div>
            <div>{msg}</div>
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <a
                href={link}
                className="btn btn-primary"
                style={{ display: 'inline-block', padding: '10px 20px', fontSize: '0.85rem', textDecoration: 'none' }}
              >
                {t('ResetPassword')}
              </a>
            </div>
          </div>
        );
      } else {
        setForgotMessage(msg);
      }
    } catch (error) {
        setForgotMessage(error.response?.data?.message || t('Error') + '. ' + t('TryAgain') + '.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (otpExpiresAt && Date.now() < otpExpiresAt && otpRequestPhone === otpPhone) {
      setOtpStep('verify');
      return;
    }

    setForgotMessage('');
    setForgotLoading(true);

    try {
      const response = await authService.requestOtp({ phone: otpPhone });
      if (response.data.success === false) {
        setForgotMessage(<div className="alert alert-info">{response.data.message}</div>);
        return;
      }
      setOtpStep('verify');
      setOtpExpiresAt(Date.now() + 60 * 1000);
      setOtpRequestPhone(otpPhone);
      if (response.data.otp) {
        setForgotMessage(
          <div className="alert alert-success">
            <div>{t('OtpSent')}</div>
            <div style={{ marginTop: '8px', fontSize: '24px', fontWeight: 700, textAlign: 'center', letterSpacing: '8px' }}>{response.data.otp}</div>
          </div>
        );
      } else {
        setForgotMessage(<div className="alert alert-success">{response.data.message || t('OtpSent')}</div>);
      }
    } catch (error) {
      setForgotMessage(error.response?.data?.message || t('Error') + '. ' + t('TryAgain') + '.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotLoading(true);

    try {
      await authService.verifyOtp({ phone: otpPhone, otp });
      setOtpStep('reset');
    } catch (error) {
      setForgotMessage(error.response?.data?.message || t('InvalidOtp'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetWithOtp = async (e) => {
    e.preventDefault();
    setForgotMessage('');

    if (otpNewPassword !== otpConfirmPassword) {
      setForgotMessage(t('PasswordMismatch'));
      return;
    }
    if (otpNewPassword.length < 6) {
      setForgotMessage(t('PasswordTooShort'));
      return;
    }

    setForgotLoading(true);

    try {
      await authService.resetPasswordWithOtp({ phone: otpPhone, otp, newPassword: otpNewPassword });
      setForgotMessage(
        <div className="alert alert-success">
          <div>{t('PasswordChanged')}</div>
        </div>
      );
      setTimeout(() => {
        setShowForgotForm(false);
        setForgotMethod('email');
        setOtpStep('request');
        setForgotMessage('');
        setOtpPhone('');
        setOtp('');
        setOtpNewPassword('');
        setOtpConfirmPassword('');
        setOtpExpiresAt(null);
        setOtpRequestPhone('');
        setForgotEmail('');
      }, 2000);
    } catch (error) {
      setForgotMessage(error.response?.data?.message || t('SaveError'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {floatingIcons.map((item, index) => (
        <div 
          key={index}
          className="floating-icon"
          style={{
            left: item.x,
            top: item.y,
            animationDelay: `${item.delay}s`
          }}
        >
          <item.icon size={32} />
        </div>
      ))}

      <div className={`login-container ${isVisible ? 'visible' : ''}`}>
        <div className="login-card">
          {!showForgotForm ? (
            <>
              <div className="login-header">
                <div className="login-logo">
                  <div className="logo-icon">
                    <Package size={32} />
                  </div>
                  <h1>DMS</h1>
                </div>
                <p className="login-subtitle">{t('WelcomeSubtitle')}</p>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">{t('Username')}, {t('Email')}, {t('Phone')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('Username') + ', ' + t('Email') + ', ' + t('Phone')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('Password')}
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                  {loading ? t('Loading') + '...' : t('Login')}
                  {!loading && <ArrowLeft size={18} className="btn-arrow" />}
                </button>

                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setShowForgotForm(true)}
                    style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}
                  >
                    {t('ForgotPassword')}
                  </button>
                </div>
              </form>

              <p className="login-link">
                {t('NoAccount')}{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => navigate('/register')}
                >
                  {t('CreateAccount')}
                </button>
              </p>

              <p className="helpline">
                {t('Helpline')}: <b>+880-173-8957729</b>
              </p>

              <div className="card-bottom-bar">
                <button
                  type="button"
                  className="card-bottom-btn"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft size={15} />
                  {t('Back')}
                </button>
                <button
                  type="button"
                  className="card-bottom-btn"
                  onClick={toggleLanguage}
                >
                  {language === 'en' ? 'বাংলা' : 'English'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="login-header">
                <div className="login-logo">
                  <div className="logo-icon">
                    <Package size={32} />
                  </div>
                  <h1>{t('ResetPassword')}</h1>
                </div>
                <p className="login-subtitle">{t('ForgotPasswordDesc')}</p>
              </div>

              {forgotMessage && (
                <div className={`alert ${typeof forgotMessage === 'string' ? (forgotMessage.includes('sent') || forgotMessage.includes('success') || forgotMessage.includes('link') ? 'alert-success' : 'alert-danger') : 'alert-success'}`}>
                  {forgotMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  className={`btn ${forgotMethod === 'email' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  onClick={() => { setForgotMethod('email'); setForgotMessage(''); setOtpStep('request'); }}
                >
                  {t('Email')}
                </button>
                <button
                  type="button"
                  className={`btn ${forgotMethod === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  onClick={() => { setForgotMethod('phone'); setForgotMessage(''); }}
                >
                  {t('Phone')} (OTP)
                </button>
              </div>

              {forgotMethod === 'email' ? (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label className="form-label">{t('Email')}</label>
                    <input
                      type="email"
                      className="form-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder={t('Email')}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary login-btn" disabled={forgotLoading}>
                    {forgotLoading ? t('Loading') + '...' : t('SendResetLink')}
                  </button>
                </form>
              ) : otpStep === 'request' ? (
                <form onSubmit={handleRequestOtp}>
                  <div className="form-group">
                    <label className="form-label">{t('Phone')}</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder={t('Phone')}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary login-btn" disabled={forgotLoading}>
                    {forgotLoading ? t('Loading') + '...' : t('SendOtp')}
                  </button>
                </form>
              ) : otpStep === 'verify' ? (
                <form onSubmit={handleVerifyOtp}>
                  <div className="form-group">
                    <label className="form-label">OTP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      required
                      style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '6px' }}
                    />
                    <OtpTimer expiresAt={otpExpiresAt} onExpire={() => setOtpStep('request')} />
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setOtpStep('request')}
                      disabled={otpExpiresAt && Date.now() < otpExpiresAt}
                      style={{ fontSize: '0.8rem', opacity: otpExpiresAt && Date.now() < otpExpiresAt ? 0.4 : 1, cursor: otpExpiresAt && Date.now() < otpExpiresAt ? 'not-allowed' : 'pointer' }}
                    >
                      {t('ResendOtp')}
                    </button>
                  </div>

                  <button type="submit" className="btn btn-primary login-btn" disabled={forgotLoading}>
                    {forgotLoading ? t('Loading') + '...' : t('VerifyOtp')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetWithOtp}>
                  <div className="form-group">
                    <label className="form-label">{t('NewPassword')}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showOtpPassword ? 'text' : 'password'}
                        className="form-input"
                        value={otpNewPassword}
                        onChange={(e) => setOtpNewPassword(e.target.value)}
                        placeholder={t('NewPassword')}
                        required
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtpPassword(!showOtpPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                      >
                        {showOtpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('ConfirmPassword')}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showOtpPassword ? 'text' : 'password'}
                        className="form-input"
                        value={otpConfirmPassword}
                        onChange={(e) => setOtpConfirmPassword(e.target.value)}
                        placeholder={t('ConfirmPassword')}
                        required
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtpPassword(!showOtpPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                      >
                        {showOtpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary login-btn" disabled={forgotLoading}>
                    {forgotLoading ? t('Loading') + '...' : t('ResetPassword')}
                  </button>
                </form>
              )}

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => { setShowForgotForm(false); setForgotMessage(''); setForgotEmail(''); setForgotMethod('email'); setOtpStep('request'); setOtpPhone(''); setOtp(''); setOtpNewPassword(''); setOtpConfirmPassword(''); }}
                  style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}
                >
                  {t('BackToLogin')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
          position: relative;
          overflow: hidden;
        }

        .login-bg-shapes {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .login-bg-shapes .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }

        .login-bg-shapes .shape-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          top: -150px;
          right: -100px;
          animation: floatShape 20s ease-in-out infinite;
        }

        .login-bg-shapes .shape-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #0f3460 0%, #1e5f8a 100%);
          bottom: -100px;
          left: -100px;
          animation: floatShape 25s ease-in-out infinite reverse;
        }

        .login-bg-shapes .shape-3 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulseShape 15s ease-in-out infinite;
        }

        .login-bg-shapes .shape-4 {
          width: 250px;
          height: 250px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: 20%;
          right: 10%;
          animation: floatShape 18s ease-in-out infinite;
        }

        .login-bg-shapes .shape-5 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 20%;
          left: 15%;
          animation: floatShape 22s ease-in-out infinite reverse;
        }

        @keyframes floatShape {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 30px) scale(1.02); }
        }

        @keyframes pulseShape {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
        }

        .floating-icon {
          position: fixed;
          color: rgba(255, 255, 255, 0.1);
          animation: floatIcon 8s ease-in-out infinite;
          z-index: 1;
        }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(10deg); }
        }

        .card-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-bottom-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 7px 14px;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.25s ease;
          font: inherit;
        }

        .card-bottom-btn:hover {
          background: rgba(233, 69, 96, 0.2);
          border-color: rgba(233, 69, 96, 0.4);
          color: #fff;
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 20px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .login-card {
          background: rgba(26, 26, 46, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(233, 69, 96, 0.2);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          animation: iconFloat 4s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .login-logo h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .login-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-input:focus {
          outline: none;
          border-color: #e94560;
          box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.2);
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          padding: 4px;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #fff;
        }

        .login-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(233, 69, 96, 0.4);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          transition: transform 0.3s ease;
        }

        .login-btn:hover .btn-arrow {
          transform: translateX(-4px);
        }

        .forgot-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .forgot-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.4);
          color: #fff;
        }

        .login-link {
          text-align: center;
          margin-top: 20px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .link-btn {
          background: none;
          border: none;
          color: #e94560;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: color 0.3s ease;
          padding: 0;
          font: inherit;
        }

        .link-btn:hover {
          color: #ff6b6b;
          text-decoration: underline;
        }

        .helpline {
          margin-top: 24px;
          text-align: center;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .helpline b {
          color: #e94560;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.875rem;
          margin-bottom: 20px;
        }

        .alert-danger {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 12px;
          }

          .login-card {
            padding: 24px 18px;
            border-radius: 18px;
          }
          
          .login-logo h1 {
            font-size: 2rem;
          }

          .login-header {
            margin-bottom: 24px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-input {
            padding: 12px 14px;
            font-size: 0.9rem;
          }

          .login-btn {
            padding: 14px;
            font-size: 0.95rem;
          }

          .forgot-btn {
            padding: 10px;
            font-size: 0.85rem;
          }

          .floating-icon {
            display: none;
          }

          .card-bottom-bar {
            flex-direction: column;
            gap: 8px;
          }

          .card-bottom-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
