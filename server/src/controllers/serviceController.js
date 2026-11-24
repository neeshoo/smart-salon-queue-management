const Service = require('../models/Service');
const Salon = require('../models/Salon');

// @desc    Get services for a salon
// @route   GET /api/salons/:id/services
// @access  Public
const getServicesBySalon = async (req, res, next) => {
  try {
    const services = await Service.find({ salonId: req.params.id, isActive: true });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Admin)
const createService = async (req, res, next) => {
  try {
    const { salonId, name, description, category, price, duration } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    if (req.user.role !== 'superadmin' && salon.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this salon' });
    }

    const service = await Service.create({
      salonId,
      name,
      description,
      category,
      price: Number(price),
      duration: Number(duration),
      avgActualDuration: Number(duration),
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Admin)
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, service: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate a service
// @route   DELETE /api/services/:id
// @access  Private (Admin)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    service.isActive = false;
    await service.save();

    res.json({ success: true, message: 'Service removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServicesBySalon,
  createService,
  updateService,
  deleteService,
};
