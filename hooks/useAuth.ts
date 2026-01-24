import { useMutation } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { LoginFormData } from "@/lib/validations/auth";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
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

async function loginRequest(data: LoginFormData): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

async function signupRequest(data: SignupData): Promise<AuthResponse> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Signup failed");
  }

  return response.json();
}

export function useLogin() {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setUser(data.user);
    },
  });
}

export function useSignup() {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: signupRequest,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setUser(data.user);
    },
  });
}
