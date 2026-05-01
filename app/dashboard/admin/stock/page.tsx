"use client";

import { useEffect, useMemo, useState } from "react";
import { stockData as initialStockData } from "@/data/stock";

type StockItem = {
  id: string; // keep string
  name: string;
  category: string;
  batch: string;
  stock: number;
  expiry: string;
  price: number;
  purchasePrice: number;
  minStock: number;
};

const emptyForm: StockItem = {
  id: "",
  name: "",
  category: "",
  batch: "",
  stock: 0,
  expiry: "",
  price: 0,
  purchasePrice: 0,
  minStock: 20,
};

const isExpiringSoon = (dateStr: string) => {
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

  const [stockData, setStockData] = useState<StockItem[]>(initialStockData);

  const handleAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    setSelected(item);
    setForm(item);
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

  const handleSave = () => {
    if (selected) {
      setStockData((prev) =>
        prev.map((item) =>
          item.id === selected.id ? { ...form } : item
        )
      );
    } else {
      setStockData((prev) => [
        { ...form, id: Date.now().toString() },
        ...prev,
      ]);
    }

    setOpen(false);
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

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Stock Management</h1>

        <button className="btn btn-primary" onClick={handleAdd}>
          + Add
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="input input-bordered w-full"
        placeholder="Search medicine..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.batch}</td>
                  <td>{item.stock}</td>
                  <td>TK {item.price}</td>
                  <td>{item.expiry}</td>

                  <td className="flex gap-2">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-xs btn-error"
                      onClick={() =>
                        setStockData((prev) =>
                          prev.filter((i) => i.id !== item.id)
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-xl w-full max-w-lg space-y-3">

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Name"
            />

            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Stock"
            />

            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-outline flex-1" onClick={() => setOpen(false)}>
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