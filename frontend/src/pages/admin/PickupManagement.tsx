import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Filter,
  Search,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';
import pickupService from '../../services/pickupService';
import productService from '../../services/productService';
import adminService from '../../services/adminService';

const Container = styled.div`
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px 12px 8px 36px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  width: 250px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 10px;
  color: #666;
  size: 16px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f8f9fa;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${(props: any) => props.color || '#333'};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  ${(props: any) => {
    switch (props.status) {
      case 'scheduled':
        return 'background: #fff3cd; color: #856404;';
      case 'confirmed':
        return 'background: #d4edda; color: #155724;';
      case 'in_transit':
        return 'background: #cce5ff; color: #004085;';
      case 'completed':
        return 'background: #d1ecf1; color: #0c5460;';
      case 'cancelled':
        return 'background: #f8d7da; color: #721c24;';
      case 'rescheduled':
        return 'background: #f5f5f5; color: #383d41;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const ActionButton = styled.button`
  padding: 6px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f0f0;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;

  ${(props: any) =>
    props.variant === 'primary'
      ? `
background: #007bff;
color: white;
&:hover { background: #0056b3; }
`
      : `
background: #f8f9fa;
color: #333;
border: 1px solid #ddd;
&:hover { background: #e9ecef; }
`}
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f8f9fa;
  color: #333;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #e9ecef;
  }
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }
`;

// Form component for create/edit pickup
const PickupForm = ({
  pickup,
  agents,
  loadingAgents,
  products,
  loadingProducts,
  orders,
  loadingOrders,
  onSubmit,
  onCancel,
  onOrderTypeChange,
}: any) => {
  const [formData, setFormData] = useState({
    orderType: pickup?.orderType || 'sell', // New field for order type
    orderNumber: pickup?.orderNumber || '',
    selectedOrderId: pickup?.selectedOrderId || '',
    customer: {
      name: pickup?.customer?.name || '',
      phone: pickup?.customer?.phone || '',
    },
    address: {
      street: pickup?.address?.street || '',
      city: pickup?.address?.city || '',
      state: pickup?.address?.state || '',
      pincode: pickup?.address?.pincode || '',
    },
    scheduledDate: pickup?.scheduledDate || '',
    timeSlot: pickup?.timeSlot || 'morning',
    assignedTo: pickup?.assignedTo?._id || '',
    status: pickup?.status || 'scheduled',
    items: pickup?.items?.join(', ') || '',
    instructions: pickup?.instructions || '',
    selectedProduct: pickup?.selectedProduct || '',
    productNumber: pickup?.productNumber || '',
  });

  const handleInputChange = (field: any, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleOrderTypeChange = (orderType: any) => {
    handleInputChange('orderType', orderType);
    // Clear selected order when order type changes
    handleInputChange('selectedOrderId', '');
    handleInputChange('orderNumber', '');
    handleInputChange('customer.name', '');
    handleInputChange('customer.phone', '');
    // Trigger refetch of orders for the new order type
    if (onOrderTypeChange) {
      onOrderTypeChange(orderType);
    }
  };

  const handleProductChange = (productId: any) => {
    const selectedProduct = products.find((p: any) => p._id === productId);
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        selectedProduct: productId,
        productNumber:
          selectedProduct.model ||
          selectedProduct.sku ||
          `${selectedProduct.brand}-${selectedProduct.name}`,
        items: selectedProduct.name, // Auto-populate items with product name
      }));
    }
  };

  const handleOrderChange = (orderId: any) => {
    const selectedOrder = orders.find((order: any) => order._id === orderId);
    if (selectedOrder) {
      if (formData.orderType === 'buy') {
        // For buy orders, use the order data directly since it contains all needed information
        const items =
          selectedOrder.items
            ?.map(
              (item: any) =>
                `${item.product?.name || 'Unknown Product'} (Qty: ${item.quantity || 1})`
            )
            .join(', ') || '';

        setFormData(prev => ({
          ...prev,
          selectedOrderId: orderId,
          orderNumber: selectedOrder._id, // Use order ID as order number for buy orders
          customer: {
            name: selectedOrder.user?.name || '',
            phone: selectedOrder.user?.phone || '',
          },
          address: {
            street: selectedOrder.shippingDetails?.address?.street || '',
            city: selectedOrder.shippingDetails?.address?.city || '',
            state: selectedOrder.shippingDetails?.address?.state || '',
            pincode: selectedOrder.shippingDetails?.address?.pincode || '',
          },
          items: items,
        }));
      } else {
        // For sell orders, use the existing API call
        adminService
          .getOrderPickupDetails(orderId)
          .then(response => {
            const orderDetails = response.data;
            setFormData(prev => ({
              ...prev,
              selectedOrderId: orderId,
              orderNumber: orderDetails.orderNumber,
              customer: {
                name: orderDetails.customer?.name || '',
                phone: orderDetails.customer?.phone || '',
              },
              address: {
                street: orderDetails.address?.street || '',
                city: orderDetails.address?.city || '',
                state: orderDetails.address?.state || '',
                pincode: orderDetails.address?.pincode || '',
              },
            }));
          })
          .catch(error => {
            console.error('Error fetching order details:', error);
            // Fallback to existing order data
            setFormData(prev => ({
              ...prev,
              selectedOrderId: orderId,
              orderNumber: selectedOrder.orderNumber,
              customer: {
                name: selectedOrder.customer?.name || '',
                phone: selectedOrder.customer?.phone || '',
              },
              address: {
                street: selectedOrder.address?.street || '',
                city: selectedOrder.address?.city || '',
                state: selectedOrder.address?.state || '',
                pincode: selectedOrder.address?.pincode || '',
              },
            }));
          });
      }
    }
  };

  const handleSubmit = () => {
    // Debug: Log form data to check address fields
    console.log('Form data before submit:', formData);
    console.log('Address data:', formData.address);

    // Validate required address fields
    const requiredAddressFields = ['street', 'city', 'state', 'pincode'];
    const missingFields = requiredAddressFields.filter(
      field => !formData.address[field] || formData.address[field].trim() === ''
    );

    if (missingFields.length > 0) {
      alert(`Please fill in the following required address fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate required customer fields
    if (!formData.customer.name || formData.customer.name.trim() === '') {
      alert('Customer name is required');
      return;
    }

    if (!formData.customer.phone || formData.customer.phone.trim() === '') {
      alert('Customer phone is required');
      return;
    }

    const submitData = {
      // Fix orderType enum - backend expects 'Order' or 'SellOrder', not 'buy' or 'sell'
      orderType: formData.orderType === 'buy' ? 'Order' : 'SellOrder',
      orderNumber: formData.orderNumber,
      assignedTo: formData.assignedTo,
      scheduledDate: formData.scheduledDate,
      // Fix scheduledTimeSlot enum - backend expects specific time ranges
      scheduledTimeSlot:
        formData.timeSlot === 'morning'
          ? '09:00-12:00'
          : formData.timeSlot === 'afternoon'
            ? '12:00-15:00'
            : formData.timeSlot === 'evening'
              ? '15:00-18:00'
              : formData.timeSlot === 'night'
                ? '18:00-21:00'
                : '09:00-12:00', // default to morning if not recognized
      status: formData.status,
      specialInstructions: formData.instructions,
      // Fix priority enum - backend expects 'low', 'medium', 'high', 'urgent', not 'normal'
      priority: 'medium', // changed from 'normal' to 'medium'

      // Fix items format - backend expects array of objects, not strings
      items: formData.items
        ? formData.items
            .split(',')
            .map((item: any) => {
              const trimmedItem = item.trim();
              // Extract quantity if present in format "Item Name (Qty: 2)"
              const qtyMatch = trimmedItem.match(/^(.+?)\s*\(Qty:\s*(\d+)\)$/);
              if (qtyMatch) {
                return {
                  name: qtyMatch[1].trim(),
                  quantity: parseInt(qtyMatch[2]),
                  description: '',
                  estimatedValue: 0,
                };
              }
              return {
                name: trimmedItem,
                quantity: 1,
                description: '',
                estimatedValue: 0,
              };
            })
            .filter((item: any) => item.name)
        : [],

      // Nested customer structure for backend processing
      customer: {
        name: formData.customer.name.trim(),
        phone: formData.customer.phone.trim(),
        email: formData.customer.email || '',
      },

      // Nested address structure with zipCode (not pincode) - ensure all fields are populated
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        zipCode: formData.address.pincode.trim(), // backend expects zipCode, not pincode
        landmark: formData.address.landmark || '',
      },

      // Include product information if selected
      ...(formData.selectedProduct && {
        productId: formData.selectedProduct,
        productNumber: formData.productNumber,
      }),
      // Include order information if selected
      ...(formData.selectedOrderId && {
        orderId: formData.selectedOrderId,
      }),
    };

    // Debug: Log submit data to verify structure
    console.log('Submit data:', submitData);
    onSubmit(submitData);
  };

  return (
    <div>
      <FormGroup>
        <Label>Order Type</Label>
        <Select
          value={formData.orderType}
          onChange={(e: any) => handleOrderTypeChange(e.target.value)}
        >
          <option value="sell">Sell Order</option>
          <option value="buy">Buy Order</option>
        </Select>
      </FormGroup>

      {/* Only show Product Selection for sell orders */}
      {formData.orderType === 'sell' && (
        <>
          <FormGroup>
            <Label>Product Selection</Label>
            <Select
              value={formData.selectedProduct}
              onChange={(e: any) => handleProductChange(e.target.value)}
              disabled={loadingProducts}
            >
              <option value="">Select Product</option>
              {products.map((product: any) => (
                <option key={product._id} value={product._id}>
                  {product.name} - {product.brand} ({product.model || 'No Model'})
                </option>
              ))}
            </Select>
            {loadingProducts && (
              <div style={{ fontSize: '12px', color: '#666' }}>Loading products...</div>
            )}
          </FormGroup>
          <FormGroup>
            <Label>Product Number</Label>
            <Input
              type="text"
              value={formData.productNumber}
              onChange={(e: any) => handleInputChange('productNumber', e.target.value)}
              placeholder="Product number (auto-filled when product selected)"
              readOnly={!!formData.selectedProduct}
            />
          </FormGroup>
        </>
      )}
      <FormGroup>
        <Label>Select Order ({formData.orderType === 'sell' ? 'Sell Orders' : 'Buy Orders'})</Label>
        <Select
          value={formData.selectedOrderId}
          onChange={(e: any) => handleOrderChange(e.target.value)}
          disabled={loadingOrders}
        >
          <option value="">Select Order</option>
          {orders.map((order: any) => (
            <option key={order._id} value={order._id}>
              {order.user?.name || 'Unknown Customer'} -{' '}
              {order.items?.[0]?.product?.name || 'Unknown Product'}
            </option>
          ))}
        </Select>
        {loadingOrders && <div style={{ fontSize: '12px', color: '#666' }}>Loading orders...</div>}
      </FormGroup>
      <FormGroup>
        <Label>Order Number</Label>
        <Input
          type="text"
          value={formData.orderNumber}
          onChange={(e: any) => handleInputChange('orderNumber', e.target.value)}
          placeholder="Order number (auto-filled when order selected)"
          readOnly={!!formData.selectedOrderId || formData.orderType === 'buy'}
        />
      </FormGroup>
      <FormGroup>
        <Label>Customer Name</Label>
        <Input
          type="text"
          value={formData.customer.name}
          onChange={(e: any) => handleInputChange('customer.name', e.target.value)}
          placeholder="Customer name (auto-filled when order selected)"
          readOnly={!!formData.selectedOrderId || formData.orderType === 'buy'}
        />
      </FormGroup>
      <FormGroup>
        <Label>Customer Phone</Label>
        <Input
          type="tel"
          value={formData.customer.phone}
          onChange={(e: any) => handleInputChange('customer.phone', e.target.value)}
          placeholder="Phone number (auto-filled when order selected)"
          readOnly={!!formData.selectedOrderId || formData.orderType === 'buy'}
        />
      </FormGroup>
      <FormGroup>
        <Label>Street Address</Label>
        <Input
          type="text"
          value={formData.address.street}
          onChange={(e: any) => handleInputChange('address.street', e.target.value)}
          placeholder="Street address (auto-filled when order selected)"
          readOnly={!!formData.selectedOrderId || formData.orderType === 'buy'}
        />
      </FormGroup>
      <FormGroup>
        <Label>City</Label>
        <Input
          type="text"
          value={formData.address.city}
          onChange={(e: any) => handleInputChange('address.city', e.target.value)}
          placeholder="City (auto-filled when order selected)"
          readOnly={!!formData.selectedOrderId || formData.orderType === 'buy'}
        />
      </FormGroup>
      <FormGroup>
        <Label>State</Label>
        <Input
          type="text"
          value={formData.address.state}
          onChange={(e: any) => handleInputChange('address.state', e.target.value)}
          placeholder="State (auto-filled when order selected)"
          readOnly={!!formData.selectedOrderId || formData.orderType === 'buy'}
        />
      </FormGroup>
      <FormGroup>
        <Label>Pincode</Label>
        <Input
          type="text"
          value={formData.address.pincode}
          onChange={(e: any) => handleInputChange('address.pincode', e.target.value)}
          placeholder="Pincode (auto-filled when order selected)"
          readOnly={!!formData.selectedOrderId || formData.orderType === 'buy'}
        />
      </FormGroup>
      <FormGroup>
        <Label>Scheduled Date</Label>
        <Input
          type="date"
          value={formData.scheduledDate}
          onChange={(e: any) => handleInputChange('scheduledDate', e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label>Time Slot</Label>
        <Select
          value={formData.timeSlot}
          onChange={(e: any) => handleInputChange('timeSlot', e.target.value)}
        >
          <option value="morning">Morning (10:00 AM - 3:00 PM)</option>
          <option value="afternoon">Afternoon (3:00 PM - 6:00 PM)</option>
        </Select>
      </FormGroup>
      <FormGroup>
        <Label>Assign Agent</Label>
        <Select
          value={formData.assignedTo}
          onChange={(e: any) => handleInputChange('assignedTo', e.target.value)}
          disabled={loadingAgents}
        >
          <option value="">{loadingAgents ? 'Loading agents...' : 'Select Agent'}</option>
          {agents.map((agent: any) => (
            <option key={agent._id} value={agent._id}>
              {agent.name} - {agent.type} {agent.email && `(${agent.email})`}
            </option>
          ))}
        </Select>
        {loadingAgents && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Loading agents...</div>
        )}
        {!loadingAgents && agents.length === 0 && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            No agents available. Please add agents first.
          </div>
        )}
        {!loadingAgents && agents.length > 0 && (
          <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px' }}>
            {agents.length} agent(s) available
          </div>
        )}
      </FormGroup>
      <FormGroup>
        <Label>Status</Label>
        <Select
          value={formData.status}
          onChange={(e: any) => handleInputChange('status', e.target.value)}
        >
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_transit">In Transit</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </Select>
      </FormGroup>
      <FormGroup>
        <Label>Items (comma separated)</Label>
        <Input
          type="text"
          value={formData.items}
          onChange={(e: any) => handleInputChange('items', e.target.value)}
          placeholder="Enter items to pickup"
        />
      </FormGroup>
      <FormGroup>
        <Label>Special Instructions</Label>
        <TextArea
          value={formData.instructions}
          onChange={(e: any) => handleInputChange('instructions', e.target.value)}
          placeholder="Any special instructions for the pickup..."
        />
      </FormGroup>
      <ModalActions>
        <CancelButton onClick={onCancel}>Cancel</CancelButton>
        <SubmitButton onClick={handleSubmit}>
          {pickup ? 'Update Pickup' : 'Create Pickup'}
        </SubmitButton>
      </ModalActions>
    </div>
  );
};

