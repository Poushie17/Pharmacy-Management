"use client";

import { useState } from "react";
import { medicines } from "@/data/medicines";

const POSPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<any[]>([]);

  // ➕ ADD TO CART
  const addToCart = (item: any) => {
    const exist = cart.find((c) => c.id === item.id);

    if (exist) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // ➖ REMOVE
  const removeFromCart = (id: string) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  // 🔢 TOTAL
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // 🔍 FILTER
  const filtered = medicines.filter((m) => {
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || m.category === category)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* LEFT: PRODUCTS */}
      <div className="lg:col-span-2 space-y-4">

        {/* FILTER BAR */}
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

        {/* PRODUCT GRID */}
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

      {/* RIGHT: CART */}
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
                      {item.qty} × TK {item.price}
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

              {/* TOTAL */}
              <div className="flex justify-between font-bold pt-3">
                <span>Total</span>
                <span>TK {total}</span>
              </div>

              {/* PAYMENT */}
              <button className="btn btn-success w-full mt-3">
                Process Payment
              </button>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default POSPage;