"use client";

const CashierDashboard = () => {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Cashier Dashboard</h1>
        <p className="text-sm opacity-60">
          Access POS, sales history, and prescriptions
        </p>
      </div>

      {/* QUICK NAV CARDS (NO DATA) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <a href="/dashboard/cashier/pos" className="bg-base-100 p-5 rounded-xl shadow hover:bg-base-200 transition">
          <h2 className="font-semibold text-lg">POS</h2>
          <p className="text-sm opacity-60">Create new sales</p>
        </a>

        <a href="/dashboard/cashier/sales" className="bg-base-100 p-5 rounded-xl shadow hover:bg-base-200 transition">
          <h2 className="font-semibold text-lg">Sales History</h2>
          <p className="text-sm opacity-60">View past transactions</p>
        </a>

        <a href="/dashboard/cashier/prescriptions" className="bg-base-100 p-5 rounded-xl shadow hover:bg-base-200 transition">
          <h2 className="font-semibold text-lg">Prescriptions</h2>
          <p className="text-sm opacity-60">Manage prescriptions</p>
        </a>

      </div>

      {/* INFO PANEL (NO DATA, JUST STRUCTURE) */}
      <div className="bg-base-100 p-6 rounded-xl shadow">
        <h2 className="font-semibold text-lg mb-2">Workspace</h2>
        <p className="text-sm opacity-70">
          Select a module from above to continue working.
        </p>
      </div>

    </div>
  );
};

export default CashierDashboard;