import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import { Warehouse, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(t('LoginFailed'));
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
        setForgotMessage(
          <div>
            <div>{msg}</div>
            <div style={{ marginTop: '10px', fontSize: '12px', wordBreak: 'break-all' }}>
              <strong>Reset Link:</strong><br/>
              {response.data.resetLink}
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

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Warehouse size={48} />
          <h1>DMS</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('Sales')} Management System</p>
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('Loading') + '...' : t('Login')}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '10px' }}
            onClick={() => setShowForgotModal(true)}
          >
            {t('ForgotPassword')}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {t('Default')}: admin / admin123
        </p>
      </div>

      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('ResetPassword')}</h3>
              <button className="modal-close" onClick={() => setShowForgotModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div className="modal-body">
                <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                  {t('EnterAmount')} your {t('Email')} or {t('Phone')} and we'll send you a link to reset your {t('Password')}.
                </p>
                {forgotMessage && (
                  <div className={`alert ${typeof forgotMessage === 'string' && (forgotMessage.includes('sent') || forgotMessage.includes('success') || forgotMessage.includes('link')) ? 'alert-success' : 'alert-danger'}`}>
                    {forgotMessage}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{t('Email')} {t('or')} {t('Phone')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t('Email') + ' ' + t('or') + ' ' + t('Phone')}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? t('Loading') + '...' : t('SendResetLink')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