const PickupManagement = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch pickups from API
  useEffect(() => {
    fetchPickups();
  }, [currentPage, searchTerm, statusFilter]);

  // Fetch agents/drivers for assignment
  useEffect(() => {
    fetchAgents();
    fetchProducts();
    fetchOrders('sell'); // Default to sell orders
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getProducts({ limit: 100 });
      const productsData = response.data || response.products || response || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if API fails
      setProducts([
        { _id: '1', name: 'iPhone 13', brand: 'Apple', model: 'A2482' },
        { _id: '2', name: 'Samsung Galaxy S21', brand: 'Samsung', model: 'SM-G991B' },
        { _id: '3', name: 'MacBook Pro', brand: 'Apple', model: 'MBP16' },
      ]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async (orderType = 'sell') => {
    try {
      setLoadingOrders(true);
      let response;

      if (orderType === 'buy') {
        response = await adminService.getBuyOrdersForPickup();
      } else {
        response = await adminService.getOrdersForPickup();
      }

      if (response) {
        setOrders(response.orders);
      } else if (response && Array.isArray(response)) {
        setOrders(response);
      } else {
        // Fallback to existing getAllOrders if new endpoint not available
        const fallbackResponse = await adminService.getAllOrders();
        setOrders(fallbackResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data based on order type
      const mockData =
        orderType === 'buy'
          ? [
              {
                _id: '1',
                orderNumber: 'BUY-001',
                customer: { name: 'John Doe' },
                address: {
                  street: '123 Main St',
                  city: 'Mumbai',
                  state: 'Maharashtra',
                  pincode: '400001',
                },
              },
              {
                _id: '2',
                orderNumber: 'BUY-002',
                customer: { name: 'Jane Smith' },
                address: {
                  street: '456 Oak Ave',
                  city: 'Delhi',
                  state: 'Delhi',
                  pincode: '110001',
                },
              },
            ]
          : [
              {
                _id: '1',
                orderNumber: 'ORD-001',
                customer: { name: 'John Doe' },
                address: {
                  street: '123 Main St',
                  city: 'Mumbai',
                  state: 'Maharashtra',
                  pincode: '400001',
                },
              },
              {
                _id: '2',
                orderNumber: 'ORD-002',
                customer: { name: 'Jane Smith' },
                address: {
                  street: '456 Oak Ave',
                  city: 'Delhi',
                  state: 'Delhi',
                  pincode: '110001',
                },
              },
            ];
      setOrders(mockData);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchPickups = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const response = await pickupService.getAllPickups(params);

      // Handle response structure
      const pickupData = response.data || response;
      const pickupsArray = pickupData.docs || pickupData.pickups || pickupData || [];

      setPickups(pickupsArray);
      setTotalPages(pickupData.totalPages || pickupData.pages || 1);
    } catch (error) {
      console.error('Error fetching pickups:', error);
      setError('Failed to fetch pickups. Please try again.');

      // Fallback to mock data if API fails
      setPickups([
        {
          _id: '1',
          orderNumber: 'ORD001',
          customer: {
            name: 'John Doe',
            phone: '+91 9876543210',
          },
          address: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
          },
          scheduledDate: '2024-01-25',
          timeSlot: 'morning',
          status: 'scheduled',
          assignedTo: null,
          items: ['iPhone 14 Pro'],
          priority: 'normal',
          createdAt: '2024-01-20T10:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      console.log('Fetching agents...');

      // Try to fetch users with admin service first
      const usersResponse = await adminService.getAllUsers({ limit: 100 });
      console.log('Users response:', usersResponse);

      const allUsers = usersResponse.users || usersResponse.data || [];
      console.log('All users:', allUsers);

      // Filter for agents and drivers
      const agents = allUsers.filter(
        (user: any) =>
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
          pickupService.getDrivers({ limit: 100 }).catch(err => {
            console.log('Error fetching drivers:', err);
            return { users: [] };
          }),
          pickupService.getPickupAgents({ limit: 100 }).catch(err => {
            console.log('Error fetching pickup agents:', err);
            return { users: [] };
          }),
        ]);

        const drivers = driversResponse.users || driversResponse.data || [];
        const pickupAgents = agentsResponse.users || agentsResponse.data || [];

        console.log('Drivers:', drivers);
        console.log('Pickup agents:', pickupAgents);

        // Combine and format agents
        const combinedAgents = [
          ...drivers.map((driver: any) => ({
            ...driver,
            type: 'driver',
          })),
          ...pickupAgents.map((agent: any) => ({
            ...agent,
            type: 'pickup_agent',
          })),
        ];

        console.log('Combined agents:', combinedAgents);
        setAgents(combinedAgents);
      } else {
        const formattedAgents = agents.map((agent: any) => ({
          ...agent,
          type: agent.role || agent.type || 'agent',
        }));
        console.log('Setting agents:', formattedAgents);
        setAgents(formattedAgents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      console.error('Error details:', error.response?.data || error.message);

      // Fallback to mock agents
      const mockAgents = [
        { _id: '1', name: 'Agent A', email: 'agent.a@example.com', type: 'driver' },
        { _id: '2', name: 'Agent B', email: 'agent.b@example.com', type: 'pickup_agent' },
        { _id: '3', name: 'Driver C', email: 'driver.c@example.com', type: 'driver' },
      ];
      console.log('Using mock agents:', mockAgents);
      setAgents(mockAgents);
    } finally {
      setLoadingAgents(false);
      console.log('Finished fetching agents');
    }
  };

  const stats = {
    total: pickups.length,
    scheduled: pickups.filter(p => p.status === 'scheduled').length,
    confirmed: pickups.filter(p => p.status === 'confirmed').length,
    in_transit: pickups.filter(p => p.status === 'in_transit').length,
    completed: pickups.filter(p => p.status === 'completed').length,
  };

  const filteredPickups = pickups.filter(pickup => {
    const matchesSearch =
      pickup.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.customer?.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || pickup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePickup = async (pickupData: any) => {
    try {
      setLoading(true);
      await pickupService.createPickup(pickupData);
      setShowModal(false);
      fetchPickups(); // Refresh the list
    } catch (error) {
      console.error('Error creating pickup:', error);
      setError('Failed to create pickup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPickup = async (pickupData: any) => {
    try {
      setLoading(true);
      await pickupService.updatePickup(selectedPickup._id, pickupData);
      setShowModal(false);
      setSelectedPickup(null);
      fetchPickups(); // Refresh the list
    } catch (error) {
      console.error('Error updating pickup:', error);
      setError('Failed to update pickup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPickup = async (pickupId: any, agentId: any) => {
    try {
      setLoading(true);
      await pickupService.assignPickup(pickupId, agentId);
      fetchPickups(); // Refresh the list
    } catch (error) {
      console.error('Error assigning pickup:', error);
      setError('Failed to assign pickup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (pickupId: any, newStatus: any) => {
    try {
      setLoading(true);
      await pickupService.updatePickupStatus(pickupId, newStatus);
      fetchPickups(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPickup = (pickup: any) => {
    setModalType('view');
    setSelectedPickup(pickup);
    setShowModal(true);
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatTimeSlot = (slot: any) => {
    return slot === 'morning' ? '10:00 AM - 3:00 PM' : '3:00 PM - 6:00 PM';
  };

  if (loading) {
    return <Container>Loading pickup data...</Container>;
  }

  if (error) {
    return (
      <Container>
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          {error}
          <button onClick={fetchPickups} style={{ marginLeft: '10px' }}>
            Retry
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Pickup Management</Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search by customer, order number, or phone..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterButton onClick={() => {}}>
            <Filter size={16} />
            Filter
          </FilterButton>
          <CreateButton
            onClick={() => {
              setModalType('create');
              setSelectedPickup(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            Create Pickup
          </CreateButton>
        </Controls>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue color="#333">{stats.total}</StatValue>
          <StatLabel>Total Pickups</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#856404">{stats.scheduled}</StatValue>
          <StatLabel>Scheduled</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#155724">{stats.confirmed}</StatValue>
          <StatLabel>Confirmed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#004085">{stats.in_transit}</StatValue>
          <StatLabel>In Transit</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#0c5460">{stats.completed}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>
      </StatsGrid>

      <TableContainer>
        <TableHeader>
          <div>Order Details</div>
          <div>Customer</div>
          <div>Address</div>
          <div>Scheduled</div>
          <div>Agent</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>

        {filteredPickups.map(pickup => (
          <TableRow key={pickup._id}>
            <div>
              <div style={{ fontWeight: '500' }}>{pickup.orderNumber}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {pickup.items?.join(', ') || 'No items listed'}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '500' }}>{pickup.customer?.name || 'N/A'}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {pickup.customer?.phone || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px' }}>
                {pickup.address?.street || ''} {pickup.address?.city || ''}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {pickup.address?.state || ''} {pickup.address?.pincode || ''}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '500' }}>{formatDate(pickup.scheduledDate)}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {formatTimeSlot(pickup.timeSlot)}
              </div>
            </div>
            <div>
              {pickup.assignedTo ? (
                <div>
                  <div style={{ fontWeight: '500' }}>
                    {pickup.assignedTo.name || pickup.assignedTo}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {pickup.assignedTo.phone || ''}
                  </div>
                </div>
              ) : (
                <select
                  onChange={e => {
                    if (e.target.value) {
                      handleAssignPickup(pickup._id, e.target.value);
                    }
                  }}
                  defaultValue=""
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  <option value="">Assign Agent</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.type})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <StatusBadge status={pickup.status}>
                {pickup.status.replace('_', ' ').toUpperCase()}
              </StatusBadge>
            </div>
            <Actions>
              <ActionButton onClick={() => handleViewPickup(pickup)}>
                <Eye size={16} />
              </ActionButton>
              <ActionButton
                onClick={() => {
                  setModalType('edit');
                  setSelectedPickup(pickup);
                  setShowModal(true);
                }}
              >
                <Edit size={16} />
              </ActionButton>
              {pickup.status === 'pending' && (
                <ActionButton
                  onClick={() => handleStatusUpdate(pickup._id, 'assigned')}
                  style={{ color: '#28a745' }}
                >
                  <CheckCircle size={16} />
                </ActionButton>
              )}
            </Actions>
          </TableRow>
        ))}
      </TableContainer>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e: any) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'create'
                  ? 'Create New Pickup'
                  : modalType === 'edit'
                    ? 'Edit Pickup'
                    : 'Pickup Details'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            {modalType === 'view' && selectedPickup && (
              <div>
                <FormGroup>
                  <Label>Order Number</Label>
                  <div>{selectedPickup.orderNumber}</div>
                </FormGroup>
                <FormGroup>
                  <Label>Customer</Label>
                  <div>
                    {selectedPickup.customer?.name || 'N/A'} -{' '}
                    {selectedPickup.customer?.phone || 'N/A'}
                  </div>
                </FormGroup>
                <FormGroup>
                  <Label>Address</Label>
                  <div>
                    {selectedPickup.address?.street || ''} {selectedPickup.address?.city || ''}
                    <br />
                    {selectedPickup.address?.state || ''} {selectedPickup.address?.pincode || ''}
                  </div>
                </FormGroup>
                <FormGroup>
                  <Label>Scheduled Date & Time</Label>
                  <div>
                    {formatDate(selectedPickup.scheduledDate)} -{' '}
                    {formatTimeSlot(selectedPickup.timeSlot)}
                  </div>
                </FormGroup>
                <FormGroup>
                  <Label>Items</Label>
                  <div>{selectedPickup.items?.join(', ') || 'No items listed'}</div>
                </FormGroup>
                <FormGroup>
                  <Label>Assigned Agent</Label>
                  <div>{selectedPickup.assignedTo?.name || 'Not assigned'}</div>
                </FormGroup>
                <FormGroup>
                  <Label>Status</Label>
                  <StatusBadge status={selectedPickup.status}>
                    {selectedPickup.status.replace('_', ' ').toUpperCase()}
                  </StatusBadge>
                </FormGroup>
              </div>
            )}

            {(modalType === 'create' || modalType === 'edit') && (
              <PickupForm
                pickup={selectedPickup}
                agents={agents}
                loadingAgents={loadingAgents}
                products={products}
                loadingProducts={loadingProducts}
                orders={orders}
                loadingOrders={loadingOrders}
                onSubmit={modalType === 'create' ? handleCreatePickup : handleEditPickup}
                onCancel={() => setShowModal(false)}
                onOrderTypeChange={(orderType: any) => fetchOrders(orderType)}
              />
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PickupManagement;
