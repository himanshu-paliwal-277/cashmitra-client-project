import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from './ui/Button';

interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderNumber: string;
  loading?: boolean;
}

const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    onConfirm(reason.trim());
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-[500px] w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
            <h2 className="text-xl font-semibold text-gray-900 m-0">Cancel Order</h2>
          </div>
          <button
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <p className="text-base text-gray-700 mb-3 leading-relaxed">
            Are you sure you want to cancel order{' '}
            <strong className="text-gray-900 font-semibold">#{orderNumber}</strong>?
          </p>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            This action cannot be undone. Please provide a reason for cancellation.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="cancel-reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="cancel-reason"
                className={`w-full px-3 py-2 border rounded-lg text-sm resize-vertical transition-all box-border ${
                  error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/10'
                } focus:outline-none focus:ring-4 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-gray-400`}
                placeholder="Please explain why you want to cancel this order..."
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  setError('');
                }}
                rows={4}
                disabled={loading}
                maxLength={500}
              />
              {error && (
                <span className="flex items-center gap-1.5 text-red-500 text-xs mt-2">
                  <AlertCircle size={14} />
                  {error}
                </span>
              )}
              <span className="block text-right text-xs text-gray-600 mt-1.5">
                {reason.length}/500 characters
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 max-sm:flex-col-reverse">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={loading}
                className="min-w-[120px] max-sm:w-full"
              >
                Keep Order
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !reason.trim()}
                className="min-w-[120px] max-sm:w-full !bg-red-500 hover:!bg-red-600 disabled:!opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderDialog;
