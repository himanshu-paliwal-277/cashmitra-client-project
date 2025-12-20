import { Partner } from '../models/partner.model.js';
import { User } from '../models/user.model.js';
import { generateToken } from '../utils/jwt.utils.js';

// ==========================================
// CUSTOMER/USER AUTHENTICATION CONTROLLERS
// ==========================================

/**
 * Register new customer account
 * POST /api/v1/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user',
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return user data with token
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Register user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message,
    });
  }
};

/**
 * Login customer account
 * POST /api/v1/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password for verification)
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is trying to login with admin credentials
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are an admin. Please login through the admin panel.',
      });
    }

    // Check if user is trying to login with partner credentials
    if (user.role === 'partner') {
      return res.status(403).json({
        success: false,
        message: 'You are a partner. Please login through the partner portal.',
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return user data with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
};

/**
 * Get current logged-in customer profile
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by isAuthenticated middleware
    const user = await User.findById(req.user._id).select('-password');

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return user profile
    return res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message,
    });
  }
};

/**
 * Update current customer profile
 * PUT /api/v1/auth/me
 */
export const updateUserProfile = async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user._id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user fields (only if provided)
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
    if (req.body.profileImage) user.profileImage = req.body.profileImage;

    // Update address fields (merge with existing address)
    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address,
      };
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Save updated user
    const updatedUser = await user.save();

    // Generate new token
    const token = generateToken(updatedUser._id, updatedUser.role);

    // Return updated user data
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      dateOfBirth: updatedUser.dateOfBirth,
      address: updatedUser.address,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      isVerified: updatedUser.isVerified,
      token,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// ==========================================
// PARTNER AUTHENTICATION CONTROLLERS
// ==========================================

/**
 * Register new partner account
 * POST /api/v1/auth/partner/register
 */
export const registerPartner = async (req, res) => {
  try {
    const { name, email, password, phone, address, businessType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user with partner role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'partner',
    });

    // Create partner profile
    const partner = await Partner.create({
      user: user._id,
      shopName: name,
      address,
      businessType,
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return partner data with token
    return res.status(201).json({
      success: true,
      message: 'Partner registered successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      partnerId: partner._id,
      shopName: partner.shopName,
      token,
    });
  } catch (error) {
    console.error('Register partner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register partner',
      error: error.message,
    });
  }
};

/**
 * Login partner account
 * POST /api/v1/auth/partner/login
 */
export const loginPartner = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password for verification)
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is trying to login with admin credentials
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are an admin. Please login through the admin panel.',
      });
    }

    // Check if user is trying to login with customer credentials
    if (user.role === 'user' || user.role === 'customer') {
      return res.status(403).json({
        success: false,
        message:
          'You are a customer. Please login through the customer login page.',
      });
    }

    // Check if user is a partner
    if (user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Partner account required.',
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Find partner profile
    const partner = await Partner.findOne({ user: user._id }).populate('user');

    // Check if partner profile exists
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return partner data with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      partnerId: partner._id,
      shopName: partner.shopName,
      isVerified: partner.isVerified,
      verificationStatus: partner.verificationStatus,
      token,
    });
  } catch (error) {
    console.error('Login partner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
};

/**
 * Get current logged-in partner profile
 * GET /api/v1/auth/partner/me
 */
export const getCurrentPartner = async (req, res) => {
  try {
    // req.user is set by isAuthenticated middleware
    const user = await User.findById(req.user._id).select('-password');

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find partner profile
    const partner = await Partner.findOne({ user: user._id }).populate('user');

    // Check if partner profile exists
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    // Return partner profile
    return res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      partnerId: partner._id,
      shopName: partner.shopName,
      address: partner.address,
      businessType: partner.businessType,
      isVerified: partner.isVerified,
      verificationStatus: partner.verificationStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get current partner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch partner profile',
      error: error.message,
    });
  }
};

/**
 * Update current partner profile
 * PUT /api/v1/auth/partner/me
 */
export const updatePartnerProfile = async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user._id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find partner profile
    const partner = await Partner.findOne({ user: user._id });

    // Check if partner profile exists
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    // Update user fields (only if provided)
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;

    // Update partner fields (only if provided)
    if (req.body.shopName) partner.shopName = req.body.shopName;
    if (req.body.address) partner.address = req.body.address;
    if (req.body.businessType) partner.businessType = req.body.businessType;

    // Save updated user and partner
    await user.save();
    await partner.save();

    // Generate new token
    const token = generateToken(user._id, user.role);

    // Return updated partner data
    return res.status(200).json({
      success: true,
      message: 'Partner profile updated successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      partnerId: partner._id,
      shopName: partner.shopName,
      address: partner.address,
      businessType: partner.businessType,
      token,
    });
  } catch (error) {
    console.error('Update partner profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update partner profile',
      error: error.message,
    });
  }
};
