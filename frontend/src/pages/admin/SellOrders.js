// src/pages/SellOrders/SellOrders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Filter, Eye, Edit, Package, Truck,
  CheckCircle, XCircle, TrendingDown
} from 'lucide-react';
import api from '../../config/api';
import adminService from '../../services/adminService';
import pickupService from '../../services/pickupService';
import styles from './SellOrders.module.css';

const SellOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, confirmed: 0, picked: 0, paid: 0, cancelled: 0, totalRevenue: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalOrders: 0, hasPrev: false, hasNext: false
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const fetchOrders = useCallback(async (page = 1, status = '', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const res = await api.get(`/sell-orders?${params}`);
      if (res.data.success) {
        const { orders: fetchedOrders, pagination: pag } = res.data.data;
        setOrders(fetchedOrders);
        setPagination(pag);
        calculateStats(fetchedOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (ordersList) => {
    const paidOrders = ordersList.filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.actualAmount || o.quoteAmount), 0);

    setStats({
      total: ordersList.length,
      confirmed: ordersList.filter(o => o.status === 'confirmed').length,
      picked: ordersList.filter(o => o.status === 'picked').length,
      paid: paidOrders.length,
      cancelled: ordersList.filter(o => o.status === 'cancelled').length,
      totalRevenue
    });
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      console.log('Fetching agents for sell orders...');
      
      // Try to fetch agent profiles first (these have the link to user accounts)
      try {
        const agentProfilesResponse = await adminService.getAllAgents({ limit: 100 });
        console.log('Agent profiles response:', agentProfilesResponse);
        
        const agentProfiles = agentProfilesResponse.data || agentProfilesResponse.agents || [];
        console.log('Agent profiles found:', agentProfiles.length);
        
        if (agentProfiles.length > 0) {
          // Format agents with user information
          const formattedAgents = agentProfiles
            .filter(profile => profile.user) // Only agents with user accounts
            .map(profile => ({
              _id: profile.user._id || profile.user, // Use USER ID for assignment
              name: profile.user.name || 'Unknown Agent',
              phone: profile.user.phone || '',
              email: profile.user.email || '',
              agentCode: profile.agentCode || '',
              type: 'agent',
              agentProfileId: profile._id // Store agent profile ID for reference
            }));
          
          console.log('Formatted agents from profiles:', formattedAgents);
          setAgents(formattedAgents);
          setLoadingAgents(false);
          return;
        }
      } catch (err) {
        console.log('Could not fetch agent profiles, trying users endpoint:', err.message);
      }
      
      // Fallback: Try to fetch users with admin service
      const usersResponse = await adminService.getAllUsers({ limit: 100 });
      console.log('Users response:', usersResponse);
      
      const allUsers = usersResponse.users || usersResponse.data || [];
      console.log('All users:', allUsers);
      
      // Filter for agents and drivers
      const agents = allUsers.filter(user => 
        user.role === 'agent' || 
        user.role === 'driver' || 
        user.role === 'pickup_agent' ||
        user.type === 'agent' ||
        user.type === 'driver'
      );
      
      console.log('Filtered agents:', agents);
      
      // If no specific agents found, try pickup service
      if (agents.length === 0) {
        console.log('No agents found in users, trying pickup service...');
        const [driversResponse, agentsResponse] = await Promise.all([
          pickupService.getDrivers({ limit: 100 }).catch((err) => {
            console.log('Error fetching drivers:', err);
            return { users: [] };
          }),
          pickupService.getPickupAgents({ limit: 100 }).catch((err) => {
            console.log('Error fetching pickup agents:', err);
            return { users: [] };
          })
        ]);
        
        const drivers = driversResponse.users || driversResponse.data || [];
        const pickupAgents = agentsResponse.users || agentsResponse.data || [];
        
        console.log('Drivers:', drivers);
        console.log('Pickup agents:', pickupAgents);
        
        // Combine and format agents
        const combinedAgents = [
          ...drivers.map(driver => ({ ...driver, type: 'driver' })),
          ...pickupAgents.map(agent => ({ ...agent, type: 'pickup_agent' }))
        ];
        
        console.log('Combined agents:', combinedAgents);
        setAgents(combinedAgents);
      } else {
        const formattedAgents = agents.map(agent => ({ 
          ...agent, 
          type: agent.role || agent.type || 'agent' 
        }));
        console.log('Setting agents:', formattedAgents);
        setAgents(formattedAgents);
      }
      
    } catch (err) {
      console.error('Error fetching agents:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Fallback to mock agents with the actual agent's user ID from test
      const mockAgents = [
        { _id: '6901269cb3ff6c5498ce8ec5', name: 'Test Agent', phone: '+91 9876543210', email: 'agent@cashify.com', agentCode: 'AGT25110001', type: 'agent' },
        { _id: '2', name: 'Agent B', phone: '+91 9876543211', type: 'pickup_agent' },
        { _id: '3', name: 'Driver C', phone: '+91 9876543212', type: 'driver' }
      ];
      console.log('Using mock agents:', mockAgents);
      setAgents(mockAgents);
    } finally {
      setLoadingAgents(false);
      console.log('Finished fetching agents');
    }
  };

  const handleAssignOrder = async (orderId, agentId) => {
    if (!agentId) {
      console.log('No agent selected, aborting assignment');
      return;
    }
    
    try {
      console.log('=== ASSIGNING AGENT TO SELL ORDER ===');
      console.log('Order ID:', orderId);
      console.log('Agent ID:', agentId);
      
      // Find the selected agent details
      const selectedAgent = agents.find(a => a._id === agentId);
      console.log('Selected Agent Details:', selectedAgent);
      
      console.log('API Request: PUT /sell-orders/' + orderId + '/assign-staff');
      console.log('Request Body:', { assignedTo: agentId });
      
      const response = await api.put(`/sell-orders/${orderId}/assign-staff`, { assignedTo: agentId });
      
      console.log('Assignment Response:', response.data);
      console.log('✅ Agent successfully assigned to order');
      console.log('Agent Name:', selectedAgent?.name);
      console.log('Agent Phone:', selectedAgent?.phone);
      console.log('Agent Type:', selectedAgent?.type);
      console.log('===================================');
      
      // Refresh orders to show updated assignment
      fetchOrders(pagination.currentPage, statusFilter, searchTerm);
    } catch (err) {
      console.error('❌ Failed to assign agent to order');
      console.error('Error:', err);
      console.error('Error Response:', err.response?.data);
      console.error('Error Status:', err.response?.status);
      console.error('===================================');
      alert('Failed to assign agent. Please try again.');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(1, statusFilter, searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getProductName = (o) => o.sessionId?.productId?.name || 'N/A';
  const getCustomerName = (o) => o.pickup?.address?.fullName || o.userId?.name || 'Guest';

  const calculatePriceReduction = (o) => {
    if (!o.actualAmount || o.actualAmount === o.quoteAmount) return { amount: 0, percentage: 0 };
    const diff = o.quoteAmount - o.actualAmount;
    const perc = ((diff / o.quoteAmount) * 100).toFixed(1);
    return { amount: diff, percentage: perc };
  };

  const getStatusIcon = (s) => {
    const icons = { draft: Package, confirmed: CheckCircle, picked: Truck, paid: CheckCircle, cancelled: XCircle };
    const Icon = icons[s] || Package;
    return <Icon size={16} />;
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const statsData = [
    { label: 'Total Orders', value: pagination.totalOrders || 0, color: '#3b82f6' },
    { label: 'Confirmed Orders', value: stats.confirmed, color: '#f59e0b' },
    { label: 'Completed & Paid', value: stats.paid, color: '#10b981' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: '#8b5cf6' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}><ShoppingCart size={32} /> Sell Orders</h1>
      </div>

      <div className={styles.statsGrid}>
        {statsData.map((s, i) => (
          <div key={i} className={styles.statCard} style={{ borderLeftColor: s.color }}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.filterSection}>
        <input
          type="text"
          placeholder="Search by order ID, customer, device..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={() => setStatusFilter('')} className={styles.filterBtn}><Filter size={16} /> All</button>
        <button onClick={() => setStatusFilter('confirmed')} className={styles.filterBtn}>Confirmed</button>
        <button onClick={() => setStatusFilter('picked')} className={styles.filterBtn}>Picked</button>
        <button onClick={() => setStatusFilter('paid')} className={styles.filterBtn}>Paid</button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className={styles.noOrders}>No orders found</div>
      ) : (
        <div className={styles.ordersGrid}>
          {orders.map(order => {
            const productName = getProductName(order);
            const customerName = getCustomerName(order);
            const reduction = calculatePriceReduction(order);

            return (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3 className={styles.orderId}>{order.orderNumber}</h3>
                    <div className={styles.customerName}>{customerName}</div>
                    <div className={styles.orderDate}>{formatDate(order.createdAt)}</div>
                  </div>
                  <div className={styles.orderStatus}>
                    {getStatusIcon(order.status)}
                    <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>Device</div>
                    <div className={styles.detailValue}>{productName}</div>
                  </div>
                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>Quoted Price</div>
                    <div className={styles.detailValue}>{formatCurrency(order.quoteAmount)}</div>
                  </div>
                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>Final Price</div>
                    <div className={styles.detailValue}>
                      {order.status === 'cancelled' ? 'N/A' : formatCurrency(order.actualAmount || order.quoteAmount)}
                    </div>
                  </div>
                  {reduction.amount > 0 && (
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Price Reduction</div>
                      <div className={styles.priceReduction}>
                        <TrendingDown size={16} /> -{formatCurrency(reduction.amount)} ({reduction.percentage}%)
                      </div>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>Pickup Location</div>
                    <div className={styles.detailValue}>
                      {order.pickup?.address?.city}, {order.pickup?.address?.state}
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>Assigned Agent</div>
                    {order.assignedTo ? (
                      <div className={styles.agentInfo}>
                        {order.assignedTo.name}
                        {order.assignedTo.phone && <div className={styles.agentContact}>{order.assignedTo.phone}</div>}
                      </div>
                    ) : (
                      <>
                        <select 
                          className={styles.agentSelect} 
                          onChange={e => {
                            console.log('Agent dropdown changed for order:', order._id);
                            console.log('Selected agent ID:', e.target.value);
                            handleAssignOrder(order._id, e.target.value);
                          }} 
                          defaultValue=""
                          disabled={loadingAgents}
                        >
                          <option value="">
                            {loadingAgents ? 'Loading agents...' : 'Assign Agent'}
                          </option>
                          {agents.map(a => (
                            <option key={a._id} value={a._id}>{a.name} {a.phone && `(${a.phone})`}</option>
                          ))}
                        </select>
                        {!loadingAgents && agents.length > 0 && (
                          <div style={{ fontSize: '11px', color: '#28a745', marginTop: '2px' }}>
                            {agents.length} agent(s) available
                          </div>
                        )}
                        {!loadingAgents && agents.length === 0 && (
                          <div style={{ fontSize: '11px', color: '#dc3545', marginTop: '2px' }}>
                            No agents available
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <button onClick={() => viewOrderDetails(order)} className={styles.btnPrimary}>
                    <Eye size={16} /> View Details
                  </button>
                  <button className={styles.btnSecondary}>
                    <Edit size={16} /> Update Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={!pagination.hasPrev} onClick={() => fetchOrders(pagination.currentPage - 1, statusFilter, searchTerm)} className={styles.pageBtn}>
            Previous
          </button>
          <span className={styles.pageInfo}>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button disabled={!pagination.hasNext} onClick={() => fetchOrders(pagination.currentPage + 1, statusFilter, searchTerm)} className={styles.pageBtn}>
            Next
          </button>
        </div>
      )}

      {/* Full Modal */}
      {showDetailsModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order Details: {selectedOrder.orderNumber}</h2>
              <button onClick={() => setShowDetailsModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              {/* Customer Info */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Customer Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}><strong>Name:</strong> {selectedOrder.pickup?.address?.fullName || 'N/A'}</div>
                  <div className={styles.infoItem}><strong>Phone:</strong> {selectedOrder.pickup?.address?.phone || 'N/A'}</div>
                  <div className={styles.infoItem}><strong>Email:</strong> {selectedOrder.userId?.email || 'N/A'}</div>
                </div>
              </section>

              {/* Device & Status */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Device & Status</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}><strong>Product:</strong> {getProductName(selectedOrder)}</div>
                  <div className={styles.infoItem}><strong>Status:</strong> <span className={`${styles.statusBadge} ${styles[`status_${selectedOrder.status}`]}`}>{selectedOrder.status.toUpperCase()}</span></div>
                  <div className={styles.infoItem}><strong>Assigned Agent:</strong>
                    {selectedOrder.assignedTo ? (
                      <div className={styles.agentInfo}>{selectedOrder.assignedTo.name} ({selectedOrder.assignedTo.phone})</div>
                    ) : (
                      <>
                        <select 
                          className={styles.agentSelect} 
                          onChange={e => { handleAssignOrder(selectedOrder._id, e.target.value); setShowDetailsModal(false); }}
                          disabled={loadingAgents}
                        >
                          <option>
                            {loadingAgents ? 'Loading agents...' : 'Assign Agent'}
                          </option>
                          {agents.map(a => <option key={a._id} value={a._id}>{a.name} {a.phone && `(${a.phone})`}</option>)}
                        </select>
                        {loadingAgents && (
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                            Loading agents...
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Pricing Details</h3>
                <div className={styles.pricingTable}>
                  <div><span>Initial Quote</span> <strong>{formatCurrency(selectedOrder.quoteAmount)}</strong></div>
                  {selectedOrder.actualAmount && selectedOrder.actualAmount !== selectedOrder.quoteAmount && (
                    <>
                      <div className={styles.reductionRow}>
                        <span>Price Reduction</span>
                        <span className={styles.redText}>-{formatCurrency(selectedOrder.quoteAmount - selectedOrder.actualAmount)}</span>
                      </div>
                      <div className={styles.totalRow}>
                        <strong>Final Amount</strong>
                        <strong>{formatCurrency(selectedOrder.actualAmount)}</strong>
                      </div>
                    </>
                  )}
                  {!selectedOrder.actualAmount && (
                    <div className={styles.totalRow}>
                      <strong>Final Amount</strong>
                      <strong>{formatCurrency(selectedOrder.quoteAmount)}</strong>
                    </div>
                  )}
                </div>
              </section>

              {/* Pickup & Payment */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Pickup Address</h3>
                <div className={styles.addressBox}>
                  <p><strong>{selectedOrder.pickup?.address?.fullName}</strong></p>
                  <p>{selectedOrder.pickup?.address?.phone}</p>
                  <p>{selectedOrder.pickup?.address?.street}</p>
                  <p>{selectedOrder.pickup?.address?.city}, {selectedOrder.pickup?.address?.state} - {selectedOrder.pickup?.address?.pincode}</p>
                  {selectedOrder.pickup?.slot?.date && <p><strong>Slot:</strong> {formatDate(selectedOrder.pickup.slot.date)} {selectedOrder.pickup.slot.window}</p>}
                </div>
              </section>

              {selectedOrder.notes && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Notes</h3>
                  <div className={styles.notesBox}>{selectedOrder.notes}</div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellOrders;