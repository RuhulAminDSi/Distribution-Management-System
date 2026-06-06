import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  AlertTriangle, 
  Package,
  Circle,
  ArrowRight,
  X
} from 'lucide-react';
import './NotFound.css';

export default function NotFound({ type = 'not-found' }) {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);

  useEffect(() => {
    document.title = 'Page Not Found - DMS';
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const icons = [
      { icon: '📦', delay: 0 },
      { icon: '📊', delay: 0.5 },
      { icon: '🏢', delay: 1 },
      { icon: '💰', delay: 1.5 },
      { icon: '🛒', delay: 2 },
      { icon: '📈', delay: 2.5 },
    ];
    setFloatingIcons(icons);
  }, []);

  const content = {
    'not-found': {
      title: t('notFoundTitle'),
      description: t('notFoundDesc'),
      icon: AlertTriangle,
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      glowColor: 'rgba(239, 68, 68, 0.5)',
    },
    'unauthorized': {
      title: t('unauthorizedTitle'),
      description: t('unauthorizedDesc'),
      icon: AlertTriangle,
      gradient: 'from-purple-600 via-pink-500 to-red-500',
      glowColor: 'rgba(147, 51, 234, 0.5)',
    }
  };

  const currentContent = content[type] || content['not-found'];
  const Icon = currentContent.icon;

  return (
    <div className="not-found-page">
      <div className="bg-shapes">
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
            left: `${10 + (index * 15)}%`,
            top: `${15 + (index * 12)}%`,
            animationDelay: `${item.delay}s`
          }}
        >
          {item.icon}
        </div>
      ))}

      <header className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              <span className="brand-icon">
                <Package size={24} />
              </span>
              <span className="brand-text">
                <span className="live-indicator"><Circle size={10} fill="#fff" /></span>
                DMS
              </span>
            </Link>
            
            <div className="navbar-actions">
              <button 
                className="lang-toggle-nav"
                onClick={() => setLanguage(lang => lang === 'en' ? 'bn' : 'en')}
              >
                {language === 'en' ? 'বাংলা' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="error-section">
        <div className={`container ${isVisible ? 'visible' : ''}`}>
          <div className="error-content">
            <div className="error-icon-wrapper">
              <div className="error-glow" style={{ background: currentContent.glowColor }}></div>
              <div className="error-icon">
                <Icon size={64} />
              </div>
              <div className="error-icon-ring"></div>
              <div className="error-icon-ring ring-2"></div>
            </div>

            <h1 className="error-title">
              <span className={`gradient-text ${currentContent.gradient}`}>
                {currentContent.title}
              </span>
            </h1>
            
            <p className="error-description">
              {currentContent.description}
            </p>

            <div className="error-code">
              <span className="code-label">Error Code:</span>
              <span className="code-value">{type === 'not-found' ? '404' : '401'}</span>
            </div>

            <div className="error-actions">
              {type === 'not-found' && !user && (
                <Link to="/" className="btn btn-primary btn-lg btn-animate">
                  <Home size={20} />
                  <span>{t('goToLanding')}</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </Link>
              )}

              {type === 'not-found' && user && (
                <>
                  <Link to="/" className="btn btn-outline btn-lg btn-animate">
                    <Home size={20} />
                    <span>{t('goToLanding')}</span>
                    <ArrowRight size={18} className="btn-arrow" />
                  </Link>
                  <Link to="/dashboard" className="btn btn-primary btn-lg btn-animate">
                    <LayoutDashboard size={20} />
                    <span>{t('goToDashboard')}</span>
                    <ArrowRight size={18} className="btn-arrow" />
                  </Link>
                </>
              )}

              {type === 'unauthorized' && (
                <button
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="btn btn-primary btn-lg btn-animate"
                >
                  <LayoutDashboard size={20} />
                  <span>{t('backToDashboard')}</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </button>
              )}
            </div>

            <div className="error-stats">
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">{t('Uptime')}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">{t('Support')}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">{t('Companies')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>© 2026 DMS. {t('AllRightsReserved')}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
