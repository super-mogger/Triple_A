import { useState, useEffect } from 'react';
import { loadRazorpayScript, createOrder, initializeRazorpayPayment } from '../services/RazorpayService';
import { subscribeToPaymentUpdates } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

export default function TestPayment() {
  const [loading, setLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (currentOrderId) {
      const unsubscribe = subscribeToPaymentUpdates(currentOrderId, (payment) => {
        console.log('Payment status updated:', payment);
        if (payment.status === 'success') {
          alert('Payment successful!');
          setCurrentOrderId(null);
        } else if (payment.status === 'failed') {
          alert('Payment failed!');
          setCurrentOrderId(null);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [currentOrderId]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const amount = 100; // ₹100
      const planId = 'test_plan';
      const orderId = await createOrder(amount, planId);
      setCurrentOrderId(orderId);

      // Initialize payment
      await initializeRazorpayPayment(
        amount,
        'INR',
        orderId,
        planId,
        {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: user?.user_metadata?.phone || '',
        },
        (response) => {
          console.log('Payment successful:', response);
        },
        (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed: ' + error.message);
          setCurrentOrderId(null);
        }
      );
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error as Error).message);
      setCurrentOrderId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Test Payment (₹100)'}
      </button>
    </div>
  );
} 