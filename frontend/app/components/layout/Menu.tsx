"use client";

import Link from "next/link";
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
} from "react-icons/ri";

import Logo from "../Logo";

const Menu = () => {
  const menuItems = [
    { name: "Dashboard", href: "/dashboard/admin", icon: RiDashboardLine },
    { name: "Stock", href: "/dashboard/admin/stock", icon: RiStore2Line },
    { name: "POS", href: "/dashboard/admin/pos", icon: RiShoppingCartLine },
    { name: "Sales", href: "/dashboard/admin/sales", icon: RiHistoryLine },
    { name: "Restocking", href: "/dashboard/admin/restock", icon: RiTruckLine },
    { name: "Suppliers", href: "/dashboard/admin/suppliers", icon: RiUser3Line },
    { name: "Reports", href: "/dashboard/admin/report", icon: RiFileList3Line },
    { name: "Prescriptions", href: "/dashboard/admin/prescriptions", icon: RiFileList3Line },
    { name: "Settings", href: "/dashboard/admin/settings", icon: RiSettings3Line },
  ];

  return (
    <div className="w-64 min-h-screen bg-base-100 border-r flex flex-col p-4">

      <Logo className="text-2xl font-bold mb-6" />

      <nav className="flex flex-col gap-2 flex-1">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-base-200 transition"
            >
              <Icon size={22} />
              <span>{item.name}</span>
            </Link>
          );
        })}

      </nav>

      <div className="border-t pt-3 mt-3">
        <button className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-red-500 hover:bg-red-100 transition">
          <RiLogoutBoxLine size={22} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default Menu;