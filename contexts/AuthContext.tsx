'use client';

import {createContext, useContext, ReactNode} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');

  if (!token) return null;

  const response = await fetch('/api/auth/me', {
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!response.ok) {
    localStorage.removeItem('token');
    return null;
  }

  const data = await response.json();

  return data ?? null;
}

export function AuthProvider({children}: {children: ReactNode}) {
  const queryClient = useQueryClient();

  const {data: user = null, isLoading} = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
    retry: false,
  });

  const setUser = (newUser: User | null) => {
    queryClient.setQueryData(['auth', 'me'], newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['auth', 'me'], null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
