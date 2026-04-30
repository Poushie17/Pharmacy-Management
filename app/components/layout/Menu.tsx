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
    { key: "dashboard", name: "Dashboard", icon: RiDashboardLine },
    { key: "stock", name: "Stock", icon: RiStore2Line },
    { key: "pos", name: "POS", icon: RiShoppingCartLine },
    { key: "sales", name: "Sales", icon: RiHistoryLine },
    { key: "restock", name: "Restocking", icon: RiTruckLine },
    { key: "suppliers", name: "Suppliers", icon: RiUser3Line },
    { key: "reports", name: "Reports", icon: RiFileList3Line },
    { key: "prescriptions", name: "Prescriptions", icon: RiFileList3Line },
    { key: "settings", name: "Settings", icon: RiSettings3Line },
  ];

  return (
    <div className="w-64 min-h-screen bg-base-100 border-r flex flex-col p-4">

      {/* BRAND */}
      <Logo className="text-2xl font-bold mb-6" />

      {/* MENU */}
      <nav className="flex flex-col gap-2 flex-1">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={`/dashboard/${item.key}`}
              className="
                flex items-center gap-3
                px-3 py-3 rounded-lg
                text-base font-medium
                hover:bg-base-200
                transition
              "
            >
              <Icon size={22} />
              <span>{item.name}</span>
            </Link>
          );
        })}

      </nav>

      {/* LOGOUT (DEV ONLY) */}
      <div className="border-t pt-3 mt-3">

        <button
          onClick={() => console.log("logout")}
          className="
            flex items-center gap-3
            px-3 py-3 w-full
            rounded-lg
            text-base font-medium
            text-red-500
            hover:bg-red-100
            transition
          "
        >
          <RiLogoutBoxLine size={22} />
          Logout
        </button>

      </div>

    </div>
  );
};

export default Menu;