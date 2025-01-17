import * as functions from 'firebase-functions';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: 'rzp_test_GEZQfBnCrf1uyR',
  key_secret: 'Z0GdpsZJIu2kRgp2cboJiBjM'
});

export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be logged in to create an order'
    );
  }

  try {
    const { amount, currency } = data;
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: context.auth.uid
      }
    };

    const order = await razorpay.orders.create(options);
    return { orderId: order.id };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create payment order'
    );
  }
});

export const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be logged in to verify payment'
    );
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;
    
    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', 'Z0GdpsZJIu2kRgp2cboJiBjM')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return { verified: true };
    } else {
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to verify payment'
    );
  }
});
