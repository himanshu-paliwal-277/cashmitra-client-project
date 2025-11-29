import React from 'react';
import { useNavigate } from 'react-router-dom';

// Example component showing how to navigate to OrderConfirmation with API data
const OrderConfirmationExample = () => {
  const navigate = useNavigate();

  // This is the API response data you provided
  const orderApiResponse = {
    "success": true,
    "message": "Order created successfully",
    "data": {
      "order": {
        "orderType": "buy",
        "user": {
          "_id": "68c3fbc3288c34d379878c23",
          "name": "Admin User",
          "email": "cashmitra25@gmail.com",
          "phone": "9999999999"
        },
        "partner": "68c3fbc3288c34d379878c23",
        "items": [
          {
            "product": {
              "_id": "68e17deda27a32e85cf45232",
              "name": "Damon Prince",
              "brand": "Omnis qui et sint ve",
              "images": [
                "https://res.cloudinary.com/cracker/image/upload/v1759608094/products/qtgiqyxjxdpgv2fwzg0i.png"
              ]
            },
            "quantity": 1,
            "_id": "68e2357e53a0c41c3a0ea330"
          }
        ],
        "totalAmount": 7444,
        "commission": {
          "rate": 0.1,
          "amount": 744.4000000000001
        },
        "paymentDetails": {
          "method": "UPI",
          "status": "pending"
        },
        "shippingDetails": {
          "address": {
            "street": "Possimus repudianda",
            "city": "Ipsum eum aut nisi e",
            "state": "Culpa voluptatem a",
            "pincode": "123123",
            "country": "India"
          }
        },
        "status": "pending",
        "_id": "68e2357e53a0c41c3a0ea32f",
        "statusHistory": [],
        "createdAt": "2025-10-05T09:08:14.293Z",
        "updatedAt": "2025-10-05T09:08:14.293Z",
        "__v": 0
      },
      "paymentRequired": 7444
    }
  };

  // Function to handle successful order creation and navigate to confirmation
  const handleOrderSuccess = () => {
    // Navigate to order confirmation page with the order data
    navigate('/buy/order-confirmation', {
      state: {
        order: orderApiResponse.data.order,
        paymentRequired: orderApiResponse.data.paymentRequired,
        success: orderApiResponse.success,
        message: orderApiResponse.message
      }
    });
  };

  // Alternative method: You can also pass data as props if using direct component rendering
  const handleDirectRender = () => {
    // If you're rendering the component directly instead of navigating:
    // <OrderConfirmation orderData={orderApiResponse.data.order} />
    console.log('Direct render method - pass orderData as props');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Order Confirmation Navigation Example</h2>
      <p>This example shows how to pass order data to the OrderConfirmation component.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <h3>Method 1: Using React Router Navigation (Recommended)</h3>
        <p>Pass data through location.state when navigating:</p>
        <button 
          onClick={handleOrderSuccess}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Navigate to Order Confirmation
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Method 2: Direct Component Props</h3>
        <p>Pass orderData directly as props to the component:</p>
        <code style={{ 
          display: 'block', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          {`<OrderConfirmation orderData={orderApiResponse.data.order} />`}
        </code>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h4>📋 Implementation Notes:</h4>
        <ul style={{ marginLeft: '1rem' }}>
          <li>The OrderConfirmation component now accepts data via <code>location.state</code> or <code>props</code></li>
          <li>It automatically formats currency, addresses, and dates</li>
          <li>Displays real product information, payment details, and order status</li>
          <li>Includes proper fallbacks for missing data</li>
          <li>Features a modern, professional UI with animations</li>
        </ul>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>⚡ Quick Integration:</h4>
        <p>In your checkout success handler:</p>
        <code style={{ 
          display: 'block', 
          padding: '0.5rem', 
          backgroundColor: '#ffffff', 
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          {`// After successful API call
if (response.success) {
  navigate('/buy/order-confirmation', {
    state: { order: response.data.order }
  });
}`}
        </code>
      </div>
    </div>
  );
};

export default OrderConfirmationExample;