// app/restock/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiAddLine,
  RiTruckLine,
  RiRefreshLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiEyeLine,
} from "react-icons/ri";

type LowStockItem = {
  id: number;
  name: string;
  stock: number;
  minStock: number;
  category: string;
};

type RestockOrder = {
  id: number;
  supplier: string;
  notes: string;
  date: string;
  items: number;
  status: string;
};

const emptyForm = {
  supplier: "",
  notes: "",
};

const RestockPage = () => {
  const [orders, setOrders] = useState<RestockOrder[]>([]);
  const [lowStockData, setLowStockData] = useState<LowStockItem[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalLowStock: 0,
    pendingOrders: 0,
    totalOrders: 0
  });

  const API_URL = "http://localhost:8000";

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/restock/`);
      setLowStockData(response.data.lowStock);
      setOrders(response.data.orders);
      setStats({
        totalLowStock: response.data.totalLowStock,
        pendingOrders: response.data.orders.filter((o: RestockOrder) => o.status === "pending").length,
        totalOrders: response.data.orders.length
      });
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.detail || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/restock/orders`, form);
      await fetchData();
      setOpen(false);
      setError("");
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.response?.data?.detail || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveOrder = async (orderId: number) => {
    if (!confirm("Mark this order as received? Stock will be updated automatically.")) return;
    
    try {
      setLoading(true);
      await axios.put(`${API_URL}/restock/orders/${orderId}/receive`);
      await fetchData();
      setError("");
    } catch (err: any) {
      console.error("Receive error:", err);
      setError(err.response?.data?.detail || "Failed to receive order");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Delete this restock order?")) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/restock/orders/${orderId}`);
      await fetchData();
      setError("");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.response?.data?.detail || "Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0 && lowStockData.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading restock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Restocking Management</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage low stock items and create restock orders
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RiRefreshLine className="mr-2" />
            Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreate}
            disabled={loading || lowStockData.length === 0}
          >
            <RiAddLine className="mr-2" />
            Create Restock Order
          </button>
        </div>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-warning text-warning-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">Low Stock Items</h2>
            <p className="text-3xl font-bold">{stats.totalLowStock}</p>
            <div className="text-xs opacity-70">Need immediate restock</div>
          </div>
        </div>

        <div className="card bg-info text-info-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">Pending Orders</h2>
            <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            <div className="text-xs opacity-70">Awaiting delivery</div>
          </div>
        </div>

        <div className="card bg-primary text-primary-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">Total Orders</h2>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <div className="text-xs opacity-70">All time orders</div>
          </div>
        </div>
      </div>

      {/* LOW STOCK SECTION */}
      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <RiErrorWarningLine className="text-warning" />
            Low Stock Items ({lowStockData.length})
          </h2>

          {lowStockData.length === 0 ? (
            <div className="flex items-center gap-2 text-sm mt-2 p-4 bg-success/10 rounded-lg">
              <RiCheckboxCircleLine className="text-success text-xl" />
              <span className="text-success">All medicines have sufficient stock</span>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Min Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockData.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.category}</td>
                        <td className="text-warning font-bold">{item.stock}</td>
                        <td>{item.minStock}</td>
                        <td>
                          <span className="badge badge-warning badge-sm">Critical</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESTOCK ORDERS SECTION */}
      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <RiTruckLine className="text-primary" />
            Restock Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <p className="text-sm opacity-70 mt-2 p-4 text-center">
              No restock orders yet. Create your first order above.
            </p>
          ) : (
            <div className="mt-2 space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-lg">{order.supplier}</p>
                        <span className={`badge ${
                          order.status === "received" 
                            ? "badge-success" 
                            : "badge-warning"
                        }`}>
                          {order.status === "received" ? "✓ Received" : "Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/70">
                        <span className="font-semibold">Date:</span> {order.date}
                      </p>
                      <p className="text-sm text-base-content/70">
                        <span className="font-semibold">Items:</span> {order.items} products
                      </p>
                      {order.notes && (
                        <p className="text-sm text-base-content/70 mt-1">
                          <span className="font-semibold">Notes:</span> {order.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <button
                          className="btn btn-xs btn-success"
                          onClick={() => handleReceiveOrder(order.id)}
                          title="Mark as Received"
                        >
                          <RiCheckLine className="mr-1" />
                          Receive
                        </button>
                      )}
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete Order"
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Create Restock Order</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label text-sm font-semibold">Supplier Name *</label>
                  <input
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                <div>
                  <label className="label text-sm font-semibold">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="textarea textarea-bordered w-full"
                    placeholder="Add any special instructions or notes..."
                    rows={3}
                  />
                </div>

                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Order Summary:</p>
                  <p className="text-sm">Items to restock: <span className="font-bold text-warning">{lowStockData.length}</span></p>
                  <p className="text-xs text-base-content/70 mt-1">
                    This order will include all low stock items automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={handleSave}
                  disabled={!form.supplier || loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Create Order"
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

export default RestockPage;