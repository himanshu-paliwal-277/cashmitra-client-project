const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Order } = require('../models/order.model');
const { User } = require('../models/user.model');
const { Partner } = require('../models/partner.model');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this),
    });

    this.clients = new Map(); // Store authenticated clients
    this.adminClients = new Set(); // Store admin clients
    this.userClients = new Map(); // Store user clients by userId

    this.setupWebSocketServer();
    this.setupOrderChangeStream();
  }

  verifyClient(info) {
    // Extract token from query parameters or headers
    const url = new URL(info.req.url, 'http://localhost');
    const token =
      url.searchParams.get('token') ||
      info.req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      info.req.user = decoded;
      return true;
    } catch (error) {
      console.error('WebSocket authentication failed:', error.message);
      return false;
    }
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      const user = req.user;
      console.log(`WebSocket client connected: ${user.id} (${user.role})`);

      // Store client with user info
      this.clients.set(ws, {
        userId: user.id,
        role: user.role,
        lastPing: Date.now(),
      });

      // Add to role-specific collections
      if (user.role === 'admin') {
        this.adminClients.add(ws);
      } else {
        if (!this.userClients.has(user.id)) {
          this.userClients.set(user.id, new Set());
        }
        this.userClients.get(user.id).add(ws);
      }

      // Send initial connection confirmation
      this.sendToClient(ws, {
        type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString(),
      });

      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error.message);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.handleClientDisconnect(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
        this.handleClientDisconnect(ws);
      });

      // Setup ping/pong for connection health
      ws.on('pong', () => {
        const clientInfo = this.clients.get(ws);
        if (clientInfo) {
          clientInfo.lastPing = Date.now();
        }
      });
    });

    // Setup periodic ping to check connection health
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const clientInfo = this.clients.get(ws);
        if (clientInfo && Date.now() - clientInfo.lastPing > 30000) {
          // Client hasn't responded to ping in 30 seconds
          ws.terminate();
          this.handleClientDisconnect(ws);
        } else if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, 10000); // Ping every 10 seconds
  }

  handleClientMessage(ws, data) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo) return;

    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(ws, data);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(ws, data);
        break;
      case 'ping':
        this.sendToClient(ws, {
          type: 'pong',
          timestamp: new Date().toISOString(),
        });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  handleSubscription(ws, data) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo) return;

    if (!clientInfo.subscriptions) {
      clientInfo.subscriptions = new Set();
    }

    clientInfo.subscriptions.add(data.channel);

    this.sendToClient(ws, {
      type: 'subscription_confirmed',
      channel: data.channel,
      timestamp: new Date().toISOString(),
    });
  }

  handleUnsubscription(ws, data) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo || !clientInfo.subscriptions) return;

    clientInfo.subscriptions.delete(data.channel);

    this.sendToClient(ws, {
      type: 'unsubscription_confirmed',
      channel: data.channel,
      timestamp: new Date().toISOString(),
    });
  }

  handleClientDisconnect(ws) {
    const clientInfo = this.clients.get(ws);
    if (clientInfo) {
      console.log(
        `WebSocket client disconnected: ${clientInfo.userId} (${clientInfo.role})`
      );

      // Remove from role-specific collections
      if (clientInfo.role === 'admin') {
        this.adminClients.delete(ws);
      } else {
        const userSockets = this.userClients.get(clientInfo.userId);
        if (userSockets) {
          userSockets.delete(ws);
          if (userSockets.size === 0) {
            this.userClients.delete(clientInfo.userId);
          }
        }
      }
    }

    this.clients.delete(ws);
  }

  setupOrderChangeStream() {
    // MongoDB Change Streams for real-time order updates
    const orderChangeStream = Order.watch([
      { $match: { operationType: { $in: ['insert', 'update', 'replace'] } } },
    ]);

    orderChangeStream.on('change', (change) => {
      this.handleOrderChange(change);
    });

    orderChangeStream.on('error', (error) => {
      console.error('Order change stream error:', error);
    });
  }

  async handleOrderChange(change) {
    try {
      const { operationType, fullDocument, documentKey } = change;

      let order;
      if (fullDocument) {
        order = fullDocument;
      } else {
        // For update operations, fetch the full document
        order = await Order.findById(documentKey._id)
          .populate('user', 'name email')
          .populate('partner', 'shopName')
          .populate('items.inventory', 'product')
          .populate('items.inventory.product', 'name brand model');
      }

      if (!order) return;

      const eventData = {
        type: 'order_update',
        operation: operationType,
        order: {
          _id: order._id,
          orderType: order.orderType,
          status: order.status,
          totalAmount: order.totalAmount,
          user: order.user,
          partner: order.partner,
          items: order.items,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
        timestamp: new Date().toISOString(),
      };

      // Send to all admin clients
      this.broadcastToAdmins(eventData);

      // Send to specific user if it's their order
      if (order.user && order.user._id) {
        this.sendToUser(order.user._id.toString(), eventData);
      }

      // Send to partner if applicable
      if (order.partner && order.partner._id) {
        this.sendToUser(order.partner._id.toString(), eventData);
      }
    } catch (error) {
      console.error('Error handling order change:', error);
    }
  }

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcastToAdmins(data) {
    this.adminClients.forEach((ws) => {
      const clientInfo = this.clients.get(ws);
      if (
        clientInfo &&
        (!clientInfo.subscriptions || clientInfo.subscriptions.has('orders'))
      ) {
        this.sendToClient(ws, data);
      }
    });
  }

  sendToUser(userId, data) {
    const userSockets = this.userClients.get(userId);
    if (userSockets) {
      userSockets.forEach((ws) => {
        const clientInfo = this.clients.get(ws);
        if (
          clientInfo &&
          (!clientInfo.subscriptions || clientInfo.subscriptions.has('orders'))
        ) {
          this.sendToClient(ws, data);
        }
      });
    }
  }

  // Method to send analytics updates
  broadcastAnalyticsUpdate(analyticsData) {
    const eventData = {
      type: 'analytics_update',
      data: analyticsData,
      timestamp: new Date().toISOString(),
    };

    this.adminClients.forEach((ws) => {
      const clientInfo = this.clients.get(ws);
      if (
        clientInfo &&
        (!clientInfo.subscriptions || clientInfo.subscriptions.has('analytics'))
      ) {
        this.sendToClient(ws, eventData);
      }
    });
  }

  // Method to send inventory updates
  broadcastInventoryUpdate(inventoryData) {
    const eventData = {
      type: 'inventory_update',
      data: inventoryData,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToAdmins(eventData);
  }

  // Method to send notifications
  sendNotification(userId, notification) {
    const eventData = {
      type: 'notification',
      notification,
      timestamp: new Date().toISOString(),
    };

    if (userId === 'admin') {
      this.broadcastToAdmins(eventData);
    } else {
      this.sendToUser(userId, eventData);
    }
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.clients.size,
      adminConnections: this.adminClients.size,
      userConnections: this.userClients.size,
      activeChannels: Array.from(this.clients.values())
        .flatMap((client) =>
          client.subscriptions ? Array.from(client.subscriptions) : []
        )
        .filter((channel, index, arr) => arr.indexOf(channel) === index),
    };
  }
}

module.exports = WebSocketServer;
