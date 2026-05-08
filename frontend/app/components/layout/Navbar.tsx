// app/components/layout/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoMdNotificationsOutline } from "react-icons/io";
import { RiLogoutBoxRLine, RiUserLine } from "react-icons/ri";

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (loading) {
    return (
      <div className="navbar bg-base-100 shadow-md px-4 md:px-6 py-3 flex justify-between items-center border-b">
        <div className="flex flex-col">
          <span className="font-bold text-xl text-primary">Dashboard</span>
        </div>
        <div className="skeleton w-32 h-8 rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="navbar bg-base-100 shadow-md px-4 md:px-6 py-3 flex justify-between items-center border-b min-h-16">
      <div className="flex flex-col ml-8 md:ml-0">
        <span className="font-bold text-lg md:text-xl md:pl-0 pl-4 text-primary">
          {user?.role === "admin" ? "Admin Dashboard" : "POS System"}
        </span>
        <span className="text-xs text-base-content/60 hidden md:block">{today}</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-base-200">
          <RiUserLine className="text-base-content/70" />
          <span className="text-sm font-medium">{user?.full_name || user?.username}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {user?.role}
          </span>
        </div>

        <button className="btn btn-ghost btn-circle">
          <IoMdNotificationsOutline size={22} />
        </button>

        <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
          <svg className="h-5 w-5 md:h-6 md:w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.166 5.106a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 1 0 1.061-1.06l-1.59-1.591Z" />
          </svg>
        </button>

        <button
          onClick={handleLogout}
          className="btn btn-outline btn-error btn-sm gap-1 md:gap-2"
        >
          <RiLogoutBoxRLine />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;