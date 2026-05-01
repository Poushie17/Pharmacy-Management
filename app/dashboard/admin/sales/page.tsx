"use client";

import { useState } from "react";
import { sales } from "@/data/sales";

type Sale = {
  id: string;
  date: string;
  items: string;
  total: string;
};

const SalesHistoryPage = () => {
  const [search, setSearch] = useState("");

  const filteredSales = sales.filter((sale: Sale) =>
  sale.id.toLowerCase().includes(search.toLowerCase())
);

  const handleDownload = (sale: Sale) => {
    const content = `
Pharmac+ Receipt

Sale ID: ${sale.id}
Date: ${sale.date}
Items: ${sale.items}
Total: ${sale.total}

Thank you for using Pharmac+
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${sale.id}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <h2 className="text-sm opacity-70">Total Sales</h2>
            <p className="text-2xl font-bold">{sales.length}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <h2 className="text-sm opacity-70">Total Revenue</h2>
            <p className="text-2xl font-bold">TK 12400.00</p>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        <input
          type="text"
          placeholder="Search by sale ID..."
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="input input-bordered w-full"
        />

      </div>

      {/* TABLE */}
      <div className="card bg-base-100 shadow border overflow-x-auto">
        <div className="card-body">

          <table className="table w-full">

            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>

                  <td className="font-mono">{sale.id}</td>
                  <td>{sale.date}</td>
                  <td>{sale.items}</td>
                  <td className="font-bold">TK {sale.total}</td>

                  <td className="flex gap-2">

                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => alert("Viewing sale " + sale.id)}
                    >
                      View
                    </button>

                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => handleDownload(sale)}
                    >
                      Download
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
};

export default SalesHistoryPage;