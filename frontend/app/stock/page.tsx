"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";

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
  const router = useRouter();
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
  const [userRole, setUserRole] = useState<string>("");
  const [showRoleError, setShowRoleError] = useState(false);
  const [user, setUser] = useState<any>(null);

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
      setUserRole(parsedUser.role);
    } catch (e) {
      console.error("Error parsing user:", e);
      router.push("/login");
      return;
    }
    
    fetchMedicines();
  }, [router]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get("/medicines/");
      // Convert numeric values to numbers
      const formattedData = response.data.map((item: any) => ({
        ...item,
        stock: Number(item.stock) || 0,
        price: Number(item.price) || Number(item.sell_price) || 0,
        purchasePrice: Number(item.purchasePrice) || Number(item.buy_price) || 0,
        minStock: Number(item.minStock) || 20,
      }));
      setStockData(formattedData);
      const uniqueCategories = [...new Set(formattedData.map((item: StockItem) => item.category))];
      setCategories(uniqueCategories);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        setError(err.response?.data?.detail || "Failed to fetch medicines");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (userRole !== "admin") {
      setShowRoleError(true);
      setTimeout(() => setShowRoleError(false), 3000);
      return;
    }
    setSelected(null);
    setForm({ 
      ...emptyForm, 
      stock: 0,
      price: 0,
      purchasePrice: 0,
      minStock: 20 
    });
    setOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    if (userRole !== "admin") {
      setShowRoleError(true);
      setTimeout(() => setShowRoleError(false), 3000);
      return;
    }
    setSelected(item);
    setForm({ ...item });
    setOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      setForm({
        ...form,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleBlur = (fieldName: string) => {
    const value = form[fieldName as keyof StockItem];
    if (value === "" || value === null) {
      setForm({
        ...form,
        [fieldName]: 0,
      });
    }
  };

  const handleSave = async () => {
    if (userRole !== "admin") {
      setShowRoleError(true);
      setTimeout(() => setShowRoleError(false), 3000);
      return;
    }

    const stockValue = form.stock === "" ? 0 : Number(form.stock);
    const priceValue = form.price === "" ? 0 : Number(form.price);
    const purchasePriceValue = form.purchasePrice === "" ? 0 : Number(form.purchasePrice);
    const minStockValue = form.minStock === "" ? 20 : Number(form.minStock);

    if (!form.name.trim()) {
      setError("Medicine name is required");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!form.category.trim()) {
      setError("Category is required");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (priceValue <= 0) {
      setError("Selling price must be greater than 0");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (purchasePriceValue <= 0) {
      setError("Purchase price must be greater than 0");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        batch: form.batch || "",
        stock: stockValue,
        expiry: form.expiry || null,
        price: priceValue,
        purchasePrice: purchasePriceValue,
        minStock: minStockValue
      };
      
      if (selected && selected.id) {
        await api.put(`/medicines/${selected.id}`, payload);
      } else {
        await api.post("/medicines/", payload);
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
    if (userRole !== "admin") {
      setShowRoleError(true);
      setTimeout(() => setShowRoleError(false), 3000);
      return;
    }
    
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    
    try {
      setLoading(true);
      await api.delete(`/medicines/${id}`);
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

  // Calculate total stock value safely
  const totalStockValue = useMemo(() => {
    return stockData.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const stock = Number(item.stock) || 0;
      return sum + (price * stock);
    }, 0);
  }, [stockData]);

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
    <div className="space-y-4 p-4 md:p-6 pt-16 md:pt-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Stock Management</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage your medicine inventory
          </p>
          <div className="mt-2">
            <span className={`badge ${userRole === "admin" ? "badge-primary" : "badge-secondary"}`}>
              {userRole === "admin" ? "Admin Access" : "Cashier Mode (View Only)"}
            </span>
          </div>
        </div>
        {userRole === "admin" && (
          <button className="btn btn-primary w-full md:w-auto" onClick={handleAdd}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Medicine
          </button>
        )}
      </div>

      {showRoleError && (
        <div className="alert alert-warning shadow-lg">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>This action requires Admin privileges. Cashiers can only view stock.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="input input-bordered w-full"
          placeholder="🔍 Search medicine..."
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
            className={`btn flex-1 ${filter === "all" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`btn flex-1 ${filter === "low" ? "btn-warning" : "btn-outline"}`}
            onClick={() => setFilter("low")}
          >
            Low
          </button>
          <button
            className={`btn flex-1 ${filter === "exp" ? "btn-error" : "btn-outline"}`}
            onClick={() => setFilter("exp")}
          >
            Expiring
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title text-xs">Total Items</div>
          <div className="stat-value text-primary text-2xl md:text-3xl">{stockData.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title text-xs">Low Stock</div>
          <div className="stat-value text-warning text-2xl md:text-3xl">
            {stockData.filter(item => item.stock < (item.minStock ?? 20)).length}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title text-xs">Expiring Soon</div>
          <div className="stat-value text-error text-2xl md:text-3xl">
            {stockData.filter(item => isExpiringSoon(item.expiry)).length}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title text-xs">Total Value</div>
          <div className="stat-value text-accent text-xl md:text-3xl truncate">
            ৳{totalStockValue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th className="text-xs md:text-sm">Name</th>
                  <th className="text-xs md:text-sm hidden sm:table-cell">Category</th>
                  <th className="text-xs md:text-sm hidden md:table-cell">Batch</th>
                  <th className="text-xs md:text-sm">Stock</th>
                  <th className="text-xs md:text-sm hidden sm:table-cell">Price</th>
                  <th className="text-xs md:text-sm hidden lg:table-cell">Purchase</th>
                  <th className="text-xs md:text-sm hidden md:table-cell">Expiry</th>
                  <th className="text-xs md:text-sm hidden lg:table-cell">Status</th>
                  <th className="text-xs md:text-sm">Actions</th>
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
                      <td className="font-semibold text-sm">{item.name}</td>
                      <td className="text-sm hidden sm:table-cell">{item.category}</td>
                      <td className="text-sm hidden md:table-cell">{item.batch || "-"}</td>
                      <td className="text-sm">
                        <div className="flex items-center gap-1">
                          {item.stock}
                          {item.stock < (item.minStock ?? 20) && (
                            <span className="badge badge-warning badge-sm hidden md:inline">Low</span>
                          )}
                        </div>
                      </td>
                      <td className="text-accent font-bold text-sm hidden sm:table-cell">৳{Number(item.price).toFixed(2)}</td>
                      <td className="text-sm hidden lg:table-cell">৳{Number(item.purchasePrice).toFixed(2)}</td>
                      <td className="text-sm hidden md:table-cell">
                        <span className={isExpiringSoon(item.expiry) ? "text-error font-bold" : ""}>
                          {item.expiry || "N/A"}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell">
                        {item.stock === 0 ? (
                          <span className="badge badge-error">Out</span>
                        ) : item.stock < (item.minStock ?? 20) ? (
                          <span className="badge badge-warning">Low</span>
                        ) : (
                          <span className="badge badge-success">Good</span>
                        )}
                      </td>
                      <td>
                        {userRole === "admin" ? (
                          <div className="flex gap-1">
                            <button
                              className="btn btn-xs btn-outline btn-info"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-xs btn-outline btn-error"
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
                            >
                              Del
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-base-content/50 italic">View</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {open && userRole === "admin" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6">
                {selected ? "Edit Medicine" : "Add New Medicine"}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label font-semibold">Medicine Name <span className="text-error">*</span></label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Enter medicine name"
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Category <span className="text-error">*</span></label>
                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="e.g., Pain Relief"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label font-semibold">Batch Number</label>
                    <input
                      name="batch"
                      value={form.batch}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Batch number"
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Expiry Date</label>
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
                    <label className="label font-semibold">Stock Quantity</label>
                    <input
                      name="stock"
                      type="number"
                      value={form.stock === 0 ? "" : form.stock}
                      onChange={handleChange}
                      onBlur={() => handleBlur("stock")}
                      className="input input-bordered w-full"
                      placeholder="Current stock"
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Min Stock Alert</label>
                    <input
                      name="minStock"
                      type="number"
                      value={form.minStock === 20 ? "" : form.minStock}
                      onChange={handleChange}
                      onBlur={() => handleBlur("minStock")}
                      className="input input-bordered w-full"
                      placeholder="Alert at"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label font-semibold">Selling Price (৳) <span className="text-error">*</span></label>
                    <input
                      name="price"
                      type="number"
                      value={form.price === 0 ? "" : form.price}
                      onChange={handleChange}
                      onBlur={() => handleBlur("price")}
                      className="input input-bordered w-full"
                      placeholder="Selling price"
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Purchase Price (৳) <span className="text-error">*</span></label>
                    <input
                      name="purchasePrice"
                      type="number"
                      value={form.purchasePrice === 0 ? "" : form.purchasePrice}
                      onChange={handleChange}
                      onBlur={() => handleBlur("purchasePrice")}
                      className="input input-bordered w-full"
                      placeholder="Purchase price"
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
                  {loading ? <span className="loading loading-spinner"></span> : "Save Medicine"}
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