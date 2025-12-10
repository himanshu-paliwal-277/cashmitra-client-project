/**
 * @fileoverview Lead Details Modal Component
 * @description Modal component to display detailed information about a lead
 * @author Cashmitra Development Team
 * @version 1.0.0
 */

import { cn } from '../../../utils/utils';
import {
  Package,
  User,
  Mail,
  Phone,
  Calendar,
  X,
  ArrowRight,
} from 'lucide-react';

interface LeadDetailsModalProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOrders: (orderType: 'buy' | 'sell') => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  isOpen,
  onClose,
  onNavigateToOrders,
  formatCurrency,
  formatDate,
  getStatusColor,
}) => {
  if (!isOpen || !lead) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="text-blue-600" size={24} />
              Lead Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {lead.orderType === 'buy' ? 'Buy Order' : 'Sell Order'} • {formatDate(lead.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Order Type & Status */}
          <section>
            <div className="flex flex-wrap gap-3">
              <span
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-bold',
                  lead.orderType === 'buy'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                )}
              >
                {lead.orderType === 'buy' ? '🛒 BUY ORDER' : '💰 SELL ORDER'}
              </span>
              <span
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold capitalize',
                  getStatusColor(lead.status)
                )}
              >
                Status: {lead.status}
              </span>
            </div>
          </section>

          {/* Customer Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <User size={12} />
                  Name
                </div>
                <div className="font-semibold text-gray-900">{lead.user?.name || 'Guest'}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Mail size={12} />
                  Email
                </div>
                <div className="font-semibold text-gray-900 break-all">
                  {lead.user?.email || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Phone size={12} />
                  Phone
                </div>
                <div className="font-semibold text-gray-900">{lead.user?.phone || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Calendar size={12} />
                  Order Date
                </div>
                <div className="font-semibold text-gray-900">{formatDate(lead.createdAt)}</div>
              </div>
            </div>
          </section>

          {/* Order Value */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
              Order Value
            </h3>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-l-4 border-emerald-500">
              <div className="text-sm text-gray-600 mb-2">Total Amount</div>
              <div className="text-4xl font-bold text-emerald-600">
                {formatCurrency(lead.totalAmount || 0)}
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToOrders(lead.orderType);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
              >
                <ArrowRight size={20} />
                Go to {lead.orderType === 'buy' ? 'Buy' : 'Sell'} Orders Page
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
