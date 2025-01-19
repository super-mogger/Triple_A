import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Razorpay from 'https://esm.sh/razorpay@2.8.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RazorpayInstance {
  orders: {
    create(options: any): Promise<any>
  }
  payments: {
    fetch(paymentId: string): Promise<any>
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') ?? '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') ?? '',
    }) as RazorpayInstance

    const { path, userId, planId, amount, paymentId, orderId, signature } = await req.json()

    switch (path) {
      case 'create-order': {
        // Create Razorpay order
        const order = await razorpay.orders.create({
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          receipt: `order_${Date.now()}`,
        })

        // Store order details in Supabase
        const { data: payment, error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            user_id: userId,
            razorpay_order_id: order.id,
            amount: amount,
            currency: 'INR',
            status: 'created',
          })
          .select()
          .single()

        if (paymentError) throw paymentError

        return new Response(
          JSON.stringify({ orderId: order.id }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'verify-payment': {
        // Verify payment signature
        const text = orderId + '|' + paymentId
        const crypto = await import('https://deno.land/std@0.177.0/crypto/mod.ts')
        const key = new TextEncoder().encode(Deno.env.get('RAZORPAY_KEY_SECRET') ?? '')
        const msg = new TextEncoder().encode(text)
        const hmac = new crypto.HmacSha256(key)
        hmac.update(msg)
        const generatedSignature = btoa(
          String.fromCharCode(...new Uint8Array(hmac.digest()))
        )

        if (generatedSignature !== signature) {
          throw new Error('Invalid signature')
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(paymentId)

        // Update payment status in Supabase
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .update({
            razorpay_payment_id: paymentId,
            status: payment.status,
            payment_method: payment.method,
          })
          .eq('razorpay_order_id', orderId)

        if (paymentError) throw paymentError

        // Create membership if payment is successful
        if (payment.status === 'captured') {
          const startDate = new Date()
          const endDate = new Date()
          endDate.setMonth(endDate.getMonth() + 1) // 1 month membership

          const { data: membership, error: membershipError } = await supabaseClient
            .from('memberships')
            .insert({
              user_id: userId,
              plan_id: planId,
              amount: amount,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              status: 'active',
            })
            .select()
            .single()

          if (membershipError) throw membershipError

          return new Response(
            JSON.stringify({ membership }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        return new Response(
          JSON.stringify({ status: payment.status }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      default:
        throw new Error('Invalid path')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 