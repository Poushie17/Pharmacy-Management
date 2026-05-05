export const menuConfig = {
  admin: [
    { name: "Dashboard", key: "dashboard", popular: true, group: "general" },

    { name: "Stock Management", key: "stock", group: "inventory" },
    { name: "Restocking", key: "restock", group: "inventory" },
    { name: "Suppliers", key: "suppliers", group: "inventory" },

    { name: "Point of Sale", key: "pos", popular: true, group: "sales" },
    { name: "Sales History", key: "sales", group: "sales" },
    { name: "Reports", key: "reports", popular: true, group: "sales" },

    { name: "Prescriptions", key: "prescriptions", group: "medical" },

    { name: "Settings", key: "settings", group: "system" },
  ],

  pharmacist: [
    { name: "Dashboard", key: "dashboard", popular: true },
    { name: "Stock", key: "stock", group: "inventory" },
    { name: "Prescriptions", key: "prescriptions", group: "medical" },
    { name: "Sales", key: "sales", popular: true },
  ],

  cashier: [
    { name: "Point of Sale", key: "pos", popular: true },
    { name: "Sales History", key: "sales" },
    { name: "Customers", key: "customers" },
  ],

  customer: [
    { name: "Dashboard", key: "dashboard" },
    { name: "My Orders", key: "orders" },
    { name: "Prescriptions", key: "prescriptions" },
  ],
};