"use client";

import { useState, useEffect } from "react";

/* ================= TYPES ================= */
type Medicine = {
  id: number;
  name: string;
  category: string;
  sellPrice: number;
};

type CartItem = Medicine & {
  qty: number;
};

export default function POSPage() {
  /* ================= STATE ================= */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetch("/api/medicines")
      .then((res) => res.json())
      .then((data: Medicine[]) => setMedicines(data));
  }, []);

  /* ================= CART LOGIC ================= */
  const addToCart = (item: Medicine) => {
    setCart((prev) => {
      const exist = prev.find((c) => c.id === item.id);

      if (exist) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  /* ================= TOTAL ================= */
  const total = cart.reduce(
    (sum, item) => sum + item.sellPrice * item.qty,
    0
  );

  /* ================= FILTER ================= */
  const filtered = medicines.filter((m) => {
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || m.category === category)
    );
  });

  /* ================= UI ================= */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* LEFT */}
      <div className="lg:col-span-2 space-y-4">

        {/* FILTER */}
        <div className="card bg-base-100 shadow border p-4 flex flex-col sm:flex-row gap-2">

          <input
            type="text"
            placeholder="Search medicines..."
            className="input input-bordered w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select select-bordered w-full sm:w-60"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option>Pain Relief</option>
            <option>Antibiotics</option>
          </select>

        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

          {filtered.map((item) => (
            <div
              key={item.id}
              className="card bg-base-100 shadow border cursor-pointer hover:scale-[1.02] transition"
              onClick={() => addToCart(item)}
            >
              <div className="card-body p-4">

                <h2 className="font-semibold">{item.name}</h2>

                <p className="text-xs opacity-60">
                  {item.category}
                </p>

                <p className="font-bold text-primary">
                  TK {item.sellPrice}
                </p>

                <button className="btn btn-sm btn-primary mt-2">
                  Add
                </button>

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* RIGHT CART */}
      <div className="card bg-base-100 shadow border h-fit">

        <div className="card-body">

          <h2 className="font-bold text-lg mb-2">Cart</h2>

          {cart.length === 0 ? (
            <p className="text-sm opacity-60">
              No items selected
            </p>
          ) : (
            <div className="space-y-2">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs opacity-60">
                      {item.qty} × TK {item.sellPrice}
                    </p>
                  </div>

                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex justify-between font-bold pt-3">
                <span>Total</span>
                <span>TK {total}</span>
              </div>

              <button className="btn btn-success w-full mt-3">
                Process Payment
              </button>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}