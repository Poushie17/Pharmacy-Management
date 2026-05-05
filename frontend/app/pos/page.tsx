// app/pos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';  // Use @ alias
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';  // Use @ alias

interface Medicine {
  id: number;
  name: string;
  category: string;
  sell_price: number;
  buy_price: number;
  stock: number;
}

interface CartItem {
  medicine_id: number;
  name: string;
  sell_price: number;
  qty: number;
  total: number;
}

export default function POSPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug logging
  useEffect(() => {
    console.log("=== POS Page Debug ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("token in localStorage:", localStorage.getItem("token"));
    
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push('/login');
      return;
    }
    fetchMedicines();
  }, [isAuthenticated, router, user]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      console.log("Fetching medicines...");
      const response = await api.get('/medicines/');
      console.log("Medicines fetched:", response.data.length);
      setMedicines(response.data);
      const uniqueCategories = [...new Set(response.data.map((med: Medicine) => med.category))];
      setCategories(uniqueCategories);
      setError('');
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (medicine: Medicine) => {
    if (medicine.stock <= 0) {
      setError('Out of stock!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.medicine_id === medicine.id);
      
      if (existingItem) {
        if (existingItem.qty + 1 > medicine.stock) {
          setError(`Only ${medicine.stock} items available!`);
          setTimeout(() => setError(''), 3000);
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.medicine_id === medicine.id
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.sell_price }
            : item
        );
      }
      
      return [...prevCart, {
        medicine_id: medicine.id,
        name: medicine.name,
        sell_price: medicine.sell_price,
        qty: 1,
        total: medicine.sell_price
      }];
    });
  };

  const handleUpdateQuantity = (medicineId: number, newQty: number) => {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    if (newQty < 1) {
      handleRemoveFromCart(medicineId);
      return;
    }

    if (newQty > medicine.stock) {
      setError(`Only ${medicine.stock} items available!`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.medicine_id === medicineId
          ? { ...item, qty: newQty, total: newQty * item.sell_price }
          : item
      )
    );
  };

  const handleRemoveFromCart = (medicineId: number) => {
    setCart(prevCart => prevCart.filter(item => item.medicine_id !== medicineId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        items: cart.map(item => ({
          medicine_id: item.medicine_id,
          qty: item.qty
        }))
      };
      
      const response = await api.post('/sales/', payload);
      alert(`Sale completed! Total: ৳${response.data.total}`);
      setCart([]);
      await fetchMedicines();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete sale');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // Show loading while checking auth
  if (!user && isAuthenticated === undefined) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4">
        <div className="bg-base-100 rounded-box shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">Point of Sale System</h1>
              <p className="text-base-content/70 mt-2">Welcome, {user?.full_name} ({user?.role})</p>
            </div>
            <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6 shadow-lg">
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-box shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-secondary">Products</h2>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="select select-bordered w-48"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {loading && medicines.length === 0 ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  {filteredMedicines.map(medicine => (
                    <div key={medicine.id} className="card bg-base-200 shadow-md">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="card-title text-base">{medicine.name}</h3>
                            <p className="text-sm text-base-content/70">{medicine.category}</p>
                          </div>
                          <div className="badge badge-primary">Stock: {medicine.stock}</div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-2xl font-bold text-accent">৳{medicine.sell_price}</span>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddToCart(medicine)}
                            disabled={medicine.stock === 0}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-box shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-secondary">Shopping Cart</h2>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <div className="text-center text-base-content/50 py-8">
                    Cart is empty
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.medicine_id} className="bg-base-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-accent">৳{item.sell_price} each</p>
                        </div>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleRemoveFromCart(item.medicine_id)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => handleUpdateQuantity(item.medicine_id, item.qty - 1)}
                          >
                            -
                          </button>
                          <span className="font-mono w-8 text-center">{item.qty}</span>
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => handleUpdateQuantity(item.medicine_id, item.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold">৳{item.total}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-base-300 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">৳{cartTotal}</span>
                  </div>
                  <button
                    className="btn btn-success w-full"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? <span className="loading loading-spinner"></span> : 'Complete Sale'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}