import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the current user details
  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get('/api/auth/me');
      setUser(data);
      return data;
    } catch (err) {
      setUser(null);
      throw err;
    }
  }, []);

  // Log in user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      setUser(data.user);
      return data.user;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up user, followed by automatic login
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const newUser = await api.post('/api/auth/signup', { name, email, password });
      // Automatically log in user after signup
      await login(email, password);
      return newUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Log out user
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  // Check auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } catch (err) {
        // Ignored, user is a guest/unauthenticated
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [refreshUser]);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
