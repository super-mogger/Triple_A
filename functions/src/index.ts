/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Razorpay with environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are missing');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string
});

// Log environment variables (without secrets)
console.log('Function initialized with config:', {
  region: 'asia-south1',
  razorpayKeyExists: !!process.env.RAZORPAY_KEY_ID,
  razorpaySecretExists: !!process.env.RAZORPAY_KEY_SECRET
});

interface OrderData {
  amount: number;
  planId: string;
}

interface PaymentData {
  paymentId: string;
  orderId: string;
  signature: string;
}

interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  email: string;
  contact: string;
  created_at: number;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

interface WebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        email: string;
        contact: string;
        notes: Record<string, string>;
      }
    }
    order: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        notes: Record<string, string>;
      }
    }
  }
  created_at: number;
}

export const createRazorpayOrder = onCall(
  { 
    cors: true,
    region: 'asia-south1',
    maxInstances: 10
  }, 
  async (request) => {
    console.log('Creating Razorpay order with data:', { ...request.data, auth: !!request.auth });

    if (!request.auth) {
      console.error('Authentication missing');
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { amount, planId } = request.data as OrderData;
    if (!amount || !planId) {
      console.error('Invalid arguments:', { amount, planId });
      throw new HttpsError(
        'invalid-argument',
        'The function must be called with amount and planId.'
      );
    }

    try {
      console.log('Creating order with amount:', amount);
      const orderData = {
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          planId,
          userId: request.auth.uid
        },
        payment_capture: true
      };

      const order = await razorpay.orders.create(orderData) as RazorpayOrder;
      console.log('Order created successfully:', order.id);

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new HttpsError(
        'internal',
        'Error creating payment order'
      );
    }
  }
);

export const verifyRazorpayPayment = onCall(
  { 
    cors: true,
    region: 'asia-south1',
    maxInstances: 10
  }, 
  async (request) => {
    console.log('Verifying payment with data:', { ...request.data, auth: !!request.auth });

    if (!request.auth) {
      console.error('Authentication missing');
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { paymentId, orderId, signature } = request.data as PaymentData;
    if (!paymentId || !orderId || !signature) {
      console.error('Invalid arguments:', { paymentId, orderId, signatureExists: !!signature });
      throw new HttpsError(
        'invalid-argument',
        'The function must be called with paymentId, orderId and signature.'
      );
    }

    try {
      // Verify signature
      const text = orderId + '|' + paymentId;
      const crypto = require('crypto');
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
        .update(text)
        .digest('hex');

      const isValid = generated_signature === signature;
      console.log('Signature verification:', { isValid, paymentId });

      if (isValid) {
        // Get payment details
        const payment = await razorpay.payments.fetch(paymentId) as RazorpayPayment;
        console.log('Payment details fetched:', { paymentId, status: payment.status });
        
        // Store payment details in Firestore
        await admin.firestore().collection('payments').doc(paymentId).set({
          orderId: payment.order_id,
          paymentId: payment.id,
          userId: request.auth.uid,
          amount: Number(payment.amount) / 100, // Convert from paise to rupees
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          createdAt: new Date(payment.created_at * 1000), // Convert Unix timestamp to Date
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('Payment details stored in Firestore');

        // If payment is authorized but not captured, capture it
        if (payment.status === 'authorized') {
          const captureResponse = await razorpay.payments.capture(paymentId, payment.amount, payment.currency);
          console.log('Payment captured successfully:', captureResponse.status);
        }
      }

      return {
        verified: isValid,
        orderId,
        paymentId
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new HttpsError(
        'internal',
        'Error verifying payment'
      );
    }
  }
);

// Add this new function to handle webhooks
export const razorpayWebhook = onRequest(
  { 
    cors: true,
    region: 'asia-south1'
  }, 
  async (req, res) => {
    try {
      // Verify webhook signature
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('Webhook secret is missing');
        res.status(500).send('Webhook secret is missing');
        return;
      }

      const webhookSignature = req.headers['x-razorpay-signature'];
      if (!webhookSignature) {
        console.error('Webhook signature is missing');
        res.status(400).send('Webhook signature is missing');
        return;
      }

      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== webhookSignature) {
        console.error('Invalid webhook signature');
        res.status(400).send('Invalid webhook signature');
        return;
      }

      const event = req.body as WebhookEvent;
      console.log('Received webhook event:', event.event);

      // Handle payment success event
      if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        const userId = payment.notes.userId;
        const planId = payment.notes.planId;

        if (!userId || !planId) {
          console.error('Missing user ID or plan ID in payment notes');
          res.status(400).send('Missing user ID or plan ID');
          return;
        }

        // Calculate membership dates based on plan
        const startDate = new Date();
        let endDate = new Date();
        switch (planId) {
          case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case 'quarterly':
            endDate.setMonth(endDate.getMonth() + 3);
            break;
          case 'yearly':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
          default:
            endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
        }

        // Update user's membership status
        await admin.firestore().collection('users').doc(userId).update({
          membership: {
            planId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            isActive: true,
            lastPaymentId: payment.id
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('Updated membership for user:', userId);
      }

      res.status(200).send('Webhook processed successfully');
      return;
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).send('Error processing webhook');
      return;
    }
  }
);
