const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const { generateSalonQRCode } = require('../utils/qrCode');

// @desc    Get all active salons (with search by name, city, service)
// @route   GET /api/salons
// @access  Public
const getSalons = async (req, res, next) => {
  try {
    const { search, city, openNow, area, category, minPrice, maxPrice } = req.query;
    let query = { isActive: true, isApproved: true };

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (area) {
      query['area'] = { $regex: area, $options: 'i' };
    }

    if (category) {
      query['category'] = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query['startingPrice'] = {};
      if (minPrice !== undefined) query['startingPrice']['$gte'] = Number(minPrice);
      if (maxPrice !== undefined) query['startingPrice']['$lte'] = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
      ];
    }

    const salons = await Salon.find(query).sort({ rating: -1, createdAt: -1 });

    // Optional filter: "openNow" based on IST (UTC+5:30)
    let filteredSalons = salons;
    if (openNow === 'true') {
      const now = new Date();
      // Convert to IST
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + istOffset);
      const currentMinutes = istNow.getUTCHours() * 60 + istNow.getUTCMinutes();

      filteredSalons = salons.filter((s) => {
        if (!s.openingHour || !s.closingHour) return true;
        const [oH, oM] = s.openingHour.split(':').map(Number);
        const [cH, cM] = s.closingHour.split(':').map(Number);
        const openMin = oH * 60 + oM;
        const closeMin = cH * 60 + cM;
        return currentMinutes >= openMin && currentMinutes <= closeMin;
      });
    }

    res.json({
      success: true,
      count: filteredSalons.length,
      salons: filteredSalons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single salon with services and staff
// @route   GET /api/salons/:id
// @access  Public
const getSalonById = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    const services = await Service.find({ salonId: salon._id, isActive: true });
    const staff = await Staff.find({ salonId: salon._id, isActive: true }).populate('specialties', 'name');

    // Generate or ensure QR code exists
    if (!salon.qrCodeData) {
      salon.qrCodeData = await generateSalonQRCode(salon._id);
      await salon.save();
    }

    res.json({
      success: true,
      salon,
      services,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new salon
// @route   POST /api/salons
// @access  Private (Admin / Superadmin)
const createSalon = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      area,
      category,
      startingPrice,
      openingHour,
      closingHour,
      description,
      autoNoShowMinutes,
      serviceName,
      servicePrice,
      serviceDuration,
    } = req.body;

    const initialPrice = startingPrice !== undefined ? Number(startingPrice) : (servicePrice ? Number(servicePrice) : 50);
    const city = address?.city || 'Mahendragarh';
    const state = address?.state || 'Haryana';

    const salon = await Salon.create({
      name,
      phone: phone || req.user.phone || '+91-98765-00000',
      email: email || req.user.email,
      ownerId: req.user._id,
      address: {
        street: address?.street || '',
        city,
        state,
        zipCode: address?.zipCode || '',
      },
      area: area || city,
      category: category || 'Neighborhood Salon',
      startingPrice: initialPrice,
      openingHour: openingHour || '09:00',
      closingHour: closingHour || '21:00',
      description: description || '',
      autoNoShowMinutes: autoNoShowMinutes || 10,
      isApproved: true,
      isActive: true,
    });

    // Generate QR code
    try {
      salon.qrCodeData = await generateSalonQRCode(salon._id);
      await salon.save();
    } catch (e) {
      console.warn('QR generation skipped:', e.message);
    }

    // Create initial service if provided
    if (serviceName || initialPrice) {
      await Service.create({
        salonId: salon._id,
        name: serviceName || 'Haircut',
        price: initialPrice,
        duration: Number(serviceDuration) || 20,
        description: 'Standard grooming service',
        isActive: true,
      });
    }

    // Link salon to admin user
    req.user.salonId = salon._id;
    await req.user.save();

    res.status(201).json({
      success: true,
      salon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update salon profile
// @route   PUT /api/salons/:id
// @access  Private (Admin / Owner)
const updateSalon = async (req, res, next) => {
  try {
    let salon = await Salon.findById(req.params.id);
    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    // Check ownership unless superadmin
    if (req.user.role !== 'superadmin' && salon.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this salon' });
    }

    salon = await Salon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      salon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services for a salon
// @route   GET /api/salons/:id/services
// @access  Public
const getServicesBySalon = async (req, res, next) => {
  try {
    const services = await Service.find({ salonId: req.params.id, isActive: true }).sort({ price: 1 });
    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalons,
  getSalonById,
  createSalon,
  updateSalon,
  getServicesBySalon,
};
