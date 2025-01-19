import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { loadRazorpayScript, createOrder, initializeRazorpayPayment } from '../services/RazorpayService';
import { getMembershipPlans, getUserActiveMembership, getUserPayments } from '../services/supabaseService';
import type { MembershipPlan, PaymentRecord } from '../services/supabaseService';

export default function PaymentTest() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [activeMembership, setActiveMembership] = useState<PaymentRecord | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load Razorpay script
      await loadRazorpayScript();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch membership plans
      const membershipPlans = await getMembershipPlans();
      setPlans(membershipPlans);

      // Fetch active membership
      const active = await getUserActiveMembership(user.id);
      setActiveMembership(active);

      // Fetch payment history
      const history = await getUserPayments(user.id);
      setPaymentHistory(history);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (plan: MembershipPlan) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create order
      const orderId = await createOrder(plan.price * 100, plan.id);

      // Initialize payment
      await initializeRazorpayPayment(
        plan.price * 100,
        'INR',
        orderId,
        plan.id,
        {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || ''
        },
        async (response) => {
          console.log('Payment successful:', response);
          await loadInitialData(); // Reload data after successful payment
        },
        (error) => {
          console.error('Payment failed:', error);
          setError('Payment failed: ' + error.message);
        }
      );

    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-8">
          {/* Active Membership */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Active Membership
            </h2>
            {activeMembership ? (
              <div className="space-y-2">
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Active Plan: {plans.find(p => p.id === activeMembership.plan_id)?.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Payment ID: {activeMembership.payment_id}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Amount: ₹{activeMembership.amount / 100}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No active membership</p>
            )}
          </div>

          {/* Available Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                  ₹{plan.price}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="text-emerald-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            ))}
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Payment History
            </h2>
            {paymentHistory.length > 0 ? (
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {plans.find(p => p.id === payment.plan_id)?.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Order ID: {payment.order_id}
                        </p>
                        {payment.payment_id && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Payment ID: {payment.payment_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{payment.amount / 100}
                        </p>
                        <p className={`text-sm ${
                          payment.status === 'success' 
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : payment.status === 'failed'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No payment history</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 