import React, { useState, useEffect } from 'react';
import useAdminInventoryApproval from '../../hooks/useAdminInventoryApproval';
import {
  Package,
  Search,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  MapPin,
  Smartphone,
  Battery,
  Cpu,
  HardDrive,
  Camera,
  Star,
  DollarSign,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  Send,
} from 'lucide-react';

const InventoryApproval = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
  });

  const {
    inventory: hookInventory,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    updateInventoryStatus,
    fetchInventory,
  } = useAdminInventoryApproval();

  useEffect(() => {
    setInventory(hookInventory);
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookInventory, hookStats, hookLoading]);

  const handleItemAction = async () => {
    if (!selectedItem || !actionType) return;

    try {
      await updateInventoryStatus(selectedItem._id, actionType, actionNotes);

      setShowActionModal(false);
      setSelectedItem(null);
      setActionType('');
      setActionNotes('');
    } catch (error) {
      console.error('Error updating inventory status:', error);
    }
  };

  const openActionModal = (item: any, action: any) => {
    setSelectedItem(item);
    setActionType(action);
    setShowActionModal(true);
  };

  const toggleItemExpansion = (itemId: any) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <Clock size={12} />;
      case 'approved':
        return <CheckCircle size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      case 'under_review':
        return <AlertTriangle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partner?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="text-center py-16">
          <Package size={48} className="text-slate-500 mb-4 mx-auto" />
          <p>Loading inventory submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Package size={32} />
          Inventory Approval
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => fetchInventory()}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Submissions</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-amber-500 text-white p-4 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.pending}</div>
            <div className="text-sm text-slate-500">Pending Review</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-emerald-500 text-white p-4 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.approved}</div>
            <div className="text-sm text-slate-500">Approved</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-red-500 text-white p-4 rounded-xl flex items-center justify-center">
            <XCircle size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.rejected}</div>
            <div className="text-sm text-slate-500">Rejected</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-purple-500 text-white p-4 rounded-xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.underReview}</div>
            <div className="text-sm text-slate-500">Under Review</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search by device name, brand, model, or partner..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-40 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e: any) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-40 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          <option value="smartphone">Smartphones</option>
          <option value="laptop">Laptops</option>
          <option value="tablet">Tablets</option>
          <option value="smartwatch">Smartwatches</option>
          <option value="headphones">Headphones</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredInventory.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Package size={48} className="mb-4 mx-auto" />
            <p className="text-lg">
              {searchTerm || statusFilter || categoryFilter
                ? 'No inventory items match your filters'
                : 'No inventory submissions found'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredInventory.map(item => (
              <div
                key={item._id}
                className="border-b border-gray-200 transition-all duration-200 hover:bg-gray-50 last:border-b-0"
              >
                <div
                  className="p-6 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleItemExpansion(item._id)}
                >
                  <div className="flex gap-4 items-center flex-1">
                    <img
                      src={item.images?.[0] || '/api/placeholder/60/60'}
                      alt={item.deviceName}
                      className="w-15 h-15 object-cover rounded-lg border border-gray-200"
                      onError={(e: any) => {
                        e.target.src = '/api/placeholder/60/60';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {item.deviceName || 'Unknown Device'}
                      </h3>
                      <div className="text-sm text-slate-500 mb-2">
                        {item.brand} {item.model} • {item.storage} • {item.condition}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <User size={14} />
                        {item.partner?.businessName || 'Unknown Partner'}
                        <MapPin size={14} className="ml-2" />
                        {item.partner?.city || 'Unknown Location'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <div className="text-xl font-bold text-gray-800">
                      ₹{(item.proposedPrice || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">Proposed Price</div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                      item.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : item.status === 'under_review'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {getStatusIcon(item.status)}
                    {item.status?.replace('_', ' ')?.charAt(0)?.toUpperCase() +
                      item.status?.replace('_', ' ')?.slice(1) || 'Pending'}
                  </span>

                  <button className="p-2 text-slate-500 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-all duration-200 ml-4">
                    {expandedItems.has(item._id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>

                {expandedItems.has(item._id) && (
                  <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Smartphone size={16} />
                          Device Specifications
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Brand:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.brand || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Model:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.model || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Storage:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.storage || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">RAM:</span>
                            <span className="text-gray-800 font-semibold">{item.ram || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Color:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.color || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Condition:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.condition || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Battery Health:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.batteryHealth || 'N/A'}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">IMEI:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.imei || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <DollarSign size={16} />
                          Pricing & Submission
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Proposed Price:</span>
                            <span className="text-gray-800 font-semibold">
                              ₹{(item.proposedPrice || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Market Price:</span>
                            <span className="text-gray-800 font-semibold">
                              ₹{(item.marketPrice || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Submitted:</span>
                            <span className="text-gray-800 font-semibold">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Quantity:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.quantity || 1}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Category:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.category || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Warranty:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.warranty || 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Box Available:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.hasBox ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-slate-500 font-medium">Accessories:</span>
                            <span className="text-gray-800 font-semibold">
                              {item.hasAccessories ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.description && (
                      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                        <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <FileText size={16} />
                          Description
                        </h4>
                        <div className="p-4 bg-gray-50 rounded-md text-gray-700">
                          {item.description}
                        </div>
                      </div>
                    )}

                    {item.images && item.images.length > 0 && (
                      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                        <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <ImageIcon size={16} />
                          Device Images ({item.images.length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                          {item.images.map((image: any, index: any) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Device ${index + 1}`}
                              className="w-full h-25 object-cover rounded-md border border-gray-200 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                              onError={(e: any) => {
                                e.target.src = '/api/placeholder/100/100';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                        <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <MessageSquare size={16} />
                          Partner Notes
                        </h4>
                        <div className="p-4 bg-gray-50 rounded-md text-gray-700">{item.notes}</div>
                      </div>
                    )}

                    <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openActionModal(item, 'under_review')}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <Eye size={16} />
                            Mark Under Review
                          </button>
                          <button
                            onClick={() => openActionModal(item, 'approved')}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(item, 'rejected')}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </>
                      )}
                      {item.status === 'under_review' && (
                        <>
                          <button
                            onClick={() => openActionModal(item, 'approved')}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(item, 'rejected')}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </>
                      )}
                      {(item.status === 'approved' || item.status === 'rejected') && (
                        <button
                          onClick={() => openActionModal(item, 'pending')}
                          className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <RefreshCw size={16} />
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showActionModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {actionType === 'approved' && 'Approve Inventory Item'}
                {actionType === 'rejected' && 'Reject Inventory Item'}
                {actionType === 'under_review' && 'Mark Under Review'}
                {actionType === 'pending' && 'Reset to Pending'}
              </h2>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-2 text-slate-500 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-500 mb-4">
                You are about to {actionType.replace('_', ' ')} the inventory item:
              </p>
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <strong>{selectedItem.deviceName}</strong>
                <br />
                {selectedItem.brand} {selectedItem.model} • ₹
                {(selectedItem.proposedPrice || 0).toLocaleString()}
              </div>

              <label className="block mb-2 font-medium text-gray-700">
                {actionType === 'approved'
                  ? 'Approval Notes (Optional):'
                  : actionType === 'rejected'
                    ? 'Rejection Reason:'
                    : actionType === 'under_review'
                      ? 'Review Notes (Optional):'
                      : 'Reset Notes (Optional):'}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e: any) => setActionNotes(e.target.value)}
                placeholder={`Enter ${actionType === 'rejected' ? 'reason for rejection' : 'notes'} here...`}
                required={actionType === 'rejected'}
                className="w-full min-h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-vertical focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowActionModal(false)}
                className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleItemAction}
                disabled={actionType === 'rejected' && !actionNotes.trim()}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  actionType === 'approved'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                    : actionType === 'rejected'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : actionType === 'under_review'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                        : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white'
                }`}
              >
                <Send size={16} />
                Confirm{' '}
                {actionType.replace('_', ' ').charAt(0).toUpperCase() +
                  actionType.replace('_', ' ').slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryApproval;
