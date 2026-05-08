
"use client";

import { usePathname } from "next/navigation";
import Menu from "./Menu";
import Navbar from "./Navbar";
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
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Menu />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}