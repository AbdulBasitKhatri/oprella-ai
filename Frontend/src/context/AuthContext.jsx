import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;

  return {
    ...userData,
    fullName: userData.fullName ?? userData.full_name ?? userData.name ?? '',
    is_onboarded: userData.is_onboarded ?? userData.isOnboarded ?? false,
  };
};

const getStoredSession = () => {
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');

  if (localToken) {
    const localUser = localStorage.getItem('user');
    return {
      token: localToken,
      user: localUser ? JSON.parse(localUser) : null,
    };
  }

  if (sessionToken) {
    const sessionUser = sessionStorage.getItem('user');
    return {
      token: sessionToken,
      user: sessionUser ? JSON.parse(sessionUser) : null,
    };
  }

  return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = getStoredSession();

      if (storedSession.token && storedSession.user) {
        setToken(storedSession.token);
        setUser(normalizeUser(storedSession.user));
      }
    } catch (e) {
      console.error('Failed to restore stored auth data:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (data, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const normalizedUser = normalizeUser(data?.user);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    if (data?.access_token) {
      storage.setItem('token', data.access_token);
    }

    if (normalizedUser) {
      storage.setItem('user', JSON.stringify(normalizedUser));
    }

    setToken(data?.access_token ?? null);
    setUser(normalizedUser);
  };

  const updateUser = (updatedUserFields) => {
    setUser((prev) => {
      const currentUser = normalizeUser(prev ?? JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'));
      const newObj = normalizeUser({ ...(currentUser || {}), ...(updatedUserFields || {}) });

      const storage = localStorage.getItem('token') ? localStorage : sessionStorage.getItem('token') ? sessionStorage : null;

      if (storage && newObj) {
        storage.setItem('user', JSON.stringify(newObj));
      }

      return newObj;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isOnboarded: user?.is_onboarded ?? false,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);