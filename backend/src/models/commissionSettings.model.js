import mongoose from 'mongoose';

const commissionSettingsSchema = new mongoose.Schema(
  {
    // Global default rates
    defaultRates: {
      buy: {
        mobile: {
          type: Number,
          default: 5,
          min: 0,
          max: 100,
        },
        tablet: {
          type: Number,
          default: 4,
          min: 0,
          max: 100,
        },
        laptop: {
          type: Number,
          default: 3,
          min: 0,
          max: 100,
        },
        accessories: {
          type: Number,
          default: 2,
          min: 0,
          max: 100,
        },
      },
      sell: {
        mobile: {
          type: Number,
          default: 3,
          min: 0,
          max: 100,
        },
        tablet: {
          type: Number,
          default: 2.5,
          min: 0,
          max: 100,
        },
        laptop: {
          type: Number,
          default: 2,
          min: 0,
          max: 100,
        },
        accessories: {
          type: Number,
          default: 1.5,
          min: 0,
          max: 100,
        },
      },
    },
    // Partner-specific overrides
    partnerOverrides: [
      {
        partner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Partner',
          required: true,
        },
        rates: {
          buy: {
            mobile: {
              type: Number,
              min: 0,
              max: 100,
            },
            tablet: {
              type: Number,
              min: 0,
              max: 100,
            },
            laptop: {
              type: Number,
              min: 0,
              max: 100,
            },
            accessories: {
              type: Number,
              min: 0,
              max: 100,
            },
          },
          sell: {
            mobile: {
              type: Number,
              min: 0,
              max: 100,
            },
            tablet: {
              type: Number,
              min: 0,
              max: 100,
            },
            laptop: {
              type: Number,
              min: 0,
              max: 100,
            },
            accessories: {
              type: Number,
              min: 0,
              max: 100,
            },
          },
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commissionSettingsSchema.index({ 'partnerOverrides.partner': 1 });
commissionSettingsSchema.index({ isActive: 1 });

// Static method to get commission rate for a partner
commissionSettingsSchema.statics.getCommissionRate = async function (
  partnerId,
  category,
  orderType
) {
  try {
    const settings = await this.findOne({ isActive: true });
    if (!settings) {
      // Return default rates if no settings found
      const defaultRates = {
        buy: { mobile: 5, tablet: 4, laptop: 3, accessories: 2 },
        sell: { mobile: 3, tablet: 2.5, laptop: 2, accessories: 1.5 },
      };
      return defaultRates[orderType][category] || 0;
    }

    // Check for partner-specific override only if partnerId is provided
    if (partnerId) {
      const partnerOverride = settings.partnerOverrides.find(
        (override) =>
          override.partner &&
          override.partner.toString() === partnerId.toString() &&
          override.isActive
      );

      if (
        partnerOverride &&
        partnerOverride.rates[orderType][category] !== undefined
      ) {
        return partnerOverride.rates[orderType][category];
      }
    }

    // Return global default rate
    return settings.defaultRates[orderType][category] || 0;
  } catch (error) {
    console.error('Error getting commission rate:', error);
    // Return fallback default rates
    const fallbackRates = {
      buy: { mobile: 5, tablet: 4, laptop: 3, accessories: 2 },
      sell: { mobile: 3, tablet: 2.5, laptop: 2, accessories: 1.5 },
    };
    return fallbackRates[orderType][category] || 0;
  }
};

// Static method to calculate commission amount
commissionSettingsSchema.statics.calculateCommission = async function (
  orderValue,
  category,
  orderType,
  partnerId = null
) {
  const rate = await this.getCommissionRate(partnerId, category, orderType);
  const amount = (orderValue * rate) / 100;
  return {
    rate,
    amount: Math.round(amount), // Round to whole number
    category,
  };
};

export const CommissionSettings = mongoose.model(
  'CommissionSettings',
  commissionSettingsSchema
);
