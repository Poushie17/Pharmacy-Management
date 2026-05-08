// app/sales-history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SalePDF } from "../components/SalePDF";
import {
  RiEyeLine,
  RiDownloadLine,
  RiRefreshLine,
  RiSearchLine,
  RiCalendarLine,
  RiAdminLine,
  RiUserStarLine,
  RiCloseLine,
} from "react-icons/ri";

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
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
    } catch (err) {
      console.error("Error parsing user:", err);
      router.push("/login");
      return;
    }
    
    fetchSales();
  }, [router]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sales/");
      setSales(response.data);
      setFilteredSales(response.data);

      const totalRevenue = response.data.reduce(
        (sum: number, sale: Sale) => sum + sale.total,
        0
      );
      const totalProfit = response.data.reduce(
        (sum: number, sale: Sale) => sum + (sale.profit || 0),
        0
      );

      setStats({
        totalSales: response.data.length,
        totalRevenue: totalRevenue,
        totalProfit: totalProfit,
      });

      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        setError(err.response?.data?.detail || "Failed to fetch sales history");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...sales];

    if (search) {
      filtered = filtered.filter((sale) =>
        sale.id.toString().includes(search)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (sale) => sale.date.split(" ")[0] === dateFilter
      );
    }

    setFilteredSales(filtered);
  }, [search, dateFilter, sales]);

  const handleViewDetails = (sale: Sale) => {
    alert(`Sale Details:
ID: ${sale.id}
Date: ${sale.date}
Medicine: ${sale.medicine_name}
Quantity: ${sale.quantity}
Total: ৳${sale.total}
Profit: ৳${sale.profit || 0}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

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

  if (!user) return null;

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-4 p-4 md:p-6 pt-16 md:pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary">Sales History</h1>
          <p className="text-xs md:text-sm text-base-content/70 mt-1">
            View and download all your sales receipts
          </p>
          <div className="mt-2 flex items-center gap-2">
            {isAdmin ? (
              <>
                <RiAdminLine className="text-primary text-sm md:text-base" />
                <span className="badge badge-primary badge-sm">Admin Access</span>
              </>
            ) : (
              <>
                <RiUserStarLine className="text-secondary text-sm md:text-base" />
                <span className="badge badge-secondary badge-sm">Cashier Mode</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-primary btn-sm"
            onClick={fetchSales}
            disabled={loading}
          >
            <RiRefreshLine className="mr-1 md:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-error btn-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg text-sm">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="card bg-primary text-primary-content shadow-xl">
          <div className="card-body p-3 md:p-4">
            <h2 className="text-xs opacity-90">Total Sales</h2>
            <p className="text-2xl md:text-3xl font-bold">{stats.totalSales}</p>
            <div className="text-xs opacity-70">All time sales</div>
          </div>
        </div>

        <div className="card bg-secondary text-secondary-content shadow-xl">
          <div className="card-body p-3 md:p-4">
            <h2 className="text-xs opacity-90">Total Revenue</h2>
            <p className="text-xl md:text-3xl font-bold truncate">৳{stats.totalRevenue.toFixed(2)}</p>
            <div className="text-xs opacity-70">Total sales value</div>
          </div>
        </div>

        <div className="card bg-accent text-accent-content shadow-xl">
          <div className="card-body p-3 md:p-4">
            <h2 className="text-xs opacity-90">Total Profit</h2>
            <p className="text-xl md:text-3xl font-bold truncate">৳{stats.totalProfit.toFixed(2)}</p>
            <div className="text-xs opacity-70">Net profit earned</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label text-xs md:text-sm font-semibold">Search by Sale ID</label>
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 text-sm md:text-base" />
            <input
              type="text"
              placeholder="Enter sale ID..."
              className="input input-bordered w-full pl-9 md:pl-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label text-xs md:text-sm font-semibold">Filter by Date</label>
          <div className="relative">
            <RiCalendarLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 text-sm md:text-base" />
            <input
              type="date"
              className="input input-bordered w-full pl-9 md:pl-10 text-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(search || dateFilter) && (
        <div className="flex justify-end">
          <button
            className="btn btn-xs btn-ghost gap-1"
            onClick={() => {
              setSearch("");
              setDateFilter("");
            }}
          >
            <RiCloseLine className="text-sm" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Sales Table - Mobile Responsive */}
      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th className="text-xs md:text-sm">Sale ID</th>
                  <th className="text-xs md:text-sm hidden sm:table-cell">Date & Time</th>
                  <th className="text-xs md:text-sm">Medicine</th>
                  <th className="text-xs md:text-sm">Qty</th>
                  <th className="text-xs md:text-sm hidden sm:table-cell">Total (৳)</th>
                  <th className="text-xs md:text-sm hidden lg:table-cell">Profit (৳)</th>
                  <th className="text-xs md:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-base-content/50">
                      {sales.length === 0 ? (
                        <div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm">No sales found</p>
                          <p className="text-xs mt-1">
                            Make your first sale from the POS page
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm">No sales match your filters</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover">
                      <td className="font-mono font-bold text-xs md:text-sm">
                        <span className="badge badge-primary badge-xs md:badge-sm mr-1">
                          #{sale.id}
                        </span>
                      </td>
                      <td className="text-xs md:text-sm hidden sm:table-cell whitespace-nowrap">{sale.date}</td>
                      <td className="text-xs md:text-sm max-w-[120px] md:max-w-none truncate">{sale.medicine_name}</td>
                      <td className="text-xs md:text-sm text-center">
                        <span className="badge badge-outline badge-sm">{sale.quantity}</span>
                      </td>
                      <td className="font-bold text-accent text-xs md:text-sm hidden sm:table-cell">৳{sale.total.toFixed(2)}</td>
                      <td className="text-success text-xs md:text-sm hidden lg:table-cell">৳{sale.profit?.toFixed(2) || "0.00"}</td>
                      <td className="flex gap-1 md:gap-2">
                        <button
                          className="btn btn-xs btn-outline btn-info"
                          onClick={() => handleViewDetails(sale)}
                          title="View Details"
                        >
                          <RiEyeLine className="text-xs" />
                        </button>
                        <PDFDownloadLink
                          document={<SalePDF sale={sale} />}
                          fileName={`receipt_${sale.id}.pdf`}
                          className="btn btn-xs btn-outline btn-success"
                        >
                          {({ loading: pdfLoading }) => (
                            <span className="flex items-center gap-1">
                              <RiDownloadLine className="text-xs" />
                              <span className="hidden sm:inline">{pdfLoading ? "..." : "PDF"}</span>
                            </span>
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

      {/* Footer Stats */}
      {filteredSales.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 p-3 md:p-4 bg-base-100 rounded-box shadow border">
          <div className="text-xs text-base-content/70">
            Showing {filteredSales.length} of {sales.length} sales
          </div>
          <div className="text-xs">
            <span className="font-bold">Filtered Total: </span>
            <span className="text-accent font-bold">
              ৳
              {filteredSales
                .reduce((sum, sale) => sum + sale.total, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistoryPage;