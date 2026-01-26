import {useMutation} from '@tanstack/react-query';
import {useAuthContext} from '@/contexts/AuthContext';
import {LoginFormData} from '@/lib/validations/auth';
import {apiFetch, endpoints} from '@/lib/api';
import {setToken} from '@/lib/token';

interface AuthResponse {
  user: {
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
  };
  token: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

const loginRequest = (data: LoginFormData) =>
  apiFetch<AuthResponse>(endpoints.auth.login, {method: 'POST', body: data});

const signupRequest = (data: SignupData) =>
  apiFetch<AuthResponse>(endpoints.auth.signup, {method: 'POST', body: data});

export function useLogin() {
  const {setUser} = useAuthContext();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
    },
  });
}

export function useSignup() {
  const {setUser} = useAuthContext();

  return useMutation({
    mutationFn: signupRequest,
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
    },
  });
}
