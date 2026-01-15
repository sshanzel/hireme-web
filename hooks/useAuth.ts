import { useMutation } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { LoginFormData } from "@/lib/validations/auth";

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
}

async function loginRequest(data: LoginFormData): Promise<LoginResponse> {
  // TODO: Replace with actual API endpoint
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

export function useLogin() {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
}
