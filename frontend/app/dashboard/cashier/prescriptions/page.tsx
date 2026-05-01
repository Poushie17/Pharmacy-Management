"use client";

import { useState } from "react";
import { prescriptionsData } from "../../../../data/prescriptions";

import {
  RiFileExcel2Line,
  RiFilePdf2Line,
  RiEdit2Line,
  RiDeleteBin6Line,
  RiAddLine,
} from "react-icons/ri";

const emptyForm = {
  patient: "",
  doctor: "",
  date: "",
  medicines: "",
};

const PrescriptionsPage = () => {
  const [data, setData] = useState(prescriptionsData);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const handleAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelected(item);
    setForm({
      ...item,
      medicines: item.medicines
        .map((m: any) => `${m.name}-${m.qty}`)
        .join(", "),
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const parsedMeds = form.medicines.split(",").map((m: string) => {
      const [name, qty] = m.split("-");
      return { name: name.trim(), qty: Number(qty) };
    });

    if (selected) {
      setData(
        data.map((item) =>
          item.id === selected.id
            ? { ...item, ...form, medicines: parsedMeds }
            : item
        )
      );
    } else {
      setData([
        ...data,
        {
          id: Date.now().toString(),
          ...form,
          medicines: parsedMeds,
        },
      ]);
    }

    setOpen(false);
  };

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">Prescriptions</h1>
        <p className="text-sm opacity-70">Prescription List</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap justify-between gap-2">

        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-success btn-sm flex items-center gap-1">
            <RiFileExcel2Line /> Excel
          </button>

          <button className="btn btn-error btn-sm flex items-center gap-1">
            <RiFilePdf2Line /> PDF
          </button>

          <button className="btn btn-outline btn-sm flex items-center gap-1">
            <RiEdit2Line /> Edit
          </button>

          <button className="btn btn-outline btn-sm text-red-500 flex items-center gap-1">
            <RiDeleteBin6Line /> Delete
          </button>
        </div>

        <button
          className="btn btn-primary btn-sm flex items-center gap-1"
          onClick={handleAdd}
        >
          <RiAddLine /> Add
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            className="card bg-base-100 shadow border"
          >
            <div className="card-body flex flex-col sm:flex-row sm:justify-between">

              {/* LEFT */}
              <div>
                <h2 className="font-bold text-lg">
                  {item.patient}
                </h2>

                <p className="text-sm opacity-70">
                  Doctor: {item.doctor}
                </p>

                <p className="text-sm opacity-70">
                  Date: {item.date}
                </p>

                <div className="mt-2 text-sm">
                  {item.medicines.map((m: any, i: number) => (
                    <div key={i}>
                      {m.name} — Qty: {m.qty}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3 sm:mt-0">
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => handleEdit(item)}
                >
                  <RiEdit2Line />
                </button>

                <button
                  className="btn btn-xs btn-error"
                  onClick={() => handleDelete(item.id)}
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-base-100 w-full max-w-lg p-6 rounded-xl space-y-3">

            <h2 className="text-lg font-bold">
              {selected ? "Edit Prescription" : "Add Prescription"}
            </h2>

            <input
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Patient Name"
            />

            <input
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Doctor Name"
            />

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="input input-bordered w-full"
            />

            <input
              name="medicines"
              value={form.medicines}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Paracetamol-1, Aspirine-2"
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

export default PrescriptionsPage;