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

export default function NotFound({ type = 'not-found' }) {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);

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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');

        .not-found-page {
          font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif;
          min-height: 100vh;
          background: #0f0f1a;
          position: relative;
          overflow: hidden;
        }

        .bg-shapes {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.35;
        }

        .shape-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          top: -200px;
          right: -100px;
          animation: floatShape 20s ease-in-out infinite;
        }

        .shape-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #0f3460 0%, #1e5f8a 100%);
          bottom: 20%;
          left: -150px;
          animation: floatShape 25s ease-in-out infinite reverse;
        }

        .shape-3 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: 50%;
          right: -100px;
          animation: floatShape 18s ease-in-out infinite;
        }

        .shape-4 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: -100px;
          right: 30%;
          animation: floatShape 22s ease-in-out infinite reverse;
        }

        .shape-5 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 30%;
          left: 20%;
          animation: floatShape 28s ease-in-out infinite;
        }

        @keyframes floatShape {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 30px) scale(1.02); }
        }

        .floating-icon {
          position: absolute;
          font-size: 28px;
          opacity: 0.12;
          animation: floatIcon 6s ease-in-out infinite;
          z-index: 1;
        }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.12; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; }
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 0;
          background: rgba(15, 15, 26, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .navbar .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: #fff;
        }

        .brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 10px;
        }

        .brand-text {
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .lang-toggle-nav {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .lang-toggle-nav:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .error-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 2rem;
          position: relative;
          z-index: 10;
        }

        .error-section .container {
          max-width: 700px;
          text-align: center;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .error-section .container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .error-icon-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }

        .error-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          border-radius: 50%;
          filter: blur(60px);
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        }

        .error-icon {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: #fff;
          animation: iconFloat 4s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .error-icon-ring {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border: 2px solid rgba(233, 69, 96, 0.5);
          border-radius: 50%;
          animation: ringPulse 2s ease-out infinite;
        }

        .ring-2 {
          animation-delay: 0.5s;
        }

        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .error-title {
          font-size: 3rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gradient-text.from-red-500 {
          background: linear-gradient(135deg, #ef4444 0%, #f97316 0%, #eab308 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gradient-text.from-purple-600 {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 0%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .error-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .error-code {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          margin-bottom: 2.5rem;
        }

        .code-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
        }

        .code-value {
          color: #e94560;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .error-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.75rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.0625rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(233, 69, 96, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(233, 69, 96, 0.5);
        }

        .btn-outline {
          background: transparent;
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .btn-animate .btn-arrow {
          transition: transform 0.3s ease;
        }

        .btn-animate:hover .btn-arrow {
          transform: translateX(4px);
        }

        .error-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem 0;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-bottom {
          text-align: center;
        }

        .footer-bottom p {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .error-title {
            font-size: 2rem;
          }
          
          .error-description {
            font-size: 1rem;
          }
          
          .error-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
          
          .error-stats {
            flex-direction: column;
            gap: 1rem;
          }
          
          .stat-divider {
            width: 60px;
            height: 1px;
          }
        }
      `}</style>
    </div>
  );
}
