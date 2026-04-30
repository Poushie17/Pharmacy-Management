"use client";

import { useState } from "react";
import { reportData } from "@/data/reports";

import {
  RiFilePdfLine,
  RiFileExcel2Line,
  RiDownloadLine,
  RiAlertLine,
} from "react-icons/ri";

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
} from "recharts";

const ReportsPage = () => {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState("2025-09-10");

  const {
    summary,
    topSelling,
    alerts,
    salesTrend,
    productSales,
  } = reportData;

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">Reports</h1>
        <p className="text-sm opacity-70">Performance Dashboard</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary btn-sm gap-2">
          <RiFilePdfLine /> Export PDF
        </button>

        <button className="btn btn-outline btn-sm gap-2">
          <RiDownloadLine /> Stock Report
        </button>

        <button className="btn btn-outline btn-sm gap-2">
          <RiFileExcel2Line /> Sales Excel
        </button>

        <button className="btn btn-outline btn-sm gap-2">
          <RiFileExcel2Line /> Stock Excel
        </button>

        <button className="btn btn-ghost btn-sm">
          Detailed Report
        </button>
      </div>

      {/* FILTERS */}
      <div className="card bg-base-100 shadow border">
        <div className="card-body flex flex-col sm:flex-row gap-3">
          <select
            className="select select-bordered w-full sm:max-w-xs"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily Sales</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <input
            type="date"
            className="input input-bordered w-full sm:max-w-xs"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <p className="text-xs opacity-60">Total Revenue</p>
            <h2 className="text-2xl font-bold">
              TK {summary.revenue}
            </h2>
          </div>
        </div>

        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <p className="text-xs opacity-60">Total Transactions</p>
            <h2 className="text-2xl font-bold">
              {summary.transactions}
            </h2>
          </div>
        </div>

        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <p className="text-xs opacity-60">Average Transaction</p>
            <h2 className="text-2xl font-bold">
              TK {summary.avg}
            </h2>
          </div>
        </div>

        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <p className="text-xs opacity-60">Net Profit</p>
            <h2 className="text-2xl font-bold">
              TK {summary.profit}
            </h2>
          </div>
        </div>

      </div>

      {/* 🔥 ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* TOP SELLING */}
        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <h2 className="font-semibold mb-3">
              Top Selling Medicines
            </h2>

            {topSelling.map((item, i) => (
              <div
                key={i}
                className="flex justify-between py-2 border-b last:border-none"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs opacity-60">
                    {item.units} units
                  </p>
                </div>

                <p className="font-semibold">
                  TK {item.total}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* STOCK ALERT */}
        <div className="card bg-base-100 shadow border">
          <div className="card-body">

            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <RiAlertLine /> Stock Alerts
            </h2>

            <div className="flex justify-between items-center">
              <p className="text-sm">Low Stock Items</p>

              <span
                className={`badge ${
                  alerts.lowStock > 0
                    ? "badge-error"
                    : "badge-success"
                }`}
              >
                {alerts.lowStock}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* 🔥 ROW 2 (GRAPHS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* SALES TREND */}
        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <h2 className="font-semibold mb-4">
              Sales Trend
            </h2>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesTrend}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SALES BY PRODUCT */}
        <div className="card bg-base-100 shadow border">
          <div className="card-body">
            <h2 className="font-semibold mb-4">
              Sales by Product
            </h2>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productSales}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {productSales.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        ["#3b82f6", "#10b981", "#f59e0b"][
                          index % 3
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

          </div>
        </div>

      </div>

    </div>
  );
};

export default ReportsPage;