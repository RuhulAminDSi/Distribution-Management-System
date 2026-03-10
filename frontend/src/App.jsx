import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Retailers from './pages/Retailers';
import Sales from './pages/Sales';
import Payments from './pages/Payments';
import Stock from './pages/Stock';
import Reports from './pages/Reports';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="retailers" element={<Retailers />} />
        <Route path="sales" element={<Sales />} />
        <Route path="payments" element={<Payments />} />
        <Route path="stock" element={<Stock />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
