"use client";

import { useState } from "react";
import { suppliersData } from "../../../../data/suppliers";

import {
  RiEditLine,
  RiDeleteBin6Line,
  RiUser3Line,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
} from "react-icons/ri";

const emptyForm = {
  name: "",
  contact: "",
  phone: "",
  email: "",
  location: "",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(suppliersData);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  // 🔍 FILTER
  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // ➕ ADD
  const handleAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setOpen(true);
  };

  // ✏️ EDIT
  const handleEdit = (item: any) => {
    setSelected(item);
    setForm(item);
    setOpen(true);
  };

  // ❌ DELETE
  const handleDelete = (id: number) => {
    if (!confirm("Delete this supplier?")) return;
    setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  // 💾 SAVE
  const handleSave = () => {
    if (selected) {
      setSuppliers(
        suppliers.map((s) =>
          s.id === selected.id ? { ...form, id: selected.id } : s
        )
      );
    } else {
      setSuppliers([...suppliers, { ...form, id: Date.now() }]);
    }

    setOpen(false);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">Suppliers</h1>
        <p className="text-sm opacity-70">
          Manage your pharmacy suppliers
        </p>
      </div>

      {/* SEARCH + ADD */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">

        <input
          type="text"
          placeholder="Search suppliers..."
          className="input input-bordered w-full sm:max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Supplier
        </button>

      </div>

      {/* CARDS */}
      <div className="grid gap-4">

        {filtered.map((s) => (
          <div
            key={s.id}
            className="card bg-base-100 shadow border"
          >
            <div className="card-body flex flex-row justify-between items-start">

              {/* INFO */}
              <div className="space-y-2 text-sm">

                <h2 className="font-semibold text-lg">
                  {s.name}
                </h2>

                <div className="flex items-center gap-2">
                  <RiUser3Line className="opacity-70" />
                  {s.contact}
                </div>

                <div className="flex items-center gap-2">
                  <RiPhoneLine className="opacity-70" />
                  {s.phone}
                </div>

                <div className="flex items-center gap-2">
                  <RiMailLine className="opacity-70" />
                  {s.email}
                </div>

                <div className="flex items-center gap-2">
                  <RiMapPinLine className="opacity-70" />
                  {s.location}
                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">

                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleEdit(s)}
                >
                  <RiEditLine />
                </button>

                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDelete(s.id)}
                >
                  <RiDeleteBin6Line />
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-base-100 w-full max-w-md p-6 rounded-xl shadow-xl space-y-3 z-[10000]">

            <h2 className="text-lg font-bold">
              {selected ? "Edit Supplier" : "Add Supplier"}
            </h2>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Supplier Name"
            />

            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Contact Person"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Phone"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Email"
            />

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Location"
            />

            <div className="flex gap-2 pt-2">

              <button
                className="btn btn-primary flex-1"
                onClick={handleSave}
              >
                Save
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
      )}

    </div>
  );
}