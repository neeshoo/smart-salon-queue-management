const User = require('../models/User');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const jwt = require('jsonwebtoken');
const { generateSalonQRCode } = require('../utils/qrCode');

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in server environment variables.');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Normalize & validate Indian 10-digit mobile number
const normalizeIndianMobile = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');
  // If prefixed with country code 91 (12 digits), strip it
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    // If prefixed with leading 0 (11 digits), strip it
    digits = digits.slice(1);
  }
  return digits;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Validate Indian phone number
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required. Please provide a valid 10-digit Indian mobile number.',
      });
    }

    const cleanDigits = normalizeIndianMobile(phone);
    if (!cleanDigits || cleanDigits.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits.',
      });
    }

    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      });
    }

    const normalizedPhone = `+91${cleanDigits}`;

    // Restrict superadmin registration
    const userRole = role === 'superadmin' ? 'customer' : role || 'customer';

    const user = await User.create({
      name,
      email,
      password,
      phone: normalizedPhone,
      role: userRole,
    });

    // If salon owner registration includes salon details, register salon & initial service
    if (userRole === 'admin' && req.body.salon) {
      const sData = req.body.salon;
      const initialPrice = sData.initialService?.price ? Number(sData.initialService.price) : 50;
      const city = sData.address?.city || 'Mahendragarh';
      const state = sData.address?.state || 'Haryana';

      const salon = await Salon.create({
        name: sData.name || `${user.name}'s Salon`,
        ownerId: user._id,
        phone: sData.phone || user.phone,
        email: sData.email || user.email,
        address: {
          street: sData.address?.street || '',
          city,
          state,
          zipCode: sData.address?.zipCode || '',
        },
        area: sData.area || city,
        category: sData.category || 'Neighborhood Salon',
        startingPrice: initialPrice,
        openingHour: sData.openingHour || '09:00',
        closingHour: sData.closingHour || '20:00',
        description: sData.description || 'Professional salon & grooming services.',
        isApproved: true,
        isActive: true,
      });

      try {
        salon.qrCodeData = await generateSalonQRCode(salon._id);
        await salon.save();
      } catch (qrErr) {
        console.warn('QR code generation skipped:', qrErr.message);
      }

      // Create initial service
      const serviceName = sData.initialService?.name || 'Haircut';
      const serviceDuration = Number(sData.initialService?.duration) || 20;

      await Service.create({
        salonId: salon._id,
        name: serviceName,
        price: initialPrice,
        duration: serviceDuration,
        description: 'Standard grooming service',
        isActive: true,
      });

      user.salonId = salon._id;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        salonId: user.salonId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        salonId: user.salonId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('salonId');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (name) user.name = name;
    if (phone !== undefined) {
      if (phone && phone.trim()) {
        const cleanDigits = normalizeIndianMobile(phone);
        if (!cleanDigits || cleanDigits.length !== 10) {
          return res.status(400).json({
            success: false,
            message: 'Phone number must be exactly 10 digits.',
          });
        }
        if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
          });
        }
        user.phone = `+91${cleanDigits}`;
      } else {
        user.phone = '';
      }
    }
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        salonId: user.salonId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
