import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  getLoggedInUser,
  loginFrappe,
  logoutFrappe,
} from "../../../resources/global/api/frappeApi";
import { useAppContext } from "../AppContaxt";

interface AuthContextType {
  user: string | null;
  login: (usr: string, pwd: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: false,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { API_URL } = useAppContext();

  const checkUser = async () => {
    try {
      const username = await getLoggedInUser();
      setUser(username);
    } catch {
      console.warn("No user logged in or session expired");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!API_URL) return;
    checkUser();
  }, [API_URL]); // ✅ Only runs when API URL changes, not on user change

  const login = async (usr: string, pwd: string) => {
    setLoading(true);
    try {
      await loginFrappe(usr, pwd);
      await checkUser();
    } catch (e) {
      setUser(null);
      throw e; // Pass error upwards
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutFrappe();
      setUser(null);
      await checkUser();
    } catch (e) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useFrappeAuth() {
  return useContext(AuthContext);
}
