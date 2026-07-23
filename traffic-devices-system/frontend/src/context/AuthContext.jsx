import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDirectorate, setSelectedDirectorate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then((u) => {
          setUser(u);
          if (u.role !== 'super_admin' && u.role !== 'admin') {
            setSelectedDirectorate(String(u.directorate_id || ''));
          }
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.access_token);
    const me = await api.getMe();
    setUser(me);
    if (me.role !== 'super_admin' && me.role !== 'admin') {
      setSelectedDirectorate(String(me.directorate_id || ''));
    }
    return me;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSelectedDirectorate('');
  };

  const isCentral = ['super_admin', 'admin'].includes(user?.role);
  const activeDirectorateId = isCentral ? (selectedDirectorate || null) : user?.directorate_id;

  return (
    <AuthContext.Provider value={{
      user, login, logout, loading,
      isAdmin: user?.role === 'super_admin',
      isCentral,
      isManager: ['super_admin', 'admin', 'manager'].includes(user?.role),
      selectedDirectorate, setSelectedDirectorate,
      activeDirectorateId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
