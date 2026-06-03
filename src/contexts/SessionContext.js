import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../../service/api';

export const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Checks current session/user on mount
  useEffect(() => {
    async function loadSession() {
      try {
        // Retrieve token from local secure storage
        const storedToken = await SecureStore.getItemAsync('authToken');
        
        if (storedToken) {
          api.setToken(storedToken); // Set it in the API class
          const userData = await api.checkUser(); // Validate token with backend
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.log('Session re-hydration failed:', err.message);
        // Clear tokens if invalid
        api.setToken(null);
        await SecureStore.deleteItemAsync('authToken');
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  /**
   * Performs user login, sets the API token, and updates state.
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      
      // Expected response format usually contains the JWT token and user info
      const token = response.token;
      const userData = response.user || response;
      
      if (token) {
        api.setToken(token);
        // Save token locally
        await SecureStore.setItemAsync('authToken', token);
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      console.error('Login action failed:', err);
      throw err;
    }
  };

  /**
   * Registers a new user, updates token and state if the API auto-authenticates.
   * @param {object} userData
   */
  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      
      // If registration returns authentication payload
      const token = response.token;
      const userObj = response.user || response;
      
      if (token) {
        api.setToken(token);
        // Save token locally
        await SecureStore.setItemAsync('authToken', token);
      }
      if (userObj && token) {
        setUser(userObj);
        setIsAuthenticated(true);
      }
      return response;
    } catch (err) {
      console.error('Registration action failed:', err);
      throw err;
    }
  };

  /**
   * Logs out the user, clearing API tokens and resetting state.
   */
  const logout = async () => {
    try {
      api.setToken(null);
      // Delete token locally
      await SecureStore.deleteItemAsync('authToken');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout action failed:', err);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
export default SessionContext;
