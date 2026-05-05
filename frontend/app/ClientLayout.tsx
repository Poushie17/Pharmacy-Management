// app/ClientLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import Menu from "./components/layout/Menu";
import Navbar from "./components/layout/Navbar";
import { useEffect, useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    // Directly read from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, [pathname]);

  // Don't show menu on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading only while checking
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center" data-theme="light">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  // If user exists, show full layout
  if (user) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Menu />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 bg-base-200">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // No user, redirect to login will happen in page component
  return <>{children}</>;
}