import { CommissionSettings } from '../models/commissionSettings.model.js';
import { Partner } from '../models/partner.model.js';

// Get current commission settings
export const getCommissionSettings = async (req, res) => {
  try {
    let settings = await CommissionSettings.findOne({ isActive: true })
      .populate({
        path: 'partnerOverrides.partner',
        select: 'shopName shopEmail user',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate('updatedBy', 'name email');

    if (!settings) {
      // Create default settings if none exist
      settings = await CommissionSettings.create({
        defaultRates: {
          buy: {
            mobile: 5,
            tablet: 4,
            laptop: 3,
            accessories: 2,
          },
          sell: {
            mobile: 3,
            tablet: 2.5,
            laptop: 2,
            accessories: 1.5,
          },
        },
        partnerOverrides: [],
        updatedBy: req.user._id,
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get commission settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update global commission rates
export const updateGlobalCommissionRates = async (req, res) => {
  try {
    const { defaultRates } = req.body;

    // Validate rates
    const validateRates = (rates) => {
      const categories = ['mobile', 'tablet', 'laptop', 'accessories'];
      const orderTypes = ['buy', 'sell'];

      for (const orderType of orderTypes) {
        if (!rates[orderType]) {
          throw new Error(`Missing rates for ${orderType} orders`);
        }
        for (const category of categories) {
          const rate = rates[orderType][category];
          if (typeof rate !== 'number' || rate < 0 || rate > 100) {
            throw new Error(
              `Invalid rate for ${orderType} ${category}: must be between 0 and 100`
            );
          }
        }
      }
    };

    validateRates(defaultRates);

    let settings = await CommissionSettings.findOne({ isActive: true });

    if (!settings) {
      settings = await CommissionSettings.create({
        defaultRates,
        partnerOverrides: [],
        updatedBy: req.user._id,
      });
    } else {
      settings.defaultRates = defaultRates;
      settings.updatedBy = req.user._id;
      await settings.save();
    }

    await settings.populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Global commission rates updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update global commission rates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: error.message,
    });
  }
};

// Set partner-specific commission rates
export const setPartnerCommissionRates = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { rates } = req.body;

    // Validate partner exists
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    // Validate rates format
    const validateRates = (rates) => {
      const categories = ['mobile', 'tablet', 'laptop', 'accessories'];
      const orderTypes = ['buy', 'sell'];

      for (const orderType of orderTypes) {
        if (!rates[orderType]) {
          throw new Error(`Missing rates for ${orderType} orders`);
        }
        for (const category of categories) {
          const rate = rates[orderType][category];
          if (
            rate !== undefined &&
            (typeof rate !== 'number' || rate < 0 || rate > 100)
          ) {
            throw new Error(
              `Invalid rate for ${orderType} ${category}: must be between 0 and 100`
            );
          }
        }
      }
    };

    validateRates(rates);

    let settings = await CommissionSettings.findOne({ isActive: true });

    if (!settings) {
      // Create default settings if none exist
      settings = await CommissionSettings.create({
        defaultRates: {
          buy: { mobile: 5, tablet: 4, laptop: 3, accessories: 2 },
          sell: { mobile: 3, tablet: 2.5, laptop: 2, accessories: 1.5 },
        },
        partnerOverrides: [],
        updatedBy: req.user._id,
      });
    }

    // Check if partner override already exists
    const existingOverrideIndex = settings.partnerOverrides.findIndex(
      (override) => override.partner.toString() === partnerId
    );

    if (existingOverrideIndex !== -1) {
      // Update existing override
      settings.partnerOverrides[existingOverrideIndex].rates = rates;
      settings.partnerOverrides[existingOverrideIndex].isActive = true;
      settings.partnerOverrides[existingOverrideIndex].updatedAt = new Date();
    } else {
      // Add new override
      settings.partnerOverrides.push({
        partner: partnerId,
        rates,
        isActive: true,
      });
    }

    settings.updatedBy = req.user._id;
    await settings.save();

    await settings.populate([
      {
        path: 'partnerOverrides.partner',
        select: 'shopName shopEmail user',
        populate: {
          path: 'user',
          select: 'name email',
        },
      },
      { path: 'updatedBy', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Partner commission rates updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Set partner commission rates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: error.message,
    });
  }
};

// Get partner-specific rates
export const getPartnerCommissionRates = async (req, res) => {
  try {
    const { partnerId } = req.params;

    // Validate partner exists
    const partner =
      await Partner.findById(partnerId).select('shopName shopEmail');
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    const settings = await CommissionSettings.findOne({ isActive: true });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Commission settings not found',
      });
    }

    // Find partner-specific override
    const partnerOverride = settings.partnerOverrides.find(
      (override) =>
        override.partner.toString() === partnerId && override.isActive
    );

    const response = {
      partner,
      globalRates: settings.defaultRates,
      customRates: partnerOverride ? partnerOverride.rates : null,
      hasCustomRates: !!partnerOverride,
      effectiveRates: {},
    };

    // Calculate effective rates (custom rates override global rates)
    const categories = ['mobile', 'tablet', 'laptop', 'accessories'];
    const orderTypes = ['buy', 'sell'];

    for (const orderType of orderTypes) {
      response.effectiveRates[orderType] = {};
      for (const category of categories) {
        if (
          partnerOverride &&
          partnerOverride.rates[orderType][category] !== undefined
        ) {
          response.effectiveRates[orderType][category] =
            partnerOverride.rates[orderType][category];
        } else {
          response.effectiveRates[orderType][category] =
            settings.defaultRates[orderType][category];
        }
      }
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Get partner commission rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Remove partner-specific rates (reset to global)
export const removePartnerCommissionRates = async (req, res) => {
  try {
    const { partnerId } = req.params;

    // Validate partner exists
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    const settings = await CommissionSettings.findOne({ isActive: true });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Commission settings not found',
      });
    }

    // Find and deactivate partner override
    const overrideIndex = settings.partnerOverrides.findIndex(
      (override) => override.partner.toString() === partnerId
    );

    if (overrideIndex !== -1) {
      settings.partnerOverrides[overrideIndex].isActive = false;
      settings.partnerOverrides[overrideIndex].updatedAt = new Date();
      settings.updatedBy = req.user._id;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Partner commission rates reset to global defaults',
    });
  } catch (error) {
    console.error('Remove partner commission rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get commission rate for calculation (used internally)
export const getCommissionRateForOrder = async (
  partnerId,
  category,
  orderType
) => {
  try {
    return await CommissionSettings.getCommissionRate(
      partnerId,
      category,
      orderType
    );
  } catch (error) {
    console.error('Get commission rate for order error:', error);
    // Return fallback rates
    const fallbackRates = {
      buy: { mobile: 5, tablet: 4, laptop: 3, accessories: 2 },
      sell: { mobile: 3, tablet: 2.5, laptop: 2, accessories: 1.5 },
    };
    return fallbackRates[orderType][category] || 0;
  }
};

// Calculate commission for order (used internally)
export const calculateCommissionForOrder = async (
  orderValue,
  category,
  orderType,
  partnerId
) => {
  try {
    return await CommissionSettings.calculateCommission(
      orderValue,
      category,
      orderType,
      partnerId
    );
  } catch (error) {
    console.error('Calculate commission for order error:', error);
    // Return fallback calculation
    const fallbackRates = {
      buy: { mobile: 5, tablet: 4, laptop: 3, accessories: 2 },
      sell: { mobile: 3, tablet: 2.5, laptop: 2, accessories: 1.5 },
    };
    const rate = fallbackRates[orderType][category] || 0;
    const amount = (orderValue * rate) / 100;
    return {
      rate,
      amount: Math.round(amount), // Round to whole number
      category,
    };
  }
};
