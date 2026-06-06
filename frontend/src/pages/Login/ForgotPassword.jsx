import { useState, useEffect } from 'react';
import { authService } from '../../services/api';
import { Package, Eye, EyeOff } from 'lucide-react';
import { OtpTimer } from './OtpTimer';

export default function ForgotPassword({ t, onBackToLogin }) {
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
        onBackToLogin();
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
          onClick={onBackToLogin}
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}
        >
          {t('BackToLogin')}
        </button>
      </div>
    </>
  );
}
