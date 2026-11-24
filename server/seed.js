/**
 * Smart Salon – Indian Market Seed Data
 * CUH / Mahendragarh / Haryana Focus
 *
 * Run:  node seed.js
 *       node seed.js --force   (clears existing data first)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Salon = require('./src/models/Salon');
const Service = require('./src/models/Service');
const Staff = require('./src/models/Staff');
const Booking = require('./src/models/Booking');
const QueueCounter = require('./src/models/QueueCounter');
const Review = require('./src/models/Review');
const Notification = require('./src/models/Notification');
const { generateSalonQRCode } = require('./src/utils/qrCode');

const FORCE = process.argv.includes('--force');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-salon';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // ── Guard: skip if data exists (unless --force) ──────────────────────────
    if (!FORCE) {
      const existing = await User.findOne({ email: 'admin@smartsalon.com' });
      if (existing) {
        console.log('Seed data already exists. Use --force to re-seed.');
        process.exit(0);
      }
    }

    // ── Clear all collections ─────────────────────────────────────────────────
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Salon.deleteMany({}),
      Service.deleteMany({}),
      Staff.deleteMany({}),
      Booking.deleteMany({}),
      QueueCounter.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Collections cleared.');

    // ══════════════════════════════════════════════════════════════════════════
    // USERS (User schema pre-save automatically hashes passwords with bcrypt)
    // ══════════════════════════════════════════════════════════════════════════
    console.log('Creating users...');

    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@smartsalon.com',
      password: 'admin123',
      role: 'superadmin',
      phone: '+91-98765-00001',
      isVerified: true,
    });

    // Salon owners
    const owner1 = await User.create({
      name: 'Amit Sharma',
      email: 'amit.sharma@smartsalon.com',
      password: 'owner123',
      role: 'admin',
      phone: '+91-98765-10001',
      isVerified: true,
    });
    const owner2 = await User.create({
      name: 'Vikram Yadav',
      email: 'vikram.yadav@smartsalon.com',
      password: 'owner123',
      role: 'admin',
      phone: '+91-98765-10002',
      isVerified: true,
    });
    const owner3 = await User.create({
      name: 'Sunil Kumar',
      email: 'sunil.kumar@smartsalon.com',
      password: 'owner123',
      role: 'admin',
      phone: '+91-98765-10003',
      isVerified: true,
    });
    const owner4 = await User.create({
      name: 'Anil Verma',
      email: 'anil.verma@smartsalon.com',
      password: 'owner123',
      role: 'admin',
      phone: '+91-98765-10004',
      isVerified: true,
    });
    const owner5 = await User.create({
      name: 'Rajesh Gupta',
      email: 'rajesh.gupta@smartsalon.com',
      password: 'owner123',
      role: 'admin',
      phone: '+91-98765-10005',
      isVerified: true,
    });
    const owner6 = await User.create({
      name: 'Pawan Saini',
      email: 'pawan.saini@smartsalon.com',
      password: 'owner123',
      role: 'admin',
      phone: '+91-98765-10006',
      isVerified: true,
    });
    const owner7 = await User.create({
      name: 'Dinesh Yadav',
      email: 'dinesh.yadav@smartsalon.com',
      password: 'owner123',
      role: 'admin',
      phone: '+91-98765-10007',
      isVerified: true,
    });
    const owner8 = await User.create({
      name: 'Ravi Sharma',
      email: 'ravi.sharma@smartsalon.com',
      password: 'owner123',
      role: 'admin',
      phone: '+91-98765-10008',
      isVerified: true,
    });

    // Staff user (for login)
    const staffUser = await User.create({
      name: 'Deepak Barber',
      email: 'staff@smartsalon.com',
      password: 'staff123',
      role: 'staff',
      phone: '+91-98765-20001',
      isVerified: true,
    });

    // Customers
    const cust1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91-98765-30001',
      isVerified: true,
    });
    const cust2 = await User.create({
      name: 'Aman Yadav',
      email: 'aman.yadav@gmail.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91-98765-30002',
      isVerified: true,
    });
    const cust3 = await User.create({
      name: 'Mohit Kumar',
      email: 'mohit.kumar@gmail.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91-98765-30003',
      isVerified: true,
    });
    const cust4 = await User.create({
      name: 'Deepak Singh',
      email: 'deepak.singh@gmail.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91-98765-30004',
      isVerified: true,
    });
    const cust5 = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@gmail.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91-98765-30005',
      isVerified: true,
    });
    const cust6 = await User.create({
      name: 'Neha Kumari',
      email: 'neha.kumari@gmail.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91-98765-30006',
      isVerified: true,
    });

    console.log('Users created.');

    // ══════════════════════════════════════════════════════════════════════════
    // SALONS
    // ══════════════════════════════════════════════════════════════════════════
    console.log('Creating salons...');

    // ── Salon 1: Jant-Pali Budget Barber (₹40 start) ─────────────────────────
    const salon1 = await Salon.create({
      name: 'Jant-Pali Family Hair Studio',
      ownerId: owner1._id,
      email: 'jantpali.hairstudio@gmail.com',
      phone: '+91-94670-11001',
      address: { street: 'Near Main Chowk', city: 'Jant-Pali', state: 'Haryana', zipCode: '123029' },
      location: { type: 'Point', coordinates: [76.1521, 28.2834] },
      description: 'Affordable family barbershop near CUH campus. ₹50 haircut, ₹50 beard trim. Trusted by students and local families since 2015.',
      openingHour: '08:00',
      closingHour: '20:00',
      workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      category: 'Budget Barber',
      startingPrice: 40,
      area: 'Jant-Pali',
      rating: 4.5,
      numReviews: 48,
      logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80',
      isApproved: true,
      isActive: true,
      autoNoShowMinutes: 10,
    });

    // ── Salon 2: Student Choice (₹50 start) ─────────────────────────────────
    const salon2 = await Salon.create({
      name: 'Student Choice Hair Cutting Salon',
      ownerId: owner2._id,
      email: 'studentchoice.salon@gmail.com',
      phone: '+91-96500-22002',
      address: { street: 'CUH Gate Road', city: 'Jant-Pali', state: 'Haryana', zipCode: '123029' },
      location: { type: 'Point', coordinates: [76.1535, 28.2820] },
      description: 'Student-friendly salon just outside CUH gate. ₹50 haircut & beard. No appointment needed — join queue from your hostel room!',
      openingHour: '09:00',
      closingHour: '21:00',
      workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      category: 'Budget Barber',
      startingPrice: 50,
      area: 'Jant-Pali',
      rating: 4.3,
      numReviews: 112,
      logo: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=500&q=80',
      isApproved: true,
      isActive: true,
      autoNoShowMinutes: 10,
    });

    // ── Salon 3: Mahendragarh Local Barber (₹50 start) ─────────────────────
    const salon3 = await Salon.create({
      name: 'Mahendragarh Local Barber Shop',
      ownerId: owner3._id,
      email: 'mahendragarh.barber@gmail.com',
      phone: '+91-93500-33003',
      address: { street: 'Old Bus Stand Road', city: 'Mahendragarh', state: 'Haryana', zipCode: '123029' },
      location: { type: 'Point', coordinates: [76.1430, 28.2780] },
      description: 'Traditional neighborhood barber in Mahendragarh. Known for ₹50 haircuts and expert beard shaping. Walk in anytime.',
      openingHour: '07:30',
      closingHour: '19:30',
      workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      category: 'Budget Barber',
      startingPrice: 50,
      area: 'Mahendragarh',
      rating: 4.2,
      numReviews: 73,
      logo: 'https://images.unsplash.com/photo-1512864084360-7c0c4d1e1a01?auto=format&fit=crop&w=500&q=80',
      isApproved: true,
      isActive: true,
      autoNoShowMinutes: 15,
    });

    // ── Salon 4: Narnaul Neighborhood (₹80 start) ───────────────────────────
    const salon4 = await Salon.create({
      name: 'Narnaul Hair & Beauty Studio',
      ownerId: owner4._id,
      email: 'narnaul.beauty@gmail.com',
      phone: '+91-98700-44004',
      address: { street: 'Near Narnaul Chowk', city: 'Narnaul', state: 'Haryana', zipCode: '123001' },
      location: { type: 'Point', coordinates: [76.1100, 28.0427] },
      description: 'Well-established neighborhood salon in Narnaul. Offers haircuts, beard styling, facials and hair color at honest prices.',
      openingHour: '09:00',
      closingHour: '20:00',
      workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      category: 'Neighborhood Salon',
      startingPrice: 80,
      area: 'Narnaul',
      rating: 4.4,
      numReviews: 56,
      logo: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=500&q=80',
      isApproved: true,
      isActive: true,
      autoNoShowMinutes: 10,
    });

    // ── Salon 5: Kanina Modern Grooming (₹150 start) ────────────────────────
    const salon5 = await Salon.create({
      name: 'Kanina Modern Grooming Studio',
      ownerId: owner5._id,
      email: 'kanina.grooming@gmail.com',
      phone: '+91-99100-55005',
      address: { street: 'Main Market, Kanina', city: 'Kanina', state: 'Haryana', zipCode: '123027' },
      location: { type: 'Point', coordinates: [76.1890, 28.1545] },
      description: 'Modern grooming studio in Kanina with skilled barbers. Fade haircuts, beard styling, hair spa and facials at competitive rates.',
      openingHour: '10:00',
      closingHour: '21:00',
      workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      category: 'Modern Grooming',
      startingPrice: 150,
      area: 'Kanina',
      rating: 4.6,
      numReviews: 34,
      logo: 'https://images.unsplash.com/photo-1593702288056-7cc29c3c4e35?auto=format&fit=crop&w=500&q=80',
      isApproved: true,
      isActive: true,
      autoNoShowMinutes: 10,
    });

    // ── Salon 6: Urban Style Unisex (₹120 start) ────────────────────────────
    const salon6 = await Salon.create({
      name: 'Urban Style Unisex Salon',
      ownerId: owner6._id,
      email: 'urbanstyle.unisex@gmail.com',
      phone: '+91-98123-66006',
      address: { street: 'College Road', city: 'Mahendragarh', state: 'Haryana', zipCode: '123029' },
      location: { type: 'Point', coordinates: [76.1480, 28.2810] },
      description: 'Trendy unisex salon for men and women. Haircuts, blowdry, facial, waxing, threading and hair color — all under one roof.',
      openingHour: '10:00',
      closingHour: '20:30',
      workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      category: 'Unisex Salon',
      startingPrice: 120,
      area: 'Mahendragarh',
      rating: 4.7,
      numReviews: 87,
      logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
      isApproved: true,
      isActive: true,
      autoNoShowMinutes: 10,
    });

    // ── Salon 7: Royal Men's Grooming (₹150 start) ──────────────────────────
    const salon7 = await Salon.create({
      name: "Royal Men's Grooming Studio",
      ownerId: owner7._id,
      email: 'royal.grooming@gmail.com',
      phone: '+91-97200-77007',
      address: { street: 'Near City Hospital', city: 'Mahendragarh', state: 'Haryana', zipCode: '123029' },
      location: { type: 'Point', coordinates: [76.1500, 28.2850] },
      description: 'Premium men\'s grooming experience in Mahendragarh. Expert barbers, hot towel shaves, fade haircuts and advanced hair treatments.',
      openingHour: '09:30',
      closingHour: '21:00',
      workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      category: 'Modern Grooming',
      startingPrice: 150,
      area: 'Mahendragarh',
      rating: 4.8,
      numReviews: 95,
      logo: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80',
      isApproved: true,
      isActive: true,
      autoNoShowMinutes: 10,
    });

    // ── Salon 8: Premium Look (₹250 start) ──────────────────────────────────
    const salon8 = await Salon.create({
      name: 'Premium Look Hair Studio',
      ownerId: owner8._id,
      email: 'premiumlook.studio@gmail.com',
      phone: '+91-96000-88008',
      address: { street: 'Near Ateli Road Junction', city: 'Mahendragarh', state: 'Haryana', zipCode: '123029' },
      location: { type: 'Point', coordinates: [76.1510, 28.2890] },
      description: 'Premium styling salon with certified professionals. Advanced hair coloring, Keratin treatments, skin facials, bridal makeup and wedding packages.',
      openingHour: '10:00',
      closingHour: '21:00',
      workingDays: ['Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      category: 'Premium Salon',
      startingPrice: 250,
      area: 'Ateli',
      rating: 4.9,
      numReviews: 42,
      logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80',
      isApproved: true,
      isActive: true,
      autoNoShowMinutes: 15,
    });

    console.log('Salons created.');

    // ── Link owners to their salons ───────────────────────────────────────────
    owner1.salonId = salon1._id; await owner1.save();
    owner2.salonId = salon2._id; await owner2.save();
    owner3.salonId = salon3._id; await owner3.save();
    owner4.salonId = salon4._id; await owner4.save();
    owner5.salonId = salon5._id; await owner5.save();
    owner6.salonId = salon6._id; await owner6.save();
    owner7.salonId = salon7._id; await owner7.save();
    owner8.salonId = salon8._id; await owner8.save();

    // ══════════════════════════════════════════════════════════════════════════
    // SERVICES
    // ══════════════════════════════════════════════════════════════════════════
    console.log('Creating services...');

    // Salon 1 – Budget Barber (Jant-Pali Family Hair Studio)
    await Service.insertMany([
      { salonId: salon1._id, name: 'Normal Haircut', duration: 20, price: 50, description: 'Basic haircut by experienced barber', isActive: true },
      { salonId: salon1._id, name: 'Beard Trimming', duration: 15, price: 50, description: 'Neat beard trimming and shaping', isActive: true },
      { salonId: salon1._id, name: 'Haircut + Beard', duration: 30, price: 90, description: 'Combo offer: haircut and beard', isActive: true },
      { salonId: salon1._id, name: 'Shaving (Clean Shave)', duration: 15, price: 40, description: 'Full clean shave with blade', isActive: true },
      { salonId: salon1._id, name: 'Head Massage', duration: 20, price: 50, description: 'Relaxing oil head massage', isActive: true },
      { salonId: salon1._id, name: 'Hair Wash', duration: 15, price: 40, description: 'Hair wash with shampoo', isActive: true },
      { salonId: salon1._id, name: 'Haircut + Hair Wash', duration: 35, price: 80, description: 'Haircut followed by hair wash', isActive: true },
      { salonId: salon1._id, name: "Kids Haircut", duration: 20, price: 50, description: 'Haircut for children below 12', isActive: true },
    ]);

    // Salon 2 – Budget Barber (Student Choice)
    await Service.insertMany([
      { salonId: salon2._id, name: 'Normal Haircut', duration: 20, price: 50, description: 'Standard haircut for all hair types', isActive: true },
      { salonId: salon2._id, name: 'Beard Trim', duration: 15, price: 50, description: 'Professional beard trim', isActive: true },
      { salonId: salon2._id, name: 'Haircut + Beard', duration: 30, price: 90, description: 'Full grooming combo', isActive: true },
      { salonId: salon2._id, name: 'Clean Shave', duration: 15, price: 40, description: 'Clean blade shave', isActive: true },
      { salonId: salon2._id, name: 'Head Massage', duration: 20, price: 50, description: 'Oil massage for scalp relaxation', isActive: true },
      { salonId: salon2._id, name: 'Hair Wash', duration: 15, price: 40, description: 'Shampoo wash', isActive: true },
      { salonId: salon2._id, name: "Kids Haircut", duration: 20, price: 50, description: 'Haircut for children', isActive: true },
    ]);

    // Salon 3 – Budget Barber (Mahendragarh Local)
    await Service.insertMany([
      { salonId: salon3._id, name: 'Haircut', duration: 20, price: 50, description: 'Regular haircut', isActive: true },
      { salonId: salon3._id, name: 'Beard Trim', duration: 15, price: 50, description: 'Beard trimming', isActive: true },
      { salonId: salon3._id, name: 'Haircut + Beard', duration: 30, price: 90, description: 'Combo pack', isActive: true },
      { salonId: salon3._id, name: 'Shaving', duration: 15, price: 40, description: 'Traditional clean shave', isActive: true },
      { salonId: salon3._id, name: 'Hair Wash', duration: 15, price: 40, description: 'Shampoo wash', isActive: true },
      { salonId: salon3._id, name: 'Head Massage', duration: 20, price: 50, description: 'Head massage with oil', isActive: true },
    ]);

    // Salon 4 – Neighborhood Salon (Narnaul)
    await Service.insertMany([
      { salonId: salon4._id, name: 'Haircut', duration: 25, price: 100, description: 'Professional haircut by trained barber', isActive: true },
      { salonId: salon4._id, name: 'Beard Styling', duration: 20, price: 70, description: 'Beard shaping and styling', isActive: true },
      { salonId: salon4._id, name: 'Haircut + Beard', duration: 40, price: 160, description: 'Complete grooming package', isActive: true },
      { salonId: salon4._id, name: 'Hair Wash', duration: 20, price: 60, description: 'Deep cleanse shampoo wash', isActive: true },
      { salonId: salon4._id, name: 'Hair Styling', duration: 25, price: 100, description: 'Blowdry and styling', isActive: true },
      { salonId: salon4._id, name: 'Basic Facial', duration: 40, price: 350, description: 'Cleansing and moisturizing facial', isActive: true },
      { salonId: salon4._id, name: 'Hair Color (Global)', duration: 60, price: 450, description: 'Full head global hair color', isActive: true },
      { salonId: salon4._id, name: 'Highlights', duration: 90, price: 600, description: 'Partial highlights', isActive: true },
    ]);

    // Salon 5 – Modern Grooming (Kanina)
    await Service.insertMany([
      { salonId: salon5._id, name: 'Fade Haircut', duration: 30, price: 200, description: 'Skin or low fade with scissor work', isActive: true },
      { salonId: salon5._id, name: 'Regular Haircut', duration: 25, price: 150, description: 'Classic scissor or clipper cut', isActive: true },
      { salonId: salon5._id, name: 'Beard Styling', duration: 20, price: 120, description: 'Beard lining and styling', isActive: true },
      { salonId: salon5._id, name: 'Haircut + Beard', duration: 45, price: 300, description: 'Full grooming session', isActive: true },
      { salonId: salon5._id, name: 'Hair Spa', duration: 60, price: 500, description: 'Deep conditioning hair spa treatment', isActive: true },
      { salonId: salon5._id, name: 'Advanced Facial', duration: 50, price: 700, description: 'Deep cleansing + de-tanning facial', isActive: true },
      { salonId: salon5._id, name: 'Head Massage', duration: 25, price: 150, description: 'Scalp massage with premium oil', isActive: true },
    ]);

    // Salon 6 – Unisex (Urban Style)
    await Service.insertMany([
      { salonId: salon6._id, name: 'Ladies Haircut', duration: 40, price: 200, description: 'Haircut with wash and blowdry for women', isActive: true },
      { salonId: salon6._id, name: 'Gents Haircut', duration: 25, price: 120, description: 'Precision haircut for men', isActive: true },
      { salonId: salon6._id, name: 'Blowdry & Styling', duration: 30, price: 180, description: 'Wash, blowdry and style', isActive: true },
      { salonId: salon6._id, name: 'Threading (Eyebrows)', duration: 10, price: 30, description: 'Eyebrow threading', isActive: true },
      { salonId: salon6._id, name: 'Waxing (Full Arms)', duration: 25, price: 150, description: 'Full arms waxing', isActive: true },
      { salonId: salon6._id, name: 'Facial (Gold)', duration: 60, price: 600, description: 'Gold facial with glow mask', isActive: true },
      { salonId: salon6._id, name: 'Hair Color (Global)', duration: 60, price: 500, description: 'Full head global hair color', isActive: true },
      { salonId: salon6._id, name: 'Highlights & Streaks', duration: 90, price: 800, description: 'Partial highlights or full streaks', isActive: true },
      { salonId: salon6._id, name: 'Beard Trim (Gents)', duration: 15, price: 80, description: 'Beard shaping for men', isActive: true },
    ]);

    // Salon 7 – Royal Men's Grooming
    await Service.insertMany([
      { salonId: salon7._id, name: 'Premium Haircut', duration: 35, price: 200, description: 'Expert scissor cut with shampoo finish', isActive: true },
      { salonId: salon7._id, name: 'Fade Haircut', duration: 35, price: 250, description: 'Skin/low/mid fade with detailed finish', isActive: true },
      { salonId: salon7._id, name: 'Hot Towel Shave', duration: 30, price: 150, description: 'Classic hot-towel razor shave', isActive: true },
      { salonId: salon7._id, name: 'Beard Styling', duration: 25, price: 150, description: 'Precision beard shaping and lining', isActive: true },
      { salonId: salon7._id, name: 'Haircut + Beard Package', duration: 55, price: 350, description: 'Premium haircut and beard combo', isActive: true },
      { salonId: salon7._id, name: 'Hair Spa (Keratin)', duration: 90, price: 700, description: 'Keratin repair hair spa', isActive: true },
      { salonId: salon7._id, name: 'De-Tan Facial', duration: 50, price: 600, description: 'Skin brightening de-tan facial for men', isActive: true },
      { salonId: salon7._id, name: 'Scalp Treatment', duration: 45, price: 400, description: 'Anti-dandruff scalp treatment', isActive: true },
      { salonId: salon7._id, name: 'Head Massage (Premium)', duration: 30, price: 200, description: 'Deep tissue head massage', isActive: true },
    ]);

    // Salon 8 – Premium Look
    await Service.insertMany([
      { salonId: salon8._id, name: 'Designer Haircut', duration: 45, price: 400, description: 'Personalized style consultation + haircut', isActive: true },
      { salonId: salon8._id, name: 'Premium Fade', duration: 45, price: 350, description: 'Expert fade by certified barber', isActive: true },
      { salonId: salon8._id, name: 'Beard Design', duration: 30, price: 250, description: 'Creative beard design and lining', isActive: true },
      { salonId: salon8._id, name: 'Hair Color (Global)', duration: 90, price: 800, description: 'Professional global hair coloring', isActive: true },
      { salonId: salon8._id, name: 'Balayage / Ombre', duration: 150, price: 1500, description: 'Hand-painted balayage or ombre technique', isActive: true },
      { salonId: salon8._id, name: 'Keratin Treatment', duration: 180, price: 1800, description: 'Professional smoothing Keratin treatment', isActive: true },
      { salonId: salon8._id, name: 'Premium Facial (Fruit)', duration: 60, price: 700, description: 'Luxury fruit facial with peel mask', isActive: true },
      { salonId: salon8._id, name: 'Bridal Package', duration: 240, price: 1500, description: 'Full bridal hair + makeup package', isActive: true },
      { salonId: salon8._id, name: 'Hair Spa (Advance)', duration: 90, price: 900, description: 'Advanced repair and nourishment hair spa', isActive: true },
    ]);

    console.log('Services created.');

    // ══════════════════════════════════════════════════════════════════════════
    // STAFF
    // ══════════════════════════════════════════════════════════════════════════
    console.log('Creating staff...');

    // Get service IDs for salons
    const s1Services = await Service.find({ salonId: salon1._id });
    const s2Services = await Service.find({ salonId: salon2._id });
    const s7Services = await Service.find({ salonId: salon7._id });
    const s8Services = await Service.find({ salonId: salon8._id });

    const staff1 = await Staff.create({
      name: 'Deepak',
      salonId: salon1._id,
      userId: staffUser._id,
      phone: '+91-98765-20001',
      specialties: s1Services.slice(0, 4).map((s) => s._id),
      isAvailable: true,
      isActive: true,
      avgServiceTime: 20,
    });
    // Link staff user to salon
    staffUser.salonId = salon1._id;
    await staffUser.save();

    const staff2 = await Staff.create({
      name: 'Rohit',
      salonId: salon1._id,
      phone: '+91-98765-20002',
      specialties: s1Services.map((s) => s._id),
      isAvailable: true,
      isActive: true,
      avgServiceTime: 20,
    });

    const staff3 = await Staff.create({
      name: 'Manoj',
      salonId: salon2._id,
      phone: '+91-98765-20003',
      specialties: s2Services.slice(0, 4).map((s) => s._id),
      isAvailable: true,
      isActive: true,
      avgServiceTime: 20,
    });
    const staff4 = await Staff.create({
      name: 'Vikas',
      salonId: salon2._id,
      phone: '+91-98765-20004',
      specialties: s2Services.map((s) => s._id),
      isAvailable: true,
      isActive: true,
      avgServiceTime: 20,
    });

    await Staff.create({
      name: 'Pankaj',
      salonId: salon7._id,
      phone: '+91-98765-20005',
      specialties: s7Services.slice(0, 5).map((s) => s._id),
      isAvailable: true,
      isActive: true,
      avgServiceTime: 30,
    });
    await Staff.create({
      name: 'Suresh',
      salonId: salon7._id,
      phone: '+91-98765-20006',
      specialties: s7Services.map((s) => s._id),
      isAvailable: true,
      isActive: true,
      avgServiceTime: 30,
    });
    await Staff.create({
      name: 'Rahul',
      salonId: salon8._id,
      phone: '+91-98765-20007',
      specialties: s8Services.slice(0, 5).map((s) => s._id),
      isAvailable: true,
      isActive: true,
      avgServiceTime: 45,
    });

    console.log('Staff created.');

    // ══════════════════════════════════════════════════════════════════════════
    // QUEUE & BOOKINGS (live queue in salon2 for today)
    // ══════════════════════════════════════════════════════════════════════════
    console.log('Creating live queue for Student Choice Salon (salon2)...');

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const salon2Services = await Service.find({ salonId: salon2._id });
    const haircut = salon2Services.find((s) => s.name === 'Normal Haircut') || salon2Services[0];
    const beardTrim = salon2Services.find((s) => s.name === 'Beard Trim') || salon2Services[1];
    const combo = salon2Services.find((s) => s.name === 'Haircut + Beard') || salon2Services[2];

    // QueueCounter for salon2 today
    const counter = await QueueCounter.create({
      salonId: salon2._id,
      date: dateStr,
      seq: 5,
    });

    // Helper: create a booking
    const makeBooking = async (userId, name, phone, service, staffMember, token, status, priority = 'NORMAL') => {
      const tokenFormatted = `T-${String(token).padStart(3, '0')}`;
      return await Booking.create({
        customerId: userId,
        salonId: salon2._id,
        serviceId: service._id,
        services: [service._id],
        staffId: staffMember._id,
        customerName: name,
        customerPhone: phone,
        tokenNumber: token,
        tokenFormatted,
        date: dateStr,
        status,
        priority,
        estimatedTime: service.duration,
        notes: '',
      });
    };

    // Token 1: IN_SERVICE (Rahul Sharma)
    const b1 = await makeBooking(cust1._id, 'Rahul Sharma', '+91-98765-30001', haircut, staff3, 1, 'IN_SERVICE');
    // Token 2: WAITING (Aman Yadav)
    const b2 = await makeBooking(cust2._id, 'Aman Yadav', '+91-98765-30002', combo, staff4, 2, 'WAITING');
    // Token 3: WAITING (Mohit Kumar)
    const b3 = await makeBooking(cust3._id, 'Mohit Kumar', '+91-98765-30003', beardTrim, staff3, 3, 'WAITING');
    // Token 4: WAITING (Deepak Singh)
    const b4 = await makeBooking(cust4._id, 'Deepak Singh', '+91-98765-30004', haircut, staff4, 4, 'WAITING');
    // Token 5: WAITING (walk-in)
    const b5 = await Booking.create({
      customerId: cust1._id,
      salonId: salon2._id,
      serviceId: haircut._id,
      services: [haircut._id],
      staffId: staff3._id,
      customerName: 'Sandeep Kumar',
      customerPhone: '+91-98765-39999',
      tokenNumber: 5,
      tokenFormatted: 'T-005',
      date: dateStr,
      status: 'WAITING',
      priority: 'NORMAL',
      estimatedTime: haircut.duration,
      notes: 'Walk-in customer',
    });

    console.log('Queue seeded for salon2 with 5 tokens (1 IN_SERVICE, 4 WAITING).');

    // ══════════════════════════════════════════════════════════════════════════
    // REVIEWS
    // ══════════════════════════════════════════════════════════════════════════
    console.log('Creating sample reviews...');

    // Create completed historical bookings for reviews
    const histBooking1 = await Booking.create({
      customerId: cust1._id,
      salonId: salon2._id,
      serviceId: haircut._id,
      services: [haircut._id],
      staffId: staff3._id,
      customerName: 'Rahul Sharma',
      customerPhone: '+91-98765-30001',
      tokenNumber: 99,
      tokenFormatted: 'T-099',
      date: '2026-11-20',
      status: 'COMPLETED',
      priority: 'NORMAL',
      estimatedTime: haircut.duration,
      notes: 'Past completed service',
    });

    const histBooking2 = await Booking.create({
      customerId: cust2._id,
      salonId: salon2._id,
      serviceId: combo._id,
      services: [combo._id],
      staffId: staff4._id,
      customerName: 'Aman Yadav',
      customerPhone: '+91-98765-30002',
      tokenNumber: 98,
      tokenFormatted: 'T-098',
      date: '2026-11-21',
      status: 'COMPLETED',
      priority: 'NORMAL',
      estimatedTime: combo.duration,
      notes: 'Past completed service',
    });

    const s7ServicesAll = await Service.find({ salonId: salon7._id });
    const histBooking3 = await Booking.create({
      customerId: cust3._id,
      salonId: salon7._id,
      serviceId: s7ServicesAll[0]._id,
      services: [s7ServicesAll[0]._id],
      customerName: 'Mohit Kumar',
      customerPhone: '+91-98765-30003',
      tokenNumber: 1,
      tokenFormatted: 'T-001',
      date: '2026-11-22',
      status: 'COMPLETED',
      priority: 'NORMAL',
      estimatedTime: s7ServicesAll[0].duration,
      notes: 'Past completed service',
    });

    const s1ServicesAll = await Service.find({ salonId: salon1._id });
    const histBooking4 = await Booking.create({
      customerId: cust4._id,
      salonId: salon1._id,
      serviceId: s1ServicesAll[0]._id,
      services: [s1ServicesAll[0]._id],
      customerName: 'Deepak Singh',
      customerPhone: '+91-98765-30004',
      tokenNumber: 1,
      tokenFormatted: 'T-001',
      date: '2026-11-22',
      status: 'COMPLETED',
      priority: 'NORMAL',
      estimatedTime: s1ServicesAll[0].duration,
      notes: 'Past completed service',
    });

    await Review.insertMany([
      {
        salonId: salon2._id,
        customerId: cust1._id,
        bookingId: histBooking1._id,
        customerName: 'Rahul Sharma',
        rating: 5,
        comment: 'Bahut badhiya salon hai! ₹50 mein best haircut. Waiting time bhi bahut kam tha.',
      },
      {
        salonId: salon2._id,
        customerId: cust2._id,
        bookingId: histBooking2._id,
        customerName: 'Aman Yadav',
        rating: 4,
        comment: 'Good experience. The app made it easy to join queue from hostel. Very convenient for CUH students.',
      },
      {
        salonId: salon7._id,
        customerId: cust3._id,
        bookingId: histBooking3._id,
        customerName: 'Mohit Kumar',
        rating: 5,
        comment: 'Royal feel at good price. Best beard styling in Mahendragarh. Will visit again!',
      },
      {
        salonId: salon1._id,
        customerId: cust4._id,
        bookingId: histBooking4._id,
        customerName: 'Deepak Singh',
        rating: 4,
        comment: 'Affordable and clean. ₹90 combo is great value for haircut + beard.',
      },
    ]);

    console.log('Reviews created.');

    // ══════════════════════════════════════════════════════════════════════════
    // QR CODES
    // ══════════════════════════════════════════════════════════════════════════
    console.log('Generating QR codes...');
    for (const salon of [salon1, salon2, salon3, salon4, salon5, salon6, salon7, salon8]) {
      try {
        salon.qrCodeData = await generateSalonQRCode(salon._id);
        await salon.save();
      } catch (e) {
        console.warn(`QR generation skipped for ${salon.name}:`, e.message);
      }
    }
    console.log('QR codes generated.');

    // ══════════════════════════════════════════════════════════════════════════
    // SUMMARY
    // ══════════════════════════════════════════════════════════════════════════
    console.log('\n════════════════════════════════════════════════════');
    console.log('          SEED COMPLETED SUCCESSFULLY');
    console.log('════════════════════════════════════════════════════');
    console.log('\n📍 Target Area: CUH / Mahendragarh / Haryana');
    console.log('\n👤 Login Credentials:');
    console.log('   Super Admin  : admin@smartsalon.com       / admin123');
    console.log('   Owner 1      : amit.sharma@smartsalon.com / owner123  (Jant-Pali Family Hair Studio)');
    console.log('   Owner 2      : vikram.yadav@smartsalon.com/ owner123  (Student Choice Salon) ← live queue');
    console.log('   Owner 3      : sunil.kumar@smartsalon.com / owner123  (Mahendragarh Local Barber)');
    console.log('   Owner 4      : anil.verma@smartsalon.com  / owner123  (Narnaul Hair & Beauty)');
    console.log('   Owner 5      : rajesh.gupta@smartsalon.com/ owner123  (Kanina Modern Grooming)');
    console.log('   Owner 6      : pawan.saini@smartsalon.com / owner123  (Urban Style Unisex)');
    console.log('   Owner 7      : dinesh.yadav@smartsalon.com/ owner123  (Royal Men\'s Grooming)');
    console.log('   Owner 8      : ravi.sharma@smartsalon.com / owner123  (Premium Look Studio)');
    console.log('   Staff        : staff@smartsalon.com       / staff123');
    console.log('   Customer 1   : rahul.sharma@gmail.com     / customer123');
    console.log('   Customer 2   : aman.yadav@gmail.com       / customer123');
    console.log('   Customer 3   : mohit.kumar@gmail.com      / customer123');
    console.log('   Customer 4   : deepak.singh@gmail.com     / customer123');
    console.log('   Customer 5   : priya.verma@gmail.com      / customer123');
    console.log('   Customer 6   : neha.kumari@gmail.com      / customer123');
    console.log('\n💈 Salons seeded:');
    console.log('   8 salons | 4 budget | 2 modern | 1 unisex | 1 premium');
    console.log('   Areas: Jant-Pali, Mahendragarh, Narnaul, Kanina, Ateli');
    console.log('\n🪑 Live Queue: Student Choice Salon');
    console.log('   Token 1: Rahul Sharma (IN_SERVICE)');
    console.log('   Token 2: Aman Yadav (WAITING)');
    console.log('   Token 3: Mohit Kumar (WAITING)');
    console.log('   Token 4: Deepak Singh (WAITING)');
    console.log('   Token 5: Sandeep Kumar (WAITING - walk-in)');
    console.log('\n════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('SEED FAILED:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
