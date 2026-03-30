import { createContext, useContext, useState, useEffect } from 'react';
import api, { roleService, authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAll();
      const rolesData = response.data.data || [];
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      
      const rolesResponse = await roleService.getAll();
      const rolesData = rolesResponse.data.data || [];
      setRoles(rolesData);
      
      const roleFromDb = rolesData.find(r => r.name === userData.role);
      if (roleFromDb && roleFromDb.permissions) {
        setUserPermissions(roleFromDb.permissions);
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    await authService.login(username, password);
    await fetchUser();
    const currentUser = user || (await api.get('/auth/me')).data.user;
    return currentUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setUserPermissions([]);
  };

  const hasPermission = (permission) => {
    if (user?.role === 'system_admin' || user?.role === 'admin') return true;
    if (userPermissions.includes('all')) return true;
    return userPermissions.includes(permission);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const refreshRoles = () => {
    fetchRoles().then(() => {
      if (user) {
        fetchUser();
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, hasPermission, hasRole, userPermissions, roles, refreshRoles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
