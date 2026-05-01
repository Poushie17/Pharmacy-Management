"use client";

import { useState } from "react";
import { lowStockData,restockOrders } from "../../../../data/restock";

import {
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiAddLine,
  RiTruckLine,
} from "react-icons/ri";

const emptyForm = {
  supplier: "",
  notes: "",
};

const RestockPage = () => {
  const [orders, setOrders] = useState(restockOrders);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const newOrder = {
      id: Date.now().toString(),
      supplier: form.supplier,
      notes: form.notes,
      date: new Date().toLocaleDateString(),
      items: lowStockData.length,
    };

    setOrders([newOrder, ...orders]);
    setOpen(false);
  };

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Restocking Management</h1>

        <button
          className="btn btn-primary btn-sm flex items-center gap-1"
          onClick={handleCreate}
        >
          <RiAddLine /> Create Restock Order
        </button>
      </div>

      {/* LOW STOCK SECTION */}
      <div className="card bg-base-100 shadow border">
        <div className="card-body">

          <h2 className="font-semibold flex items-center gap-2">
            <RiErrorWarningLine className="text-red-500" />
            Low Stock Items ({lowStockData.length})
          </h2>

          {lowStockData.length === 0 ? (
            <div className="flex items-center gap-2 text-sm mt-2">
              <RiCheckboxCircleLine className="text-green-500" />
              <span>All medicines have sufficient stock</span>
            </div>
          ) : (
            <div className="mt-2 space-y-2 text-sm">
              {lowStockData.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between border p-2 rounded"
                >
                  <span>{item.name}</span>
                  <span className="text-red-500">
                    {item.stock} / {item.minStock}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* RESTOCK ORDERS */}
      <div className="card bg-base-100 shadow border">
        <div className="card-body">

          <h2 className="font-semibold flex items-center gap-2">
            <RiTruckLine />
            Restock Orders
          </h2>

          {orders.length === 0 ? (
            <p className="text-sm opacity-70 mt-2">
              No restock orders yet.
            </p>
          ) : (
            <div className="mt-2 space-y-2 text-sm">
              {orders.map((order: any) => (
                <div
                  key={order.id}
                  className="border p-3 rounded flex justify-between"
                >
                  <div>
                    <p className="font-medium">{order.supplier}</p>
                    <p className="opacity-60 text-xs">
                      {order.date}
                    </p>
                  </div>

                  <div className="text-right">
                    <p>{order.items} items</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-base-100 w-full max-w-md p-6 rounded-xl space-y-3">

            <h2 className="text-lg font-bold">
              Create Restock Order
            </h2>

            <input
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Supplier Name"
            />

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              placeholder="Notes (optional)"
            />

            <div className="flex gap-2">
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
};

export default RestockPage;