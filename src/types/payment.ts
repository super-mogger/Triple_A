export interface Membership {
  planId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  lastPaymentId: string;
}

export interface Payment {
  id: string;
  userId: string;
  date: string;
  amount: number;
  planId: string;
  planName: string;
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  paymentMethod: string;
  orderId: string;
  invoiceUrl?: string;
}

export interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
} 