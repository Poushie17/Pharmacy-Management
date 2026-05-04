// app/prescriptions/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaUserDoctor } from "react-icons/fa6";
import {
  RiFileExcel2Line,
  RiFilePdf2Line,
  RiEdit2Line,
  RiDeleteBin6Line,
  RiAddLine,
  RiSearchLine,
  RiRefreshLine,
  RiCalendarLine,
  RiUser3Line,
  
  RiMedicineBottleLine,
} from "react-icons/ri";

type MedicineItem = {
  name: string;
  qty: number;
};

type Prescription = {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  medicines: MedicineItem[];
  notes?: string;
};

const emptyForm = {
  patient: "",
  doctor: "",
  date: new Date().toISOString().split("T")[0],
  medicines: "",
  notes: "",
};

const PrescriptionsPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [data, setData] = useState<Prescription[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ total: 0, monthly: 0 });

  const API_URL = "http://localhost:8000";

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/prescriptions/`);
      setData(response.data);
      setStats({
        total: response.data.length,
        monthly: response.data.filter((p: Prescription) => {
          const date = new Date(p.date);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
      });
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.detail || "Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Filter prescriptions based on search
  const filteredData = data.filter((item) =>
    item.patient.toLowerCase().includes(search.toLowerCase()) ||
    item.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleEdit = (item: Prescription) => {
    setSelected(item);
    setForm({
      patient: item.patient,
      doctor: item.doctor,
      date: item.date,
      medicines: item.medicines.map((m) => `${m.name}-${m.qty}`).join(", "),
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prescription?")) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/prescriptions/${id}`);
      await fetchPrescriptions();
      setError("");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.response?.data?.detail || "Failed to delete prescription");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.patient || !form.doctor || !form.date) {
      setError("Please fill in all required fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        patient: form.patient,
        doctor: form.doctor,
        date: form.date,
        medicines: form.medicines,
        notes: form.notes,
      };

      if (selected) {
        await axios.put(`${API_URL}/prescriptions/${selected.id}`, payload);
      } else {
        await axios.post(`${API_URL}/prescriptions/`, payload);
      }
      
      await fetchPrescriptions();
      setOpen(false);
      setError("");
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.response?.data?.detail || "Failed to save prescription");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = data.map((item) => ({
      "Patient Name": item.patient,
      "Doctor Name": item.doctor,
      "Date": item.date,
      "Medicines": item.medicines.map((m) => `${m.name} (${m.qty})`).join(", "),
      "Notes": item.notes || "",
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prescriptions");
    XLSX.writeFile(wb, `prescriptions_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text("PHARMAC+ PHARMACY", 20, 20);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Prescriptions Report", 20, 35);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
    
    const tableData = data.map((item) => [
      item.id,
      item.patient,
      item.doctor,
      item.date,
      item.medicines.map((m) => `${m.name} x${m.qty}`).join(", "),
    ]);
    
    autoTable(doc, {
      startY: 55,
      head: [["ID", "Patient", "Doctor", "Date", "Medicines"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 60 },
      },
    });
    
    doc.save(`prescriptions_report.pdf`);
  };

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Prescriptions</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage patient prescriptions and medication history
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={fetchPrescriptions}
          disabled={loading}
        >
          <RiRefreshLine className="mr-2" />
          Refresh
        </button>
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

      {/* Stats Cards - No gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-primary text-primary-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">Total Prescriptions</h2>
            <p className="text-3xl font-bold">{stats.total}</p>
            <div className="text-xs opacity-70">All time records</div>
          </div>
        </div>
        <div className="card bg-secondary text-secondary-content shadow-xl">
          <div className="card-body">
            <h2 className="text-sm opacity-90">This Month</h2>
            <p className="text-3xl font-bold">{stats.monthly}</p>
            <div className="text-xs opacity-70">New prescriptions</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-success btn-sm gap-1"
            onClick={exportToExcel}
          >
            <RiFileExcel2Line /> Excel
          </button>
          <button
            className="btn btn-error btn-sm gap-1"
            onClick={exportToPDF}
          >
            <RiFilePdf2Line /> PDF
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
            <input
              type="text"
              placeholder="Search by patient or doctor..."
              className="input input-bordered input-sm pl-10 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary btn-sm gap-1"
            onClick={handleAdd}
          >
            <RiAddLine /> Add
          </button>
        </div>
      </div>

      {/* Clear Search */}
      {search && (
        <div className="flex justify-end">
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => setSearch("")}
          >
            Clear Search ✕
          </button>
        </div>
      )}

      {/* Prescriptions List */}
      {filteredData.length === 0 ? (
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body text-center py-12">
            <RiMedicineBottleLine className="text-6xl mx-auto mb-4 text-base-content/30" />
            <p className="text-base-content/50">
              {data.length === 0 ? "No prescriptions found. Add your first prescription!" : "No prescriptions match your search"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((item) => (
            <div key={item.id} className="card bg-base-100 shadow-xl border hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  {/* Left - Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                          <span className="text-sm">{item.patient.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">{item.patient}</h2>
                        <p className="text-xs text-base-content/50">Prescription #{item.id}</p>
                      </div>
                    </div>

                    <div className="space-y-2 ml-12">
                      <div className="flex items-center gap-2 text-sm">
                        <FaUserDoctor className="text-base-content/60" />
                        <span>Doctor: <span className="font-medium">{item.doctor}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <RiCalendarLine className="text-base-content/60" />
                        <span>Date: <span className="font-medium">{item.date}</span></span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <RiMedicineBottleLine className="text-base-content/60 mt-0.5" />
                        <div>
                          <span className="font-medium">Medicines:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {item.medicines?.map((m, i) => (
                              <span key={i} className="badge badge-outline badge-sm">
                                {m.name} x{m.qty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {item.notes && (
                        <div className="text-sm text-base-content/70">
                          <span className="font-medium">Notes:</span> {item.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-4">
                    <button
                      className="btn btn-sm btn-outline btn-info"
                      onClick={() => handleEdit(item)}
                      title="Edit Prescription"
                    >
                      <RiEdit2Line />
                    </button>
                    <button
                      className="btn btn-sm btn-outline btn-error"
                      onClick={() => handleDelete(item.id)}
                      title="Delete Prescription"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add/Edit Prescription */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {selected ? "Edit Prescription" : "Add New Prescription"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label text-sm font-semibold">
                    Patient Name <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <RiUser3Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                      name="patient"
                      value={form.patient}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-10"
                      placeholder="Enter patient name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-sm font-semibold">
                    Doctor Name <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaUserDoctor className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                      name="doctor"
                      value={form.doctor}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-10"
                      placeholder="Enter doctor name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-sm font-semibold">
                    Prescription Date <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <RiCalendarLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-sm font-semibold">
                    Medicines <span className="text-error">*</span>
                  </label>
                  <input
                    name="medicines"
                    value={form.medicines}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Paracetamol-1, Aspirin-2, Vitamin C-1"
                  />
                  <p className="text-xs text-base-content/50 mt-1">
                    Format: MedicineName-Quantity, MedicineName-Quantity
                  </p>
                </div>

                <div>
                  <label className="label text-sm font-semibold">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="textarea textarea-bordered w-full"
                    placeholder="Additional instructions or notes..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleSave}
                  disabled={loading || !form.patient || !form.doctor || !form.date}
                >
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : "Save Prescription"}
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

export default PrescriptionsPage;