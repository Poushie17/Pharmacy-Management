"use client";

import { useEffect, useMemo, useState } from "react";
import { stockData } from "@/data/stock";

const emptyForm = {
  name: "",
  category: "",
  batch: "",
  stock: "",
  expiry: "",
  price: "",
  purchasePrice: "",
  minStock: "",
};

const isExpiringSoon = (dateStr: string) => {
  if (!dateStr) return false;
  const today = new Date();
  const exp = new Date(dateStr);
  const diffDays = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30; // within 30 days
};

const StockPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  // 🔍 search + filters
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "exp">("all");
  const [category, setCategory] = useState("all");

  const handleAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelected(item);
    setForm(item);
    setOpen(true);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ESC CLOSE
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // 🧠 FILTERED DATA
  const filteredData = useMemo(() => {
    return stockData.filter((item) => {
      const q = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.batch || "").toLowerCase().includes(q);

      const matchesCategory =
        category === "all" ? true : item.category === category;

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "low"
          ? item.stock < (item.minStock ?? 20)
          : filter === "exp"
          ? isExpiringSoon(item.expiry)
          : true;

      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [search, filter, category]);

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

        <h1 className="text-xl font-bold">Stock Management</h1>

        {/* RIGHT SIDE: SEARCH + FILTERS + ADD */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">

          {/* 🔍 SEARCH */}
          <div className="flex items-center gap-2 bg-base-200 px-2 rounded-lg">
            <input
              type="text"
              placeholder="Search medicine..."
              className="input input-ghost w-48 sm:w-64 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


          {/* 📂 CATEGORY DROPDOWN */}
          <select
            className="select select-bordered select-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Pain Relief">Pain Relief</option>
            <option value="Antibiotic">Antibiotic</option>
            <option value="Vitamin">Vitamin</option>
          </select>

          {/* ➕ ADD BUTTON */}
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="card bg-base-100 shadow border overflow-x-auto">
        <div className="card-body">

          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Batch</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover">

                    <td className="font-semibold">{item.name}</td>

                    <td>
                      <span className="badge badge-outline">
                        {item.category}
                      </span>
                    </td>

                    <td>{item.batch}</td>

                    <td>
                      <span
                        className={`badge ${
                          item.stock < (item.minStock ?? 20)
                            ? "badge-error"
                            : "badge-success"
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>

                    <td>TK {item.price}</td>

                    <td
                      className={`text-xs ${
                        isExpiringSoon(item.expiry)
                          ? "text-red-500"
                          : "opacity-70"
                      }`}
                    >
                      {item.expiry}
                    </td>

                    <td className="flex gap-2">
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button className="btn btn-xs btn-error">
                        Delete
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-sm opacity-60">
                    No medicines found
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL (same as yours, keep z high if needed) */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />

          <div className="relative bg-base-100 w-full max-w-lg p-6 rounded-xl shadow-xl space-y-3 z-[10000]">
            <h2 className="text-lg font-bold">
              {selected ? "Edit Medicine" : "Add Medicine"}
            </h2>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Medicine Name"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Category</option>
              <option>Pain Relief</option>
              <option>Antibiotic</option>
              <option>Vitamin</option>
            </select>

            <input
              name="batch"
              value={form.batch}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Batch Number"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Stock"
              />
              <input
                name="expiry"
                type="date"
                value={form.expiry}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Unit Price"
              />
              <input
                name="purchasePrice"
                value={form.purchasePrice}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Purchase Price"
              />
            </div>

            <input
              name="minStock"
              value={form.minStock}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Minimum Stock"
            />

            <div className="flex gap-2 pt-2">
              <button className="btn btn-primary flex-1">Save</button>
              <button
                className="btn btn-outline flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StockPage;