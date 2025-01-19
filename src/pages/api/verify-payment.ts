import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const plans = {
  monthly: {
    duration: 30, // days
    name: 'Monthly Plan'
  },
  quarterly: {
    duration: 90,
    name: 'Quarterly Plan'
  },
  biannual: {
    duration: 180,
    name: 'Biannual Plan'
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, orderId, signature } = req.body;
    const { user } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1]);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error('Invalid signature');
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    const order = await razorpay.orders.fetch(orderId);

    // Start a Supabase transaction
    const { data: { session } } = await supabase.auth.getSession();

    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        status: payment.status,
        payment_method: payment.method,
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', orderId);

    if (paymentError) throw paymentError;

    if (payment.status === 'captured') {
      // Calculate membership dates
      const startDate = new Date();
      const endDate = new Date();
      const planDuration = plans[order.notes.planId as keyof typeof plans].duration;
      endDate.setDate(endDate.getDate() + planDuration);

      // Create new membership
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: user.id,
          plan_id: order.notes.planId,
          plan_name: plans[order.notes.planId as keyof typeof plans].name,
          amount: order.amount / 100,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (membershipError) throw membershipError;

      // Update payment with membership ID
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          membership_id: membership.id
        })
        .eq('razorpay_order_id', orderId);

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        membership
      });
    }

    return res.status(200).json({
      success: true,
      status: payment.status
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
} 