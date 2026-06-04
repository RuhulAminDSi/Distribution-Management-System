import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import {
  Warehouse, Eye, EyeOff, ArrowLeft, UserPlus, Mail, Phone, User, Lock
} from 'lucide-react';

const translations = {
  en: {
    CreateAccount: 'Create Account',
    Subtitle: 'Register as a shopkeeper to start your business journey',
    FullName: 'Full Name',
    Username: 'Username',
    Email: 'Email',
    Phone: 'Phone',
    Password: 'Password',
    ConfirmPassword: 'Confirm Password',
    Register: 'Sign Up',
    AlreadyHaveAccount: 'Already have an account?',
    SignIn: 'Sign In',
    Error: 'Error',
    TryAgain: 'Please try again',
    Loading: 'Loading',
    Success: 'Account created successfully!',
    PasswordsDoNotMatch: 'Passwords do not match',
    PasswordMinLength: 'Password must be at least 6 characters',
    Helpline: 'Helpline',
    Back: 'Back',
    RegisterFailed: 'Registration failed. Please try again.',
  },
  bn: {
    CreateAccount: 'অ্যাকাউন্ট তৈরি করুন',
    Subtitle: 'আপনার ব্যবসা শুরু করতে দোকানদার হিসেবে রেজিস্টার করুন',
    FullName: 'পূর্ণ নাম',
    Username: 'ইউজারনেম',
    Email: 'ইমেইল',
    Phone: 'ফোন',
    Password: 'পাসওয়ার্ড',
    ConfirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    Register: 'সাইন আপ',
    AlreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    SignIn: 'সাইন ইন',
    Error: 'ত্রুটি',
    TryAgain: 'আবার চেষ্টা করুন',
    Loading: 'লোড হচ্ছে',
    Success: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
    PasswordsDoNotMatch: 'পাসওয়ার্ড মেলেনি',
    PasswordMinLength: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    Helpline: 'হেল্প লাইন',
    Back: 'ফিরুন',
    RegisterFailed: 'রেজিস্ট্রেশন ব্যর্থ। আবার চেষ্টা করুন।',
  }
};

const floatingIcons = [
  { icon: UserPlus, delay: 0, x: '10%', y: '15%' },
  { icon: Mail, delay: 0.5, x: '85%', y: '20%' },
  { icon: Phone, delay: 1, x: '15%', y: '70%' },
  { icon: User, delay: 1.5, x: '80%', y: '65%' },
  { icon: Lock, delay: 2, x: '5%', y: '45%' },
  { icon: Eye, delay: 2.5, x: '90%', y: '45%' },
];

export default function Register() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dms_language') || 'bn';
  });
  const t = translations[language];
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem('dms_language');
      if (savedLang && savedLang !== language) {
        setLanguage(savedLang);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const savedLang = localStorage.getItem('dms_language');
      if (savedLang && savedLang !== language) {
        setLanguage(savedLang);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('dms_language', newLang);
  };

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError(t.PasswordMinLength);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.PasswordsDoNotMatch);
      return;
    }

    setLoading(true);

    try {
      const response = await authService.shopkeeperRegister({
        username: form.username,
        password: form.password,
        full_name: form.full_name,
        email: form.email || undefined,
        phone: form.phone || undefined
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      sessionStorage.setItem('fromLanding', 'true');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) {
        const messages = Object.values(fieldErrors).join('. ');
        setError(messages || t.RegisterFailed);
      } else {
        setError(msg || t.RegisterFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-bg-shapes">
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

      <div className={`register-container ${isVisible ? 'visible' : ''}`}>
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">
              <div className="logo-icon">
                <Warehouse size={32} />
              </div>
              <h1>DMS</h1>
            </div>
            <p className="register-subtitle">{t.Subtitle}</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label className="form-label">{t.FullName}</label>
              <input
                type="text"
                className="form-input"
                value={form.full_name}
                onChange={updateField('full_name')}
                placeholder={t.FullName}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.Username}</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.username}
                  onChange={updateField('username')}
                  placeholder={t.Username}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.Email}</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder={t.Email}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.Phone}</label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={updateField('phone')}
                placeholder={t.Phone}
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.Password}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={form.password}
                    onChange={updateField('password')}
                    placeholder={t.Password}
                    required
                    style={{ paddingRight: '40px' }}
                    autoComplete="new-password"
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
              <div className="form-group">
                <label className="form-label">{t.ConfirmPassword}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    value={form.confirmPassword}
                    onChange={updateField('confirmPassword')}
                    placeholder={t.ConfirmPassword}
                    required
                    autoComplete="new-password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary register-btn" disabled={loading}>
              {loading ? t.Loading + '...' : t.Register}
              {!loading && <UserPlus size={18} className="btn-arrow" />}
            </button>
          </form>

          <p className="login-link">
            {t.AlreadyHaveAccount}{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/login')}
            >
              {t.SignIn}
            </button>
          </p>

          <p className="helpline">
            {t.Helpline}: <b>+880-173-8957729</b>
          </p>

          <div className="card-bottom-bar">
            <button
              type="button"
              className="card-bottom-btn"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={15} />
              {language === 'en' ? 'Back' : 'ফিরুন'}
            </button>
            <button
              type="button"
              className="card-bottom-btn"
              onClick={toggleLanguage}
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');

        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
          position: relative;
          overflow: hidden;
          font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif;
        }

        .register-bg-shapes {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .register-bg-shapes .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }

        .register-bg-shapes .shape-1 {
          width: 500px; height: 500px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          top: -150px; right: -100px;
          animation: floatShape 20s ease-in-out infinite;
        }

        .register-bg-shapes .shape-2 {
          width: 400px; height: 400px;
          background: linear-gradient(135deg, #0f3460 0%, #1e5f8a 100%);
          bottom: -100px; left: -100px;
          animation: floatShape 25s ease-in-out infinite reverse;
        }

        .register-bg-shapes .shape-3 {
          width: 300px; height: 300px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: pulseShape 15s ease-in-out infinite;
        }

        .register-bg-shapes .shape-4 {
          width: 250px; height: 250px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: 20%; right: 10%;
          animation: floatShape 18s ease-in-out infinite;
        }

        .register-bg-shapes .shape-5 {
          width: 200px; height: 200px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 20%; left: 15%;
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
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
          color: #fff;
        }

        .register-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 520px;
          padding: 20px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .register-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .register-card {
          background: rgba(26, 26, 46, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .register-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .register-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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

        .register-logo h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .register-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          margin: 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
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

        .register-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
          margin-top: 4px;
        }

        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        }

        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          transition: transform 0.3s ease;
        }

        .register-btn:hover .btn-arrow {
          transform: translateX(-4px);
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
          color: #6366f1;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: color 0.3s ease;
          padding: 0;
          font: inherit;
        }

        .link-btn:hover {
          color: #8b5cf6;
          text-decoration: underline;
        }

        .helpline {
          margin-top: 20px;
          text-align: center;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .helpline b {
          color: #6366f1;
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

        @media (max-width: 480px) {
          .register-card {
            padding: 24px 20px;
          }
          .register-logo h1 {
            font-size: 2rem;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}