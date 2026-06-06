import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import {
  Package,   Eye, EyeOff, ArrowLeft, UserPlus, Mail, Phone, User, Lock, AlertCircle, CheckCircle
} from 'lucide-react';
import './Register.css';

const floatingIcons = [
  { icon: UserPlus, delay: 0, x: '10%', y: '15%' },
  { icon: Mail, delay: 0.5, x: '85%', y: '20%' },
  { icon: Phone, delay: 1, x: '15%', y: '70%' },
  { icon: User, delay: 1.5, x: '80%', y: '65%' },
  { icon: Lock, delay: 2, x: '5%', y: '45%' },
  { icon: Eye, delay: 2.5, x: '90%', y: '45%' },
];

export default function Register() {
  const { t, language, setLanguage } = useLanguage();
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const checkTimers = useRef({});

  const checkField = async (field, value) => {
    if (!value) {
      setErrors(prev => ({ ...prev, [field]: '' }));
      return;
    }
    setValidating(prev => ({ ...prev, [field]: true }));
    try {
      const res = await authService.checkUnique(field, value);
      if (!res.data.unique) {
        const labels = { username: 'Username', email: 'Email', phone: 'Phone' };
        setErrors(prev => ({ ...prev, [field]: `${labels[field]} already exists` }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, [field]: '' }));
    } finally {
      setValidating(prev => ({ ...prev, [field]: false }));
    }
  };

  const debouncedCheck = (field, value) => {
    if (checkTimers.current[field]) {
      clearTimeout(checkTimers.current[field]);
    }
    checkTimers.current[field] = setTimeout(() => {
      checkField(field, value);
    }, 500);
  };

  const handleBlur = (field) => (e) => {
    debouncedCheck(field, e.target.value);
  };

  useEffect(() => {
    document.title = `${t('Register')} - DMS`;
  }, [t]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hasFieldErrors = Object.values(errors).some(msg => msg);
    if (hasFieldErrors) {
      setError('Please fix the highlighted errors before submitting');
      return;
    }

    if (form.password.length < 6) {
      setError(t('PasswordMinLength'));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t('PasswordsDoNotMatch'));
      return;
    }

    // Check uniqueness for all fields before submit
    const fieldsToCheck = ['username', 'email', 'phone'];
    for (const field of fieldsToCheck) {
      const val = form[field];
      if (val) {
        try {
          const res = await authService.checkUnique(field, val);
          if (!res.data.unique) {
            const labels = { username: 'Username', email: 'Email', phone: 'Phone' };
            setError(`${labels[field]} already exists`);
            return;
          }
        } catch {
          // ignore
        }
      }
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
        setError(messages || t('RegisterFailed'));
      } else {
        setError(msg || t('RegisterFailed'));
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
                <Package size={32} />
              </div>
              <h1>DMS</h1>
            </div>
            <p className="register-subtitle">{t('Subtitle')}</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label className="form-label">{t('FullName')}</label>
              <input
                type="text"
                className="form-input"
                value={form.full_name}
                onChange={updateField('full_name')}
                placeholder={t('FullName')}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('Username')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className={`form-input ${errors.username ? 'form-input-error' : ''}`}
                    value={form.username}
                    onChange={updateField('username')}
                    onBlur={handleBlur('username')}
                    placeholder={t('Username')}
                    required
                    autoComplete="off"
                  />
                  {validating.username && <div className="field-spinner" />}
                  {errors.username && <AlertCircle size={16} className="field-error-icon" />}
                  {!errors.username && form.username && !validating.username && <CheckCircle size={16} className="field-success-icon" />}
                </div>
                {errors.username && <span className="field-error-text">{errors.username}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('Email')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    value={form.email}
                    onChange={updateField('email')}
                    onBlur={handleBlur('email')}
                    placeholder={t('Email')}
                    autoComplete="off"
                  />
                  {validating.email && <div className="field-spinner" />}
                  {errors.email && <AlertCircle size={16} className="field-error-icon" />}
                  {!errors.email && form.email && !validating.email && <CheckCircle size={16} className="field-success-icon" />}
                </div>
                {errors.email && <span className="field-error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('Phone')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                  value={form.phone}
                  onChange={updateField('phone')}
                  onBlur={handleBlur('phone')}
                  placeholder={t('Phone')}
                  autoComplete="off"
                />
                {validating.phone && <div className="field-spinner" />}
                {errors.phone && <AlertCircle size={16} className="field-error-icon" />}
                {!errors.phone && form.phone && !validating.phone && <CheckCircle size={16} className="field-success-icon" />}
              </div>
              {errors.phone && <span className="field-error-text">{errors.phone}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('Password')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={form.password}
                    onChange={updateField('password')}
                    placeholder={t('Password')}
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
                <label className="form-label">{t('ConfirmPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    value={form.confirmPassword}
                    onChange={updateField('confirmPassword')}
                    placeholder={t('ConfirmPassword')}
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
              {loading ? t('Loading') + '...' : t('Register')}
              {!loading && <UserPlus size={18} className="btn-arrow" />}
            </button>
          </form>

          <p className="login-link">
            {t('AlreadyHaveAccount')}{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/login')}
            >
              {t('SignIn')}
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
        </div>
      </div>

    </div>
  );
}