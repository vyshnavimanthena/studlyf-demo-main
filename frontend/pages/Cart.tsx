import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { useAuth } from '../AuthContext';

interface CartItem {
  _id?: string;
  course_id: string;
  course_title: string;
  course_price: number;
  added_at?: string;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const userId = user?.uid || 'test-user';

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/cart/${userId}`);
        const data = await res.json();
        setCartItems(data.items || []);
      } catch (err) {
        try { console.error('Error fetching cart:', err instanceof Error ? err.message : String(err)); } catch (_) {}
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  const handleRemoveItem = async (courseId: string) => {
    setRemoving(courseId);
    try {
      await fetch(`${API_BASE_URL}/api/cart/${userId}/remove/${courseId}`, {
        method: 'DELETE',
      });
      setCartItems(items => items.filter(item => item.course_id !== courseId));
    } catch (err) {
      try { console.error('Error removing item:', err instanceof Error ? err.message : String(err)); } catch (_) {}
    } finally {
      setRemoving(null);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.course_price, 0);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/checkout/${userId}`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        navigate('/learn/checkout', { state: { enrolledCourses: data.enrolled_courses } });
      }
    } catch (err) {
      try { console.error('Error during checkout:', err instanceof Error ? err.message : String(err)); } catch (_) {}
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-40 pb-32 px-3 sm:px-6 bg-white min-h-screen flex items-center justify-center">
        <div className="font-mono text-xs tracking-widest uppercase text-[#7C3AED]">Synchronizing Cart...</div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-3 sm:px-6 bg-white min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-tech opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#7C3AED]/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-6xl sm:text-7xl font-black text-[#111827] tracking-tighter uppercase mb-4">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B] inline-block">CART</span>
            </h1>
            <p className="text-lg text-[#6B7280] font-medium">
              {cartItems.length} {cartItems.length === 1 ? 'course' : 'courses'} ready to enroll
            </p>
          </motion.div>
        </header>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 border border-dashed border-gray-300 rounded-2xl"
          >
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-black text-[#111827] mb-2">Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Start exploring courses to add them to your cart</p>
            <button
              onClick={() => navigate('/learn/courses')}
              className="glow-btn glow-btn-purple inline-flex items-center gap-2 px-8 py-4 text-sm uppercase tracking-[0.2em] rounded-xl"
            >
              <span className="glow-orb glow-orb-1" />
              <span className="glow-orb glow-orb-2" />
              <span className="glow-orb glow-orb-3" />
              <span className="glow-label flex items-center gap-2">Browse Courses <ArrowRight className="w-4 h-4" /></span>
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={item.course_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-[#111827] mb-1">{item.course_title}</h3>
                      <p className="text-sm text-[#6B7280]">Course ID: {item.course_id.substring(0, 12)}...</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-black text-[#111827]">
                          ₹{Number(item.course_price).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.course_id)}
                        disabled={removing === item.course_id}
                        className="p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Continue Shopping */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => navigate('/learn/courses')}
                className="w-full mt-8 py-4 text-[#7C3AED] font-black text-sm uppercase tracking-[0.2em] border border-[#7C3AED]/30 rounded-xl hover:bg-[#F5F3FF] transition-all"
              >
                Continue Shopping
              </motion.button>
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#F9FAFB] to-white border border-gray-100 rounded-2xl p-6 sm:p-8 h-fit sticky top-40"
            >
              <h2 className="text-xl font-black text-[#111827] mb-6 uppercase tracking-tight">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold text-[#111827]">₹{Number(totalPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Shipping</span>
                  <span className="font-bold text-green-600">Free</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Tax</span>
                  <span className="font-bold text-[#111827]">₹0</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                <span className="text-lg font-black text-[#111827]">Total</span>
                <span className="text-3xl font-black text-[#7C3AED]">₹{Number(totalPrice).toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || cartItems.length === 0}
                className="glow-btn glow-btn-purple w-full py-4 text-sm uppercase tracking-[0.3em] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="glow-orb glow-orb-1" />
                <span className="glow-orb glow-orb-2" />
                <span className="glow-orb glow-orb-3" />
                <span className="glow-label flex items-center gap-2">
                  {checkoutLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                  ) : (
                    <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
                  )}
                </span>
              </button>

              <p className="text-[10px] text-[#6B7280] text-center mt-4 uppercase tracking-widest">
                ✓ Secure checkout
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

