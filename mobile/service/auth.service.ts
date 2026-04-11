import { authenticatedRequest, request } from "@/service/api.service";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  dark_theme: boolean;
  created_at?: string;
  _count?: {
    decks: number;
  };
};

type MessageResponse = {
  message: string;
};

type AuthSession = {
  message: string;
  token: string;
  user: AuthUser;
};

export const AuthService = {
  register: (name: string, email: string, password: string) =>
    request<MessageResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthSession>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    request<MessageResponse>("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  googleAuth: (idToken: string) =>
    request<AuthSession>("/auth/google-id-token", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  getMe: (token: string) =>
    authenticatedRequest<AuthUser>(token, "/me"),
};
