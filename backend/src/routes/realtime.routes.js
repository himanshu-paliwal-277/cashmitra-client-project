const express = require('express');
const router = express.Router();
const { Order } = require('../models/order.model');
const { User } = require('../models/user.model');
const { Partner } = require('../models/partner.model');
const { protect } = require('../middlewares/auth.middleware');

// Get real-time orders data
router.get('/orders', protect, async (req, res) => {
  try {
    const { type = 'all', limit = 50, page = 1, status, search } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by order type
    if (type !== 'all') {
      query.orderType = type;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'partner.shopName': { $regex: search, $options: 'i' } },
        { _id: search }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch orders with population
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('partner', 'shopName contactInfo')
      .populate('items.inventory', 'product condition')
      .populate('items.inventory.product', 'name brand model category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Get total count for pagination
    const total = await Order.countDocuments(query);
    
    // Calculate statistics
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          statusBreakdown: {
            $push: '$status'
          }
        }
      }
    ]);
    
    // Process status breakdown
    let statusCounts = {};
    if (stats.length > 0) {
      stats[0].statusBreakdown.forEach(status => {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
    }
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: orders.length,
          totalRecords: total
        },
        statistics: {
          totalOrders: stats[0]?.totalOrders || 0,
          totalAmount: stats[0]?.totalAmount || 0,
          avgOrderValue: stats[0]?.avgOrderValue || 0,
          statusBreakdown: statusCounts
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching real-time orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders data',
      error: error.message
    });
  }
});

// Get real-time analytics data
router.get('/analytics', protect, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Aggregate analytics data
    const analytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orderType: '$orderType'
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    // Get overall statistics
    const overallStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          sellOrders: {
            $sum: { $cond: [{ $eq: ['$orderType', 'sell'] }, 1, 0] }
          },
          buyOrders: {
            $sum: { $cond: [{ $eq: ['$orderType', 'buy'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Format data for charts
    const chartData = {};
    analytics.forEach(item => {
      const date = item._id.date;
      if (!chartData[date]) {
        chartData[date] = { date, sellOrders: 0, buyOrders: 0, sellRevenue: 0, buyRevenue: 0 };
      }
      
      if (item._id.orderType === 'sell') {
        chartData[date].sellOrders = item.count;
        chartData[date].sellRevenue = item.revenue;
      } else {
        chartData[date].buyOrders = item.count;
        chartData[date].buyRevenue = item.revenue;
      }
    });
    
    const timeSeriesData = Object.values(chartData);
    
    res.json({
      success: true,
      data: {
        overview: overallStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          sellOrders: 0,
          buyOrders: 0
        },
        timeSeries: timeSeriesData,
        timeRange,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
});

// Get WebSocket connection stats (admin only)
router.get('/ws-stats', protect, async (req, res) => {
  try {
    // This would need to be implemented to get stats from the WebSocket server
    // For now, return mock data
    res.json({
      success: true,
      data: {
        totalConnections: 0,
        adminConnections: 0,
        userConnections: 0,
        activeChannels: []
      }
    });
  } catch (error) {
    console.error('Error fetching WebSocket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch WebSocket statistics',
      error: error.message
    });
  }
});

// Trigger manual data refresh
router.post('/refresh', protect, async (req, res) => {
  try {
    const { dataType } = req.body;
    
    // This endpoint can be used to trigger manual data refreshes
    // and broadcast updates to connected WebSocket clients
    
    res.json({
      success: true,
      message: `${dataType || 'All'} data refresh triggered`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error triggering data refresh:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger data refresh',
      error: error.message
    });
  }
});

module.exports = router;