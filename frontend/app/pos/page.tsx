// app/pos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

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
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      console.log("POS Page - User:", parsedUser);
    } catch (err) {
      console.error("Error parsing user:", err);
      router.push('/login');
      return;
    }
    
    setCheckingAuth(false);
    fetchMedicines();
  }, [router]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      console.log("Fetching medicines...");
      const response = await api.get('/medicines/');
      const medicinesData = response.data as Medicine[];
      console.log("Medicines fetched:", medicinesData.length);
      setMedicines(medicinesData);
      
      // Fixed: Explicitly type the map result
      const uniqueCategories: string[] = [...new Set(
        medicinesData.map((med: Medicine) => String(med.category))
      )];
      setCategories(uniqueCategories);
      setError('');
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        setError('Failed to fetch medicines');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4">
        <div className="bg-base-100 rounded-box shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">Point of Sale System</h1>
              <div className="mt-2">
                <p className="text-base-content/70">Welcome, {user?.full_name} ({user?.role})</p>
                <span className="badge badge-secondary badge-sm mt-1">
                  {user?.role === "admin" ? "Admin Access" : "Cashier Mode"}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
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
                    placeholder="🔍 Search medicines..."
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
                  {filteredMedicines.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-base-content/50">
                      No products found
                    </div>
                  ) : (
                    filteredMedicines.map(medicine => (
                      <div key={medicine.id} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="card-title text-base font-bold">{medicine.name}</h3>
                              <p className="text-sm text-base-content/70">{medicine.category}</p>
                            </div>
                            <div className={`badge ${medicine.stock > 10 ? 'badge-primary' : medicine.stock > 0 ? 'badge-warning' : 'badge-error'}`}>
                              Stock: {medicine.stock}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div>
                              <span className="text-2xl font-bold text-accent">৳{medicine.sell_price}</span>
                              {medicine.buy_price && (
                                <p className="text-xs text-base-content/50">Cost: ৳{medicine.buy_price}</p>
                              )}
                            </div>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddToCart(medicine)}
                              disabled={medicine.stock === 0}
                            >
                              {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-box shadow-lg p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-secondary">Shopping Cart</h2>
                {cart.length > 0 && (
                  <button 
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => setCart([])}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <div className="text-center text-base-content/50 py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
                    </svg>
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
                          <span className="font-mono w-8 text-center font-bold">{item.qty}</span>
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => handleUpdateQuantity(item.medicine_id, item.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-lg">৳{item.total}</span>
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
                    {loading ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Processing...
                      </>
                    ) : (
                      'Complete Sale'
                    )}
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