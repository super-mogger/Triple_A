import { ArrowLeft, Download, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../context/PaymentContext';

export default function PaymentHistory() {
  const navigate = useNavigate();
  const { payments, loading } = usePayment();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: 'success' | 'failed' | 'pending') => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500/20 text-emerald-500';
      case 'failed':
        return 'bg-red-500/20 text-red-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-[#282828] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Payment History</h1>
        </div>

        {/* Payment History */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-[#282828]">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Recent Transactions
            </h2>
          </div>
          <div className="p-6">
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-[#282828] rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#333] rounded-full">
                        <Receipt className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{payment.planName}</h3>
                        <p className="text-sm text-gray-400">{formatDate(payment.date)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Transaction ID: {payment.transactionId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">₹{payment.amount}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      {payment.invoiceUrl && (
                        <button
                          onClick={() => window.open(payment.invoiceUrl, '_blank')}
                          className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 text-sm mt-2"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">No payment history found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 