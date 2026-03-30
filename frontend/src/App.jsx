import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Demo from './pages/Demo';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Products from './pages/Products';
import Retailers from './pages/Retailers';
import Sales from './pages/Sales';
import Payments from './pages/Payments';
import Stock from './pages/Stock';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function UnauthorizedHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleUnauthorized = () => {
      const isAuthPage = window.location.pathname === '/login';
      if (!isAuthPage) {
        navigate('/unauthorized', { replace: true });
      }
    };
    
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [navigate]);
  
  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <UnauthorizedHandler />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/login" element={<LoginWithAnimation />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
        </Route>
        
        <Route path="/companies" element={
          <PrivateRoute>
            <MainLayout><Companies /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/products" element={
          <PrivateRoute>
            <MainLayout><Products /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/retailers" element={
          <PrivateRoute>
            <MainLayout><Retailers /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/sales" element={
          <PrivateRoute>
            <MainLayout><Sales /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/payments" element={
          <PrivateRoute>
            <MainLayout><Payments /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/stock" element={
          <PrivateRoute>
            <MainLayout><Stock /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <MainLayout><Reports /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute>
            <MainLayout><Users /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <MainLayout><Settings /></MainLayout>
          </PrivateRoute>
        } />
        <Route path="/unauthorized" element={<NotFound type="unauthorized" />} />
        <Route path="*" element={<NotFound type="not-found" />} />
      </Routes>
    </LanguageProvider>
  );
}

function LoginWithAnimation() {
  const fromLanding = sessionStorage.getItem('fromLanding') === 'true';
  
  if (fromLanding) {
    sessionStorage.removeItem('fromLanding');
    return (
      <div className="page-transition">
        <Login />
        <style>{`
          @keyframes pageIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .page-transition {
            animation: pageIn 0.35s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }
  
  return <Login />;
}
