// app/stock/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type StockItem = {
  id: number;
  name: string;
  category: string;
  batch: string;
  stock: number;
  expiry: string | null;
  price: number;
  purchasePrice: number;
  minStock: number;
};

const emptyForm: StockItem = {
  id: 0,
  name: "",
  category: "",
  batch: "",
  stock: 0,
  expiry: "",
  price: 0,
  purchasePrice: 0,
  minStock: 20,
};

const isExpiringSoon = (dateStr: string | null) => {
  if (!dateStr) return false;
  const today = new Date();
  const exp = new Date(dateStr);
  const diffDays = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
};

const StockPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StockItem | null>(null);
  const [form, setForm] = useState<StockItem>(emptyForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "exp">("all");
  const [category, setCategory] = useState("all");
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const API_URL = "http://localhost:8000";

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/medicines/`);
      console.log("Fetched data:", response.data);
      setStockData(response.data);
      
      const uniqueCategories = [...new Set(response.data.map((item: StockItem) => item.category))];
      setCategories(uniqueCategories);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.detail || "Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAdd = () => {
    setSelected(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    setSelected(item);
    setForm({ ...item });
    setOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare data for backend
      const payload = {
        name: form.name,
        category: form.category,
        batch: form.batch,
        stock: form.stock,
        expiry: form.expiry || null,
        price: form.price,
        purchasePrice: form.purchasePrice,
        minStock: form.minStock
      };
      
      if (selected && selected.id) {
        // Update existing medicine
        await axios.put(`${API_URL}/medicines/${selected.id}`, payload);
      } else {
        // Create new medicine
        await axios.post(`${API_URL}/medicines/`, payload);
      }
      
      await fetchMedicines();
      setOpen(false);
      setError("");
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.response?.data?.detail || "Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/medicines/${id}`);
      await fetchMedicines();
      setError("");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.response?.data?.detail || "Failed to delete medicine");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return stockData.filter((item) => {
      const q = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.batch.toLowerCase().includes(q);

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

      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [search, filter, category, stockData]);

  if (loading && stockData.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Stock Management</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage your medicine inventory
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Medicine
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="input input-bordered w-full"
          placeholder="🔍 Search medicine by name, category, or batch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="select select-bordered w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            className={`btn ${filter === "all" ? "btn-primary" : "btn-outline"} flex-1`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`btn ${filter === "low" ? "btn-warning" : "btn-outline"} flex-1`}
            onClick={() => setFilter("low")}
          >
            Low Stock
          </button>
          <button
            className={`btn ${filter === "exp" ? "btn-error" : "btn-outline"} flex-1`}
            onClick={() => setFilter("exp")}
          >
            Expiring Soon
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Total Items</div>
          <div className="stat-value text-primary">{stockData.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Low Stock Items</div>
          <div className="stat-value text-warning">
            {stockData.filter(item => item.stock < (item.minStock ?? 20)).length}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Expiring Soon</div>
          <div className="stat-value text-error">
            {stockData.filter(item => isExpiringSoon(item.expiry)).length}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Total Stock Value</div>
          <div className="stat-value text-accent">
            ৳{stockData.reduce((sum, item) => sum + (item.price * item.stock), 0)}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Batch</th>
                  <th>Stock</th>
                  <th>Price (৳)</th>
                  <th>Purchase Price (৳)</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-base-content/50">
                      No medicines found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.batch || "-"}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {item.stock}
                          {item.stock < (item.minStock ?? 20) && (
                            <span className="badge badge-warning badge-sm">Low</span>
                          )}
                        </div>
                      </td>
                      <td className="text-accent font-bold">৳{item.price}</td>
                      <td className="text-base-content/70">৳{item.purchasePrice}</td>
                      <td>
                        <span className={isExpiringSoon(item.expiry) ? "text-error font-bold" : ""}>
                          {item.expiry || "N/A"}
                          {isExpiringSoon(item.expiry) && (
                            <span className="badge badge-error badge-sm ml-2">Expiring</span>
                          )}
                        </span>
                      </td>
                      <td>
                        {item.stock === 0 ? (
                          <span className="badge badge-error">Out of Stock</span>
                        ) : item.stock < (item.minStock ?? 20) ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                      <td className="flex gap-2">
                        <button
                          className="btn btn-xs btn-outline btn-info"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-outline btn-error"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {selected ? "Edit Medicine" : "Add New Medicine"}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Medicine Name *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Enter medicine name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Category *</label>
                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="e.g., Pain Relief, Antibiotic"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Batch Number</label>
                    <input
                      name="batch"
                      value={form.batch}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Batch number"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Expiry Date</label>
                    <input
                      name="expiry"
                      type="date"
                      value={form.expiry || ""}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Stock Quantity *</label>
                    <input
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Current stock"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Minimum Stock Alert</label>
                    <input
                      name="minStock"
                      type="number"
                      value={form.minStock}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Alert when stock below"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Selling Price (৳) *</label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Selling price"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Purchase Price (৳) *</label>
                    <input
                      name="purchasePrice"
                      type="number"
                      value={form.purchasePrice}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Purchase price"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Save Medicine"
                  )}
                </button>
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;