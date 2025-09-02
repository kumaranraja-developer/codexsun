import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {useAppContext} from "../AppContaxt";

type User = {
  username: string;
  email?:string
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isInitialized: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { API_URL } = useAppContext(); // ✅ safe to use here

  useEffect(() => {
    if (!API_URL) return; // wait for app context to load

    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    const verifyToken = async () => {

      if (savedToken && savedUser) {
        try {
          const res = await fetch(`${API_URL}/api/protected`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (res.ok) {
            setToken(savedToken);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (err) {
          console.error("Token verification failed:", err);
        }
      }

      setIsInitialized(true);
    };

    verifyToken();
  }, [API_URL]);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
