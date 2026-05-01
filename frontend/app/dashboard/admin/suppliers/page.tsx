// app/suppliers/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  RiEditLine,
  RiDeleteBin6Line,
  RiUser3Line,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiAddLine,
  RiRefreshLine,
  RiBuildingLine,
} from "react-icons/ri";

type Supplier = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  location: string;
};

const emptyForm: Supplier = {
  id: "",
  name: "",
  contact: "",
  phone: "",
  email: "",
  location: "",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Supplier>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ totalSuppliers: 0 });

  const API_URL = "http://localhost:8000";

  // Fetch suppliers from backend
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/suppliers/`);
      setSuppliers(response.data);
      setStats({ totalSuppliers: response.data.length });
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.detail || "Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers based on search
  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random but consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-primary",
      "bg-secondary", 
      "bg-accent",
      "bg-info",
      "bg-success",
      "bg-warning",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleEdit = (item: Supplier) => {
    setSelected(item);
    setForm(item);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/suppliers/${id}`);
      await fetchSuppliers();
      setError("");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.response?.data?.detail || "Failed to delete supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.email) {
      setError("Please fill in all required fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      
      if (selected) {
        // Update existing supplier
        await axios.put(`${API_URL}/suppliers/${selected.id}`, form);
      } else {
        // Create new supplier
        await axios.post(`${API_URL}/suppliers/`, form);
      }
      
      await fetchSuppliers();
      setOpen(false);
      setError("");
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.response?.data?.detail || "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Suppliers</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage your pharmacy suppliers and contacts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={fetchSuppliers}
            disabled={loading}
          >
            <RiRefreshLine className="mr-2" />
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            <RiAddLine className="mr-2" />
            Add Supplier
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

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card bg-primary text-primary-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">Total Suppliers</h2>
            <p className="text-3xl font-bold">{stats.totalSuppliers}</p>
            <div className="text-xs opacity-70">Active suppliers</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Search suppliers by name..."
            className="input input-bordered w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Clear Filters */}
      {search && (
        <div className="flex justify-end">
          <button 
            className="btn btn-sm btn-ghost"
            onClick={() => setSearch("")}
          >
            Clear Search ✕
          </button>
        </div>
      )}

      {/* Suppliers Grid */}
      {filtered.length === 0 ? (
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body text-center py-12">
            <RiBuildingLine className="text-6xl mx-auto mb-4 text-base-content/30" />
            <p className="text-base-content/50">
              {suppliers.length === 0 ? "No suppliers found. Add your first supplier!" : "No suppliers match your search"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="card bg-base-100 shadow-xl border hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {/* Fixed Avatar - Properly Centered */}
                    <div className={`${getAvatarColor(s.name)} text-primary-content rounded-full w-12 h-12 flex items-center justify-center shadow-lg`}>
                      <span className="text-lg font-bold">{getInitials(s.name)}</span>
                    </div>
                    <div>
                      <h2 className="card-title text-xl">{s.name}</h2>
                      <p className="text-xs text-base-content/50">Supplier ID: #{s.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-outline btn-info"
                      onClick={() => handleEdit(s)}
                      title="Edit Supplier"
                    >
                      <RiEditLine />
                    </button>
                    <button
                      className="btn btn-sm btn-outline btn-error"
                      onClick={() => handleDelete(s.id)}
                      title="Delete Supplier"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="space-y-2 text-sm">
                  {s.contact && (
                    <div className="flex items-center gap-2">
                      <RiUser3Line className="text-base-content/60" />
                      <span>Contact: <span className="font-medium">{s.contact}</span></span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <RiPhoneLine className="text-base-content/60" />
                    <span>Phone: <span className="font-medium">{s.phone}</span></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <RiMailLine className="text-base-content/60" />
                    <span>Email: <span className="font-medium">{s.email}</span></span>
                  </div>

                  {s.location && (
                    <div className="flex items-center gap-2">
                      <RiMapPinLine className="text-base-content/60" />
                      <span>Location: <span className="font-medium">{s.location}</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL - Add/Edit Supplier */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {selected ? "Edit Supplier" : "Add New Supplier"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label text-sm font-semibold">
                    Supplier Name <span className="text-error">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                <div>
                  <label className="label text-sm font-semibold">Contact Person</label>
                  <input
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="label text-sm font-semibold">
                    Phone Number <span className="text-error">*</span>
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Phone number"
                    required
                  />
                </div>

                <div>
                  <label className="label text-sm font-semibold">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Email address"
                    required
                  />
                </div>

                <div>
                  <label className="label text-sm font-semibold">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Address or location"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={handleSave}
                  disabled={loading || !form.name || !form.phone || !form.email}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Save Supplier"
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
}