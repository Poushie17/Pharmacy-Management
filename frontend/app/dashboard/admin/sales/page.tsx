// app/sales-history/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFReceipt } from "../../../components/PDFReceipt";

type Sale = {
  id: number;
  date: string;
  items: string;
  total: number;
  medicine_name: string;
  quantity: number;
  profit: number;
};

const SalesHistoryPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0
  });

  const API_URL = "http://localhost:8000";

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/sales/`);
      setSales(response.data);
      setFilteredSales(response.data);
      
      const totalRevenue = response.data.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
      const totalProfit = response.data.reduce((sum: number, sale: Sale) => sum + (sale.profit || 0), 0);
      
      setStats({
        totalSales: response.data.length,
        totalRevenue: totalRevenue,
        totalProfit: totalProfit
      });
      
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.detail || "Failed to fetch sales history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    let filtered = [...sales];
    
    if (search) {
      filtered = filtered.filter(sale => 
        sale.id.toString().includes(search)
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(sale => 
        sale.date.split(" ")[0] === dateFilter
      );
    }
    
    setFilteredSales(filtered);
  }, [search, dateFilter, sales]);

  if (loading && sales.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading sales history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Sales History</h1>
          <p className="text-sm text-base-content/70 mt-1">
            View and manage all your sales transactions
          </p>
        </div>
        <button 
          className="btn btn-outline btn-primary"
          onClick={fetchSales}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-primary text-primary-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">Total Sales</h2>
            <p className="text-3xl font-bold">{stats.totalSales}</p>
            <div className="text-xs opacity-70">All time sales</div>
          </div>
        </div>

        <div className="card bg-secondary text-secondary-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">Total Revenue</h2>
            <p className="text-3xl font-bold">৳{stats.totalRevenue.toFixed(2)}</p>
            <div className="text-xs opacity-70">Total sales value</div>
          </div>
        </div>

        <div className="card bg-accent text-accent-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">Total Profit</h2>
            <p className="text-3xl font-bold">৳{stats.totalProfit.toFixed(2)}</p>
            <div className="text-xs opacity-70">Net profit earned</div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label text-sm font-semibold">Search by Sale ID</label>
          <input
            type="text"
            placeholder="🔍 Enter sale ID..."
            className="input input-bordered w-full focus:input-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="label text-sm font-semibold">Filter by Date</label>
          <input
            type="date"
            className="input input-bordered w-full focus:input-primary"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {(search || dateFilter) && (
        <div className="flex justify-end">
          <button 
            className="btn btn-sm btn-ghost"
            onClick={() => {
              setSearch("");
              setDateFilter("");
            }}
          >
            Clear Filters ✕
          </button>
        </div>
      )}

      {/* SALES TABLE */}
      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Sale ID</th>
                  <th>Date & Time</th>
                  <th>Medicine</th>
                  <th>Quantity</th>
                  <th>Total (৳)</th>
                  <th>Profit (৳)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-base-content/50">
                      {sales.length === 0 ? (
                        <div>
                          <p>No sales found</p>
                          <p className="text-sm mt-1">Make your first sale from the POS page</p>
                        </div>
                      ) : (
                        "No sales match your filters"
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover">
                      <td className="font-mono font-bold">
                        <span className="badge badge-primary badge-sm mr-2">#{sale.id}</span>
                      </td>
                      <td className="text-sm">{sale.date}</td>
                      <td>{sale.medicine_name}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-outline">{sale.quantity}</span>
                        </div>
                      </td>
                      <td className="font-bold text-accent">৳{sale.total.toFixed(2)}</td>
                      <td className="text-success">৳{sale.profit?.toFixed(2) || "0.00"}</td>
                      <td>
                        <PDFDownloadLink
                          document={<PDFReceipt sale={sale} />}
                          fileName={`receipt_${sale.id}.pdf`}
                        >
                          {({ loading, error }) => (
                            <button 
                              className="btn btn-xs btn-success"
                              disabled={loading}
                            >
                              {loading ? "Generating..." : "PDF"}
                            </button>
                          )}
                        </PDFDownloadLink>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer with stats */}
      {filteredSales.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-base-100 rounded-box shadow border">
          <div className="text-sm text-base-content/70">
            Showing {filteredSales.length} of {sales.length} sales
          </div>
          <div className="text-sm">
            <span className="font-bold">Filtered Total: </span>
            <span className="text-accent font-bold">
              ৳{filteredSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistoryPage;