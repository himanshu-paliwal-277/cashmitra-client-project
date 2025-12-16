import { Partner } from '../models/partner.model.js';
import { ApiError } from './errorHandler.middleware.js';

export async function attachPartner(req, res, next) {
  try {
    if (req.user.role !== 'partner') {
      return next();
    }

    const partner = await Partner.findOne({ user: req.user.id });

    if (!partner) {
      throw new ApiError(404, 'Partner profile not found');
    }

    if (!partner.isVerified || partner.verificationStatus !== 'approved') {
      throw new ApiError(403, 'Partner account not approved yet');
    }

    req.partnerId = partner._id;
    req.partner = partner;
    next();
  } catch (error) {
    next(error);
  }
}

export function requirePartner(req, res, next) {
  if (req.user.role !== 'partner') {
    throw new ApiError(403, 'Access denied. Partner role required.');
  }

  if (!req.partnerId) {
    throw new ApiError(403, 'Partner profile not found or not verified');
  }

  next();
}

export function checkResourceOwnership(Model, resourceIdParam = 'id') {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') {
        return next();
      }

      if (req.user.role === 'partner') {
        const resourceId = req.params[resourceIdParam];
        const resource = await Model.findById(resourceId);

        if (!resource) {
          throw new ApiError(404, 'Resource not found');
        }

        if (
          resource.partnerId &&
          resource.partnerId.toString() !== req.partnerId.toString()
        ) {
          throw new ApiError(403, 'You can only access your own resources');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
