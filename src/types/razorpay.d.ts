declare module 'razorpay' {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  interface OrderOptions {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }

  interface RazorpayInstance {
    orders: {
      create(options: OrderOptions): Promise<{
        id: string;
        entity: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
        created_at: number;
      }>;
    };
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    orders: RazorpayInstance['orders'];
  }

  export default Razorpay;
} 