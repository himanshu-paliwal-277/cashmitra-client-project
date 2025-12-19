import React from 'react';
import {
  X,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_acceptance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'picked':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Available';
      case 'pending_acceptance':
        return 'Pending Acceptance';
      case 'confirmed':
        return 'Confirmed';
      case 'picked':
        return 'Picked Up';
      case 'paid':
        return 'Paid';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'upi':
        return 'UPI Payment';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'wallet':
        return 'Wallet';
      case 'cash':
        return 'Cash on Pickup';
      default:
        return method;
    }
  };

  const getTimeSlotLabel = (window: string) => {
    switch (window) {
      case 'morning':
        return '10:00 AM - 03:00 PM';
      case 'afternoon':
        return '03:00 PM - 06:00 PM';
      case 'evening':
        return '06:00 PM - 09:00 PM';
      default:
        return window;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-600">#{order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Amount */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}
            >
              {getStatusLabel(order.status)}
            </span>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ₹{(order.actualAmount || order.quoteAmount).toLocaleString()}
              </div>
              {order.actualAmount && order.actualAmount !== order.quoteAmount && (
                <div className="text-sm text-gray-500 line-through">
                  ₹{order.quoteAmount.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={18} />
              Product Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Device:</span>
                <span className="font-medium">
                  {order.sessionId?.productId?.name || 'Device for Sale'}
                </span>
              </div>
              {order.sessionId?.variantId && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Variant:</span>
                  <span className="font-medium">{order.sessionId.variantId}</span>
                </div>
              )}
              {order.sessionId?.answers && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Assessment Answers:</span>
                  <div className="mt-1 text-sm">
                    {Object.entries(order.sessionId.answers).map(([key, answer]: [string, any]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">
                          {answer.answerText || answer.value || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User size={18} />
              Customer Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{order.pickup.address.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium flex items-center gap-1">
                  <Phone size={14} />
                  {order.pickup.address.phone}
                </span>
              </div>
              {order.userId && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-medium">{order.userId.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Phone:</span>
                    <span className="font-medium">{order.userId.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pickup Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={18} />
              Pickup Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Address:</span>
                <p className="font-medium">
                  {order.pickup.address.street}, {order.pickup.address.city},{' '}
                  {order.pickup.address.state} - {order.pickup.address.pincode}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <Calendar size={14} />
                    Date:
                  </span>
                  <p className="font-medium">{formatDate(order.pickup.slot.date)}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <Clock size={14} />
                    Time Slot:
                  </span>
                  <p className="font-medium">{getTimeSlotLabel(order.pickup.slot.window)}</p>
                </div>
              </div>
              {order.distanceFormatted && (
                <div>
                  <span className="text-gray-600 text-sm">Distance from your shop:</span>
                  <p className="font-medium">{order.distanceFormatted}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard size={18} />
              Payment Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{getPaymentMethodLabel(order.payment.method)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.payment.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : order.payment.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.payment.status}
                </span>
              </div>
              {order.payment.transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium font-mono text-sm">
                    {order.payment.transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Agent (if any) */}
          {order.assignedAgent && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <UserCheck size={18} />
                Assigned Agent
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{order.assignedAgent?.user?.name || 'Agent'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-medium">{order.assignedAgent?.agentCode || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Phone size={14} />
                    {order.assignedAgent?.user?.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={18} />
              Order Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">
                  {formatDate(order.updatedAt)} at {formatTime(order.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes (if any) */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                Notes
              </h3>
              <p className="text-yellow-800">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
