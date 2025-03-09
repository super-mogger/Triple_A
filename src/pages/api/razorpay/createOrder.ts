// This is a placeholder implementation that doesn't use Next.js
// Replace with your actual API implementation framework (Express, etc.)

interface Request {
  method: string;
  body: any;
  query: any;
  headers: Record<string, string>;
}

interface Response {
  status: (code: number) => Response;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

// Placeholder for Razorpay instance
const razorpay = {
  orders: {
    create: async (options: any) => {
      // This would be implemented with actual Razorpay SDK in production
      return { id: 'order_mockid', amount: options.amount };
    }
  }
};

export default async function handler(req: Request, res: Response) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { amount } = req.body;
    
    // Validate amount
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create order
    const options = {
      amount: Number(amount) * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json({
      id: order.id,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
} 