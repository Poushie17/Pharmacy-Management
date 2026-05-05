// frontend/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/axios";

type User = {
  id: number;
  username: string;
  full_name: string;
  role: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCashier: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Sync with localStorage immediately (no async, no delay)
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing user:", e);
        }
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", null, {
        params: { username, password }
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Update state immediately
        setToken(token);
        setUser(user);
        
        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }
        
        // Redirect immediately
        if (user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/pos";
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    
    window.location.href = "/login";
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin, isCashier }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}