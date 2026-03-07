import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

const TOKEN_KEY = 'convextoken';

interface AuthContextType {
  token: string | null;
  user: any | null; // using any temporarily, mapped to getMe return type
  isLoading: boolean;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  setToken: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch the user session securely if we have a token
  // If token is null, Convex just returns null immediately.
  const user = useQuery(api.auth.getMe, { token: token || '' });

  useEffect(() => {
    // Load persisted token from device storage on boot
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setTokenState(storedToken);
        }
      } catch (e) {
        console.error('Failed to load auth token', e);
      } finally {
        setIsInitializing(false);
      }
    };
    loadToken();
  }, []);

  const setToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
      setTokenState(newToken);
    } catch (e) {
      console.error('Failed to set auth token', e);
    }
  };

  const logout = async () => {
    await setToken(null);
  };

  // We are "loading" either if SecureStore hasn't resolved yet
  // OR if we have a token but Convex hasn't returned the user entity yet.
  const isConvexLoading = token !== null && user === undefined;
  const isLoading = isInitializing || isConvexLoading;

  return (
    <AuthContext.Provider value={{ token, user, isLoading, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
