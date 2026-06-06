import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import { Warehouse, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const { t, language, setLanguage } = useLanguage();
  const toggleLanguage = () => setLanguage(language === 'en' ? 'bn' : 'en');

  useEffect(() => {
    document.title = `${t('ResetPassword') || 'Reset Password'} - DMS`;
  }, [t]);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('PasswordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('PasswordTooShort'));
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ token, newPassword: password });
      setSuccess(t('PasswordChanged') + '! ' + t('Redirecting') + '...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || t('SaveError'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <Warehouse size={48} />
            <h1>DMS</h1>
          </div>
          <div className="alert alert-danger">{t('InvalidCredentials')}. {t('TryAgain')}.</div>
          <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
            {t('BackToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Warehouse size={48} />
          <h1>{t('ResetPassword')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('EnterNewPassword')}</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('NewPassword')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('NewPassword')}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('ConfirmPassword')}</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('ConfirmPassword')}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('Loading') + '...' : t('ResetPassword')}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '10px' }}
            onClick={() => navigate('/login')}
          >
            {t('BackToLogin')}
          </button>
        </form>
      </div>
    </div>
  );
}
