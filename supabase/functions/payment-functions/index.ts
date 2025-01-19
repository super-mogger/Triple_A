import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Razorpay from 'https://esm.sh/razorpay@2.8.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, razorpay-signature, x-razorpay-signature',
  'Access-Control-Max-Age': '86400',
}

interface RazorpayInstance {
  orders: {
    create(options: any): Promise<any>
  }
  payments: {
    fetch(paymentId: string): Promise<any>
  }
}

interface PaymentError extends Error {
  code?: string;
  metadata?: any;
}

const createPaymentError = (message: string, code: string, metadata?: any): PaymentError => {
  const error = new Error(message) as PaymentError;
  error.code = code;
  error.metadata = metadata;
  return error;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw createPaymentError('No authorization header', 'UNAUTHORIZED');
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay keys not configured:', {
        keyId: razorpayKeyId ? 'Set' : 'Missing',
        keySecret: razorpayKeySecret ? 'Set' : 'Missing'
      });
      throw createPaymentError(
        'Razorpay keys not configured',
        'CONFIGURATION_ERROR',
        { missingKeys: { keyId: !razorpayKeyId, keySecret: !razorpayKeySecret } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user's JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw createPaymentError('Invalid authorization token', 'UNAUTHORIZED');
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    }) as RazorpayInstance

    // Log successful initialization
    console.log('Razorpay initialized successfully for user:', user.id);

    // Handle webhook requests separately as they don't need user auth
    if (req.headers.get('x-razorpay-signature')) {
      const webhookSignature = req.headers.get('x-razorpay-signature');
      if (!webhookSecret) {
        throw createPaymentError('Webhook secret not configured', 'CONFIGURATION_ERROR');
      }

      const body = await req.text();
      const crypto = await import('https://deno.land/std@0.177.0/crypto/mod.ts');
      const key = new TextEncoder().encode(webhookSecret);
      const msg = new TextEncoder().encode(body);
      const hmac = new crypto.HmacSha256(key);
      hmac.update(msg);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== webhookSignature) {
        throw createPaymentError('Invalid webhook signature', 'INVALID_SIGNATURE');
      }

      const event = JSON.parse(body);
      
      // Handle webhook event
      switch (event.event) {
        case 'payment.captured':
          await handlePaymentSuccess(event.payload.payment.entity, supabaseClient);
          break;
        case 'payment.failed':
          await handlePaymentFailure(event.payload.payment.entity, supabaseClient);
          break;
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const { path, userId, planId, amount, paymentId, orderId, signature } = await req.json();

    // Verify userId matches the authenticated user
    if (userId !== user.id) {
      throw createPaymentError('User ID mismatch', 'UNAUTHORIZED');
    }

    switch (path) {
      case 'create-order': {
        const orderOptions = {
          amount: amount * 100,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            user_id: userId,
            plan_id: planId
          },
          payment_capture: 1
        };

        // Create Razorpay order
        const order = await razorpay.orders.create(orderOptions);

        // Store order details in Supabase
        const { data: payment, error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            user_id: userId,
            razorpay_order_id: order.id,
            amount: amount,
            currency: 'INR',
            status: 'created',
            metadata: {
              plan_id: planId,
              notes: orderOptions.notes
            }
          })
          .select()
          .single()

        if (paymentError) {
          throw createPaymentError(
            'Failed to store payment details',
            'DATABASE_ERROR',
            { supabaseError: paymentError }
          );
        }

        return new Response(
          JSON.stringify({ orderId: order.id }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'verify-payment': {
        try {
          // Fetch payment details first
          const payment = await razorpay.payments.fetch(paymentId);
          
          // Verify payment signature
          const text = orderId + '|' + paymentId;
          const crypto = await import('https://deno.land/std@0.177.0/crypto/mod.ts');
          const key = new TextEncoder().encode(razorpayKeySecret);
          const msg = new TextEncoder().encode(text);
          const hmac = new crypto.HmacSha256(key);
          hmac.update(msg);
          const generatedSignature = btoa(
            String.fromCharCode(...new Uint8Array(hmac.digest()))
          );

          if (generatedSignature !== signature) {
            throw createPaymentError('Invalid signature', 'INVALID_SIGNATURE');
          }

          await handlePaymentSuccess(payment, supabaseClient);

          return new Response(
            JSON.stringify({ status: payment.status }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        } catch (error) {
          console.error('Error in verify-payment:', error);
          await handlePaymentFailure(error, supabaseClient);
          throw error;
        }
      }

      default:
        throw createPaymentError('Invalid path', 'INVALID_REQUEST')
    }
  } catch (error) {
    console.error('Payment processing error:', {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message,
      metadata: error.metadata
    });

    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        metadata: error.metadata
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.code === 'UNAUTHORIZED' ? 401 : 400,
      }
    )
  }
})

async function handlePaymentSuccess(payment: any, supabaseClient: any) {
  const { error: paymentError } = await supabaseClient
    .from('payments')
    .update({
      razorpay_payment_id: payment.id,
      status: payment.status === 'captured' ? 'success' : 'failed',
      payment_method: payment.method,
      metadata: {
        payment_details: payment,
        updated_at: new Date().toISOString()
      }
    })
    .eq('razorpay_order_id', payment.order_id);

  if (paymentError) {
    throw createPaymentError(
      'Failed to update payment status',
      'DATABASE_ERROR',
      { supabaseError: paymentError }
    );
  }

  if (payment.status === 'captured') {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { error: membershipError } = await supabaseClient
      .from('memberships')
      .insert({
        user_id: payment.notes.user_id,
        plan_id: payment.notes.plan_id,
        payment_id: payment.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
      });

    if (membershipError) {
      throw createPaymentError(
        'Failed to create membership',
        'DATABASE_ERROR',
        { supabaseError: membershipError }
      );
    }
  }
}

async function handlePaymentFailure(error: any, supabaseClient: any) {
  const orderId = error.metadata?.order_id;
  if (!orderId) return;

  const { error: updateError } = await supabaseClient
    .from('payments')
    .update({
      status: 'failed',
      metadata: {
        error: {
          message: error.message,
          code: error.code,
          metadata: error.metadata
        },
        updated_at: new Date().toISOString()
      }
    })
    .eq('razorpay_order_id', orderId);

  if (updateError) {
    console.error('Failed to update payment failure status:', updateError);
  }
} 