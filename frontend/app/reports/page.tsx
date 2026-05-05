// app/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import api from "../../lib/axios";  // Use api instead of axios
import {
  RiFilePdfLine,
  RiFileExcel2Line,
  RiDownloadLine,
  RiAlertLine,
  RiRefreshLine,
  RiCalendarLine,
  RiShoppingCartLine,
  RiMoneyDollarCircleLine,
  RiBarChart2Line,
} from "react-icons/ri";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

type ReportData = {
  summary: {
    revenue: number;
    transactions: number;
    avg: number;
    profit: number;
  };
  topSelling: Array<{
    name: string;
    units: number;
    total: number;
  }>;
  alerts: {
    lowStock: number;
    expiringSoon: number;
  };
  salesTrend: Array<{
    day: string;
    sales: number;
  }>;
  productSales: Array<{
    name: string;
    value: number;
  }>;
};

const ReportsPage = () => {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Use api.get instead of axios.get - this includes auth token
      const response = await api.get("/reports/dashboard", {
        params: { period, date }
      });
      setReportData(response.data);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.detail || "Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [period, date]);

  const exportToPDF = async () => {
    if (!reportData) return;
    
    try {
      setExporting(true);
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129);
      doc.text("PHARMAC+ PHARMACY", 20, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`Sales Report - ${period.toUpperCase()}`, 20, 35);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
      doc.text(`Period: ${date}`, 20, 52);
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Summary", 20, 70);
      
      autoTable(doc, {
        startY: 75,
        head: [["Metric", "Value"]],
        body: [
          ["Total Revenue", `৳ ${reportData.summary.revenue.toFixed(2)}`],
          ["Total Transactions", reportData.summary.transactions.toString()],
          ["Average Transaction", `৳ ${reportData.summary.avg.toFixed(2)}`],
          ["Total Profit", `৳ ${reportData.summary.profit.toFixed(2)}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      });
      
      const finalY = (doc as any).lastAutoTable?.finalY || 110;
      doc.text("Top Selling Medicines", 20, finalY + 15);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [["Medicine", "Units Sold", "Total Revenue"]],
        body: reportData.topSelling.map(item => [
          item.name,
          item.units.toString(),
          `৳ ${item.total.toFixed(2)}`
        ]),
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      });
      
      doc.save(`pharmac_report_${period}_${date}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      setError("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async (type: "sales" | "stock") => {
    try {
      setExporting(true);
      
      if (type === "sales") {
        const response = await api.get("/reports/export/sales");
        const ws = XLSX.utils.json_to_sheet(response.data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
        XLSX.writeFile(wb, `sales_report_${date}.xlsx`);
      } else {
        const response = await api.get("/reports/export/stock");
        const ws = XLSX.utils.json_to_sheet(response.data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock Report");
        XLSX.writeFile(wb, `stock_report_${new Date().toISOString().split("T")[0]}.xlsx`);
      }
    } catch (err) {
      console.error("Excel export error:", err);
      setError("Failed to export Excel file");
    } finally {
      setExporting(false);
    }
  };

  if (loading && !reportData) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Reports & Analytics</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Performance dashboard and sales insights
          </p>
        </div>
        <button 
          className="btn btn-outline btn-sm"
          onClick={fetchReportData}
          disabled={loading}
        >
          <RiRefreshLine className="mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error shadow-lg">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button 
          className="btn btn-primary btn-sm gap-2"
          onClick={exportToPDF}
          disabled={exporting}
        >
          <RiFilePdfLine /> {exporting ? "Generating..." : "Export PDF"}
        </button>

        <button 
          className="btn btn-outline btn-sm gap-2"
          onClick={() => exportToExcel("stock")}
          disabled={exporting}
        >
          <RiDownloadLine /> Stock Report
        </button>

        <button 
          className="btn btn-outline btn-sm gap-2"
          onClick={() => exportToExcel("sales")}
          disabled={exporting}
        >
          <RiFileExcel2Line /> Sales Excel
        </button>
      </div>

      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="label text-sm font-semibold">Report Period</label>
              <select
                className="select select-bordered w-full"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="daily">Daily Sales</option>
                <option value="weekly">Weekly Sales</option>
                <option value="monthly">Monthly Sales</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="label text-sm font-semibold">Reference Date</label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-primary to-primary-focus text-primary-content shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <h2 className="text-3xl font-bold">৳ {reportData.summary.revenue.toFixed(2)}</h2>
              </div>
              <RiMoneyDollarCircleLine className="text-3xl opacity-80" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-secondary to-secondary-focus text-secondary-content shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Transactions</p>
                <h2 className="text-3xl font-bold">{reportData.summary.transactions}</h2>
              </div>
              <RiShoppingCartLine className="text-3xl opacity-80" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-accent to-accent-focus text-accent-content shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Avg Transaction</p>
                <h2 className="text-3xl font-bold">৳ {reportData.summary.avg.toFixed(2)}</h2>
              </div>
              <RiBarChart2Line className="text-3xl opacity-80" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-info to-info-focus text-info-content shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Profit</p>
                <h2 className="text-3xl font-bold">৳ {reportData.summary.profit.toFixed(2)}</h2>
              </div>
              <RiMoneyDollarCircleLine className="text-3xl opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="font-semibold text-lg mb-3">Top Selling Medicines</h2>
            <div className="space-y-3">
              {reportData.topSelling.length === 0 ? (
                <p className="text-center text-base-content/50 py-8">No sales data available</p>
              ) : (
                reportData.topSelling.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-none">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-base-content/60">{item.units} units sold</p>
                    </div>
                    <p className="font-bold text-accent">৳ {item.total.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <RiAlertLine className="text-warning" />
              Stock Alerts
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                <div>
                  <p className="font-medium">Low Stock Items</p>
                  <p className="text-xs text-base-content/60">Stock below minimum level</p>
                </div>
                <span className={`badge ${reportData.alerts.lowStock > 0 ? "badge-error" : "badge-success"} text-lg px-3 py-2`}>
                  {reportData.alerts.lowStock}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                <div>
                  <p className="font-medium">Expiring Soon</p>
                  <p className="text-xs text-base-content/60">Expires within 30 days</p>
                </div>
                <span className={`badge ${reportData.alerts.expiringSoon > 0 ? "badge-warning" : "badge-success"} text-lg px-3 py-2`}>
                  {reportData.alerts.expiringSoon}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="font-semibold text-lg mb-4">Sales Trend</h2>
            {reportData.salesTrend.length === 0 ? (
              <p className="text-center text-base-content/50 py-8">No trend data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `৳ ${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="font-semibold text-lg mb-4">Sales by Product</h2>
            {reportData.productSales.length === 0 ? (
              <p className="text-center text-base-content/50 py-8">No product sales data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.productSales}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportData.productSales.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `৳ ${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-base-content/50 py-4">
        Report generated on {new Date().toLocaleString()} | Data based on {period} sales
      </div>
    </div>
  );
};

export default ReportsPage;