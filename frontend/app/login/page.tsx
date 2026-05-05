// app/login/page.tsx
"use client";

import Logo from "../components/Logo";
import { useState } from "react";
import { RiLockLine, RiEyeLine, RiEyeOffLine, RiInformationLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";

type Role = "admin" | "cashier";

const LoginPage = () => {
  const [role, setRole] = useState<Role>("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const getCredentials = () => {
    if (role === "admin") {
      return { username: "admin", password: "admin123" };
    } else {
      return { username: "cashier", password: "cashier123" };
    }
  };

  const handleLogin = async () => {
    if (!password.trim()) {
      setError("Please enter password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { username, password: correctPassword } = getCredentials();
      
      console.log(`Logging in as ${username} with password: ${password}`);
      
      const response = await api.post("/auth/login", null, {
        params: { username, password }
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        if (response.data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/pos");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const { username, password: correctPassword } = getCredentials();
      if (password !== correctPassword) {
        setError(`Wrong password! For ${role}, the password should be: ${correctPassword}`);
      } else {
        setError(err.response?.data?.detail || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const fillDemoPassword = () => {
    const { password: demoPassword } = getCredentials();
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <Logo className="text-3xl font-bold" />
        </div>

        <div className="text-center">
          <p className="text-lg text-base-content">Access your workspace</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setRole("admin");
              setPassword("");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition
              ${role === "admin"
                ? "bg-primary text-primary-content border-primary"
                : "bg-base-200 hover:bg-base-300"
              }`}
          >
            Administrator
          </button>

          <button
            onClick={() => {
              setRole("cashier");
              setPassword("");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition
              ${role === "cashier"
                ? "bg-primary text-primary-content border-primary"
                : "bg-base-200 hover:bg-base-300"
              }`}
          >
            Cashier
          </button>
        </div>

        {/* Password Hint */}
        <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg text-xs">
          <RiInformationLine className="text-info" />
          <span>
            Password for <strong>{role}</strong> is: <code className="font-mono font-bold">{getCredentials().password}</code>
          </span>
          <button
            onClick={fillDemoPassword}
            className="btn btn-xs btn-ghost ml-auto"
          >
            Auto-fill
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <RiLockLine className="absolute left-3 top-3 text-base-content/50" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Password"
            className="input input-bordered w-full pl-10 pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-base-content/50 hover:text-base-content"
          >
            {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner"></span> : "Sign In"}
        </button>

        <div className="text-center text-xs text-base-content/50 pt-4 border-t">
          <p>Demo Credentials:</p>
          <p className="mt-1">👑 Admin: admin / admin123</p>
          <p>🛒 Cashier: cashier / cashier123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;