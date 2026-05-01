"use client";

import Menu from "../../../frontend/app/components/layout/Menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   
    <div className="drawer lg:drawer-open h-screen">

      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col h-full">

        <main className="flex-1 overflow-y-auto p-3 bg-base-200">
          {children}
        </main>

      </div>

      <div className="drawer-side">
        <Menu />
      </div>

    </div>
  );
}