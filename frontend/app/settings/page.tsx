// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";  // Fix import path
import { useRouter } from "next/navigation";
import api from "@/lib/axios";  // Fix import path
import {
  RiUserSettingsLine,
  RiLockPasswordLine,
  RiBuildingLine,
  RiNotificationLine,
  RiSaveLine,
  RiRefreshLine,
  RiCheckLine,
  RiCloseLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiPercentLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";

type ProfileData = {
  username: string;
  email: string;
  fullName: string;
  role: string;
};

type CompanyData = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  receiptFooter: string;
  lowStockAlert: number;
  expiryAlertDays: number;
};

type NotificationData = {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  expiryAlerts: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
};

const SettingsPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    email: "",
    fullName: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [company, setCompany] = useState<CompanyData>({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    taxRate: 15,
    currency: "BDT",
    receiptFooter: "",
    lowStockAlert: 20,
    expiryAlertDays: 30,
  });

  const [notifications, setNotifications] = useState<NotificationData>({
    emailNotifications: true,
    lowStockAlerts: true,
    expiryAlerts: true,
    dailyReports: false,
    weeklyReports: true,
  });

  useEffect(() => {
    // Check authentication directly from localStorage as fallback
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
    
    if (!isAuthenticated) {
      // If AuthContext says not authenticated but localStorage has data, still try to load
      console.log("AuthContext says not authenticated but localStorage has data");
    }
    
    fetchSettings();
  }, [isAuthenticated, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [profileRes, companyRes, notifRes] = await Promise.all([
        api.get("/settings/profile"),
        api.get("/settings/company"),
        api.get("/settings/notifications"),
      ]);

      setProfile(profileRes.data);
      setCompany(companyRes.data);
      setNotifications(notifRes.data);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError(err.response?.data?.detail || "Failed to fetch settings");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const saveProfile = async () => {
    try {
      setSaving(true);
      await api.put("/settings/profile", profile);
      setSuccess("Profile updated successfully!");
      await fetchSettings();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);
      await api.put("/settings/password", passwordData);
      setSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const saveCompanySettings = async () => {
    try {
      setSaving(true);
      await api.put("/settings/company", company);
      setSuccess("Company settings updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update company settings");
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setSaving(true);
      await api.put("/settings/notifications", notifications);
      setSuccess("Notification settings updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update notification settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: RiUserSettingsLine },
    { id: "password", label: "Password", icon: RiLockPasswordLine },
    { id: "company", label: "Company", icon: RiBuildingLine },
    { id: "notifications", label: "Notifications", icon: RiNotificationLine },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Welcome, {user?.full_name || profile.fullName} ({user?.role || profile.role})
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={fetchSettings} disabled={loading}>
            <RiRefreshLine className="mr-2" />
            Refresh
          </button>
          <button className="btn btn-outline btn-error btn-sm" onClick={logout}>
            <RiLogoutBoxRLine className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error shadow-lg">
          <div><RiCloseLine className="h-6 w-6" /><span>{error}</span></div>
        </div>
      )}
      {success && (
        <div className="alert alert-success shadow-lg">
          <div><RiCheckLine className="h-6 w-6" /><span>{success}</span></div>
        </div>
      )}

      <div className="tabs tabs-boxed bg-base-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label text-sm font-semibold">Full Name</label>
                  <input type="text" className="input input-bordered w-full" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="label text-sm font-semibold">Username</label>
                  <input type="text" className="input input-bordered w-full" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
                </div>
                <div>
                  <label className="label text-sm font-semibold">Email Address</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input type="email" className="input input-bordered w-full pl-10" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label text-sm font-semibold">Role</label>
                  <input type="text" className="input input-bordered w-full bg-base-200" value={profile.role} disabled />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                <RiSaveLine className="mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "password" && (
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="label text-sm font-semibold">Current Password</label>
                <input type="password" className="input input-bordered w-full" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
              </div>
              <div>
                <label className="label text-sm font-semibold">New Password</label>
                <input type="password" className="input input-bordered w-full" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                <p className="text-xs text-base-content/50 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="label text-sm font-semibold">Confirm New Password</label>
                <input type="password" className="input input-bordered w-full" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="btn btn-primary" onClick={updatePassword} disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}>
                <RiLockPasswordLine className="mr-2" />
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "company" && (
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-4">Company Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label text-sm font-semibold">Company Name</label>
                  <input type="text" className="input input-bordered w-full" value={company.companyName} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} />
                </div>
                <div>
                  <label className="label text-sm font-semibold">Currency</label>
                  <select className="select select-bordered w-full" value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })}>
                    <option value="BDT">BDT - Bangladeshi Taka</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="label text-sm font-semibold">Phone Number</label>
                  <input type="text" className="input input-bordered w-full" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label text-sm font-semibold">Email Address</label>
                  <input type="email" className="input input-bordered w-full" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="label text-sm font-semibold">Address</label>
                  <textarea className="textarea textarea-bordered w-full" rows={3} value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                </div>
                <div>
                  <label className="label text-sm font-semibold">Tax Rate (%)</label>
                  <input type="number" className="input input-bordered w-full" value={company.taxRate} onChange={(e) => setCompany({ ...company, taxRate: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="label text-sm font-semibold">Low Stock Alert (units)</label>
                  <input type="number" className="input input-bordered w-full" value={company.lowStockAlert} onChange={(e) => setCompany({ ...company, lowStockAlert: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="label text-sm font-semibold">Expiry Alert (days)</label>
                  <input type="number" className="input input-bordered w-full" value={company.expiryAlertDays} onChange={(e) => setCompany({ ...company, expiryAlertDays: parseInt(e.target.value) })} />
                </div>
                <div className="md:col-span-2">
                  <label className="label text-sm font-semibold">Receipt Footer Message</label>
                  <textarea className="textarea textarea-bordered w-full" rows={3} value={company.receiptFooter} onChange={(e) => setCompany({ ...company, receiptFooter: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="btn btn-primary" onClick={saveCompanySettings} disabled={saving}>
                <RiSaveLine className="mr-2" />
                {saving ? "Saving..." : "Save Company Settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                <div><p className="font-semibold">Email Notifications</p><p className="text-sm text-base-content/70">Receive notifications via email</p></div>
                <input type="checkbox" className="toggle toggle-primary" checked={notifications.emailNotifications} onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })} />
              </div>
              <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                <div><p className="font-semibold">Low Stock Alerts</p><p className="text-sm text-base-content/70">Get notified when stock is low</p></div>
                <input type="checkbox" className="toggle toggle-warning" checked={notifications.lowStockAlerts} onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })} />
              </div>
              <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                <div><p className="font-semibold">Expiry Alerts</p><p className="text-sm text-base-content/70">Get notified about expiring medicines</p></div>
                <input type="checkbox" className="toggle toggle-error" checked={notifications.expiryAlerts} onChange={(e) => setNotifications({ ...notifications, expiryAlerts: e.target.checked })} />
              </div>
              <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                <div><p className="font-semibold">Daily Reports</p><p className="text-sm text-base-content/70">Receive daily sales summary</p></div>
                <input type="checkbox" className="toggle toggle-info" checked={notifications.dailyReports} onChange={(e) => setNotifications({ ...notifications, dailyReports: e.target.checked })} />
              </div>
              <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                <div><p className="font-semibold">Weekly Reports</p><p className="text-sm text-base-content/70">Receive weekly performance report</p></div>
                <input type="checkbox" className="toggle toggle-success" checked={notifications.weeklyReports} onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })} />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="btn btn-primary" onClick={saveNotificationSettings} disabled={saving}>
                <RiSaveLine className="mr-2" />
                {saving ? "Saving..." : "Save Notification Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;