"use client";

import {
  RiAlertLine,
} from "react-icons/ri";

const AdminDashboard = () => {
  

  return (
    <div className="space-y-4">

     
      
      {/* 📊 METRICS (3 CARDS PER ROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {[
          { label: "Medicines", value: 5 },
          { label: "Sales", value: 6 },
          { label: "Suppliers", value: 1 },
          { label: "Expiry Alert", value: 0 },
          { label: "Low Stock", value: 0 },
          { label: "Revenue", value: "TK12400.00" },
        ].map((item, i) => (
          <div key={i} className="card bg-base-100 shadow border">
            <div className="card-body p-4">
              <p className="text-xs opacity-60">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}

      </div>

      {/* 📈 CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* RECENT SALES */}
        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <h2 className="font-semibold mb-2">Recent Sales</h2>

            <ul className="text-sm space-y-2">
              <li>Sale #f36d1d — 9/9/2025 → <b>TK2000.00</b></li>
              <li>Sale #b65b87 — 8/24/2025 → <b>TK400.00</b></li>
            </ul>
          </div>
        </div>

        {/* EXPIRY ALERTS */}
        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <RiAlertLine /> Expiration Alerts
            </h2>

            <p className="text-sm opacity-70">
              Medicines expiring within 30 days:
            </p>

            <div className="mt-2 text-sm">
              No medicines expiring soon.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;