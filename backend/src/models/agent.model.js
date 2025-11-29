/**
 * @fileoverview Agent Model
 * @description Schema for field agents who perform device pickups and evaluations
 */

const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    agentCode: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    employeeId: {
      type: String,
      trim: true
    },
    assignedPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      default: null
    },
    coverageAreas: [{
      type: String,
      trim: true
    }],
    maxPickupsPerDay: {
      type: Number,
      default: 10
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    lastLocationUpdate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    performanceMetrics: {
      totalPickups: {
        type: Number,
        default: 0
      },
      completedPickups: {
        type: Number,
        default: 0
      },
      cancelledPickups: {
        type: Number,
        default: 0
      },
      rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0
      },
      totalEarnings: {
        type: Number,
        default: 0
      }
    },
    documents: {
      aadharCard: String,
      panCard: String,
      drivingLicense: String,
      photo: String
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  {
    timestamps: true
  }
);

// Index for geospatial queries
agentSchema.index({ currentLocation: '2dsphere' });

// Index for quick lookups
agentSchema.index({ user: 1 });
agentSchema.index({ agentCode: 1 });
agentSchema.index({ assignedPartner: 1 });
agentSchema.index({ isActive: 1 });
agentSchema.index({ coverageAreas: 1 });

// Virtual for completion rate
agentSchema.virtual('completionRate').get(function() {
  if (this.performanceMetrics.totalPickups === 0) return 0;
  return (this.performanceMetrics.completedPickups / this.performanceMetrics.totalPickups * 100).toFixed(2);
});

// Static method to generate unique agent code
agentSchema.statics.generateAgentCode = async function() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Count agents created this month
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const count = await this.countDocuments({
    createdAt: { $gte: startOfMonth }
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `AGT${year}${month}${sequence}`;
};

// Method to update location
agentSchema.methods.updateLocation = function(latitude, longitude) {
  this.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  this.lastLocationUpdate = new Date();
  return this.save();
};

// Method to calculate distance from a point
agentSchema.methods.distanceFrom = function(latitude, longitude) {
  const R = 6371; // Earth's radius in km
  const dLat = (latitude - this.currentLocation.coordinates[1]) * Math.PI / 180;
  const dLon = (longitude - this.currentLocation.coordinates[0]) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.currentLocation.coordinates[1] * Math.PI / 180) * 
            Math.cos(latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Method to update performance metrics
agentSchema.methods.updateMetrics = async function(updateData) {
  if (updateData.completed) {
    this.performanceMetrics.completedPickups += 1;
    this.performanceMetrics.totalPickups += 1;
    if (updateData.earnings) {
      this.performanceMetrics.totalEarnings += updateData.earnings;
    }
  }
  
  if (updateData.cancelled) {
    this.performanceMetrics.cancelledPickups += 1;
    this.performanceMetrics.totalPickups += 1;
  }
  
  if (updateData.rating) {
    const totalRating = this.performanceMetrics.rating * this.performanceMetrics.totalReviews;
    this.performanceMetrics.totalReviews += 1;
    this.performanceMetrics.rating = (totalRating + updateData.rating) / this.performanceMetrics.totalReviews;
  }
  
  return this.save();
};

// Static method to find nearby agents
agentSchema.statics.findNearby = function(latitude, longitude, maxDistance = 10000) {
  return this.find({
    isActive: true,
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

// Static method to find agents by coverage area
agentSchema.statics.findByCoverageArea = function(area) {
  return this.find({
    isActive: true,
    coverageAreas: { $in: [area] }
  });
};

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;
