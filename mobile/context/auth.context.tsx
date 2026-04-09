import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "../service/auth.service";

const TOKEN_KEY = "memorise_token";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  dark_theme: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (
    google_id: string,
    name: string,
    email: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura sessão ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          const me = await AuthService.getMe(saved);
          setToken(saved);
          setUser(me);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function saveSession(data: { token: string; user: User }) {
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    const data = await AuthService.login(email, password);
    await saveSession(data);
  }

  async function register(name: string, email: string, password: string) {
    await AuthService.register(name, email, password);
    // Faz login automaticamente após o cadastro
    await login(email, password);
  }

  async function loginWithGoogle(
    google_id: string,
    name: string,
    email: string,
  ) {
    const data = await AuthService.googleAuth(google_id, name, email);
    await saveSession(data);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
