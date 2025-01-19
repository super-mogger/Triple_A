import { supabase, getAuthToken } from './config/supabase';

async function updateStatus(message: string, type: 'status' | 'error' | 'success' = 'status') {
  const element = document.getElementById(type);
  if (element) {
    element.textContent = message;
    element.classList.remove('hidden');
  }
}

async function testPaymentIntegration() {
  try {
    updateStatus('Checking authentication...');
    
    // 1. Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Please login to continue');
    }

    // 2. Get available plans
    updateStatus('Fetching membership plans...');
    const { data: plans, error: plansError } = await supabase
      .from('membership_plans')
      .select('id, name, price')
      .eq('status', 'active')
      .limit(1);

    if (plansError || !plans.length) {
      throw new Error('No active membership plans found');
    }

    const plan = plans[0]; // Use the first active plan
    updateStatus(`Creating order for ${plan.name}...`);

    // Get auth token
    const authToken = await getAuthToken();
    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    // 3. Create an order
    const orderResponse = await fetch('https://gjuecyugpchcwznewohb.supabase.co/functions/v1/payment-functions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        path: 'create-order',
        amount: plan.price,
        planId: plan.id,
        userId: user.id
      })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      throw new Error(`Failed to create order: ${error.message}`);
    }

    const { orderId } = await orderResponse.json();
    updateStatus('Initializing payment...');

    // 4. Initialize Razorpay payment
    const options = {
      key: 'rzp_test_GEZQfBnCrf1uyR',
      amount: plan.price * 100, // amount in paise
      currency: 'INR',
      name: 'Triple A Fitness',
      description: `${plan.name} Membership`,
      order_id: orderId,
      handler: async function(response: any) {
        try {
          updateStatus('Payment successful, verifying...', 'success');
          const verifyToken = await getAuthToken();

          // 5. Verify payment
          const verifyResponse = await fetch('https://gjuecyugpchcwznewohb.supabase.co/functions/v1/payment-functions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${verifyToken}`
            },
            body: JSON.stringify({
              path: 'verify-payment',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              userId: user.id
            })
          });

          if (!verifyResponse.ok) {
            const error = await verifyResponse.json();
            throw new Error(`Failed to verify payment: ${error.message}`);
          }

          const verifyResult = await verifyResponse.json();
          updateStatus('Payment completed successfully! Membership activated.', 'success');
          console.log('Payment verified:', verifyResult);

          // Redirect to membership page after 2 seconds
          setTimeout(() => {
            window.location.href = '/membership';
          }, 2000);

        } catch (error) {
          updateStatus(error instanceof Error ? error.message : 'Payment verification failed', 'error');
        }
      },
      prefill: {
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        contact: user.user_metadata?.phone || ''
      },
      theme: {
        color: '#10B981'
      },
      modal: {
        ondismiss: function() {
          updateStatus('Payment cancelled', 'error');
        }
      }
    };

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    script.onload = () => {
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    };

  } catch (error) {
    console.error('Payment test failed:', error);
    updateStatus(error instanceof Error ? error.message : 'Payment test failed', 'error');
  }
}

// Add button to trigger test
const button = document.createElement('button');
button.textContent = 'Test Payment';
button.className = 'bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all';
button.onclick = testPaymentIntegration;
document.body.appendChild(button); 