import { Address } from '../models/address.model.js';
import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
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
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;

    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address,
      };
    }

    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      dateOfBirth: updatedUser.dateOfBirth,
      address: updatedUser.address,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, orderType } = req.query;

    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (orderType) {
      query.orderType = orderType;
    }

    const orders = await Order.find(query)
      .populate('partner', 'name email phone')
      .populate(
        'items.product',
        'name brand model images pricing categoryId variants conditionOptions isActive'
      )
      .populate('items.inventory', 'condition price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('partner', 'name email phone address')
      .populate(
        'items.product',
        'name brand model images specifications pricing categoryId variants conditionOptions isActive'
      )
      .populate('items.inventory', 'condition price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json(addresses);
  } catch (error) {
    console.error('Get user addresses error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {    const addressData = {
      ...req.body,
      user: req.user._id,
    };

    const address = new Address(addressData);
    const savedAddress = await address.save();

    res.status(201).json(savedAddress);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        address[key] = req.body[key];
      }
    });

    const updatedAddress = await address.save();

    res.json(updatedAddress);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await Address.findByIdAndDelete(req.params.id);

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });

    address.isDefault = true;
    await address.save();

    res.json({ message: 'Default address updated successfully', address });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
