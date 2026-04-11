const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Unexpected error");
  return data;
}

export const AuthService = {
  register: (name: string, email: string, password: string) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    request("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  googleAuth: (idToken: string) =>
    request("/auth/google-id-token", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  getMe: (token: string) =>
    request("/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
};
