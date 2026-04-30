"use client";

import Logo from "./components/Logo";
import { useState } from "react";
import { RiLockLine } from "react-icons/ri";

type Role = "admin" | "cashier";

const LoginPage = () => {
  const [role, setRole] = useState<Role>("admin");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!password.trim()) {
      alert("Enter password");
      return;
    }

    // frontend only (no redirect)
    localStorage.setItem("role", role);

    console.log("Role:", role);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl p-8 space-y-6">

        {/* LOGO */}
        <div className="text-center">
          <Logo className="text-3xl font-bold" />
        </div>

        {/* TEXT */}
        <div className="text-center">
          <p className="text-lg text-base-content">
            Access your workspace
          </p>
        </div>

        {/* ROLE SELECT */}
        <div className="flex gap-3">

          <button
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition
              ${role === "admin"
                ? "bg-primary text-primary-content border-primary"
                : "bg-base-200"}
            `}
          >
            Administrator
          </button>

          <button
            onClick={() => setRole("cashier")}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition
              ${role === "cashier"
                ? "bg-primary text-primary-content border-primary"
                : "bg-base-200"}
            `}
          >
            Cashier
          </button>

        </div>

        {/* PASSWORD */}
        <div className="relative">
          <RiLockLine className="absolute left-3 top-3 text-base-content/50" />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="btn btn-primary w-full"
        >
          Sign In
        </button>

      </div>

    </div>
  );
};

export default LoginPage;