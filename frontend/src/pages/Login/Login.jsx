import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Package, Eye, EyeOff, ArrowLeft,
  TrendingUp, Users, CreditCard,
  ShoppingCart, BarChart3, Building2, Truck
} from 'lucide-react';
import ForgotPassword from './ForgotPassword';
import './Login.css';

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

export default function Login() {
  const { t, language, setLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
            <ForgotPassword t={t} onBackToLogin={() => setShowForgotForm(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
