'use client';

import {createContext, useContext, ReactNode} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {apiFetchSafe, apiFetch, endpoints} from '@/lib/api';
import {removeToken} from '@/lib/token';

interface User {
  id: string;
  email: string;
  name: string;
  username: string | null;
  cvUploadedAt: string | null;
  title: string | null;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
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
  return apiFetchSafe<User>(endpoints.auth.me);
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

  const logout = async () => {
    await apiFetch(endpoints.auth.logout, {method: 'POST'});
    removeToken();
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
