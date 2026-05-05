// app/components/layout/Menu.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  RiDashboardLine,
  RiStore2Line,
  RiShoppingCartLine,
  RiHistoryLine,
  RiTruckLine,
  RiUser3Line,
  RiFileList3Line,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiMedicineBottleLine,
} from "react-icons/ri";

import Logo from "../Logo";

const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read directly from localStorage
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

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: RiDashboardLine, roles: ["admin"] },
    { name: "Stock", href: "/stock", icon: RiStore2Line, roles: ["admin", "cashier"] },
    { name: "POS", href: "/pos", icon: RiShoppingCartLine, roles: ["admin", "cashier"] },
    { name: "Sales", href: "/sales-history", icon: RiHistoryLine, roles: ["admin", "cashier"] },
    { name: "Restocking", href: "/restock", icon: RiTruckLine, roles: ["admin"] },
    { name: "Suppliers", href: "/suppliers", icon: RiUser3Line, roles: ["admin"] },
    { name: "Reports", href: "/reports", icon: RiFileList3Line, roles: ["admin"] },
    { name: "Prescriptions", href: "/prescriptions", icon: RiFileList3Line, roles: ["admin"] },
    { name: "Settings", href: "/settings", icon: RiSettings3Line, roles: ["admin"] },
  ];

  if (loading) {
    return (
      <div className="w-64 min-h-screen bg-base-100 border-r flex flex-col p-4 shadow-lg">
        <Logo className="text-2xl font-bold mb-6" />
        <div className="flex items-center justify-center flex-1">
          <span className="loading loading-spinner loading-md text-primary"></span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ""));

  return (
    <div className="w-64 min-h-screen bg-base-100 border-r flex flex-col p-4 shadow-lg">
      <Logo className="text-2xl font-bold mb-6" />

      <nav className="flex flex-col gap-2 flex-1">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition
                ${isActive 
                  ? "bg-primary text-primary-content" 
                  : "hover:bg-base-200"
                }`}
            >
              <Icon size={22} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-3 mt-3">
        <div className="mb-3 pb-2">
          <p className="text-xs text-base-content/50">Logged in as</p>
          <p className="text-sm font-semibold">{user?.full_name || user?.username}</p>
          <p className="text-xs text-primary capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
        >
          <RiLogoutBoxLine size={22} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Menu;