'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Role = require('./models/Role');
const LotteryEvent = require('./models/LotteryEvent');

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    // Seed Roles
    const defaultRoles = [
      { name: 'superAdmin', description: 'Full platform control', permissions: ['*'], isDefault: true },
      { name: 'lotteryAdmin', description: 'Manage events, draws, results', permissions: ['events:*', 'draws:*', 'results:*', 'tickets:read'], isDefault: true },
      { name: 'cashManager', description: 'Manage financial transactions and prize claims', permissions: ['transactions:*', 'claims:*', 'reports:read'], isDefault: true },
      { name: 'ticketAgent', description: 'Register and verify tickets', permissions: ['tickets:create', 'tickets:verify', 'tickets:read'], isDefault: true },
      { name: 'customer', description: 'Browse events, buy tickets, submit claims', permissions: ['events:read', 'tickets:own', 'claims:own'], isDefault: true },
    ];

    for (const r of defaultRoles) {
      await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    }
    console.log('Roles seeded.');

    // Seed Default Users
    const users = [
      { firstName: 'Super', lastName: 'Admin', email: 'admin@olms.com', phone: '+251911000001', password: 'Admin@123456', role: 'superAdmin', status: 'active' },
      { firstName: 'Lottery', lastName: 'Admin', email: 'lottoadmin@olms.com', phone: '+251911000002', password: 'Admin@123456', role: 'lotteryAdmin', status: 'active' },
      { firstName: 'Cash', lastName: 'Manager', email: 'finance@olms.com', phone: '+251911000003', password: 'Admin@123456', role: 'cashManager', status: 'active' },
      { firstName: 'Ticket', lastName: 'Agent', email: 'agent@olms.com', phone: '+251911000004', password: 'Admin@123456', role: 'ticketAgent', status: 'active' },
      { firstName: 'Abebe', lastName: 'Bikila', email: 'customer@olms.com', phone: '+251911000005', password: 'Admin@123456', role: 'customer', status: 'active' },
    ];

    let adminUser;
    for (const u of users) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
      }
      if (u.role === 'superAdmin') adminUser = existing;
    }
    console.log('Default users seeded.');

    // Seed Sample Lottery Events
    const now = new Date();
    const inDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const sampleEvents = [
      {
        eventId: 'EVT-ETH-2026-01',
        name: 'Ethiopian New Year Grand Jackpot',
        description: 'Annual nationwide digital lottery event with massive cash prizes.',
        ticketPrice: 50,
        currency: 'ETB',
        startDate: now,
        closingDate: inDays(14),
        drawDate: inDays(15),
        status: 'Open',
        totalTickets: 10000,
        soldTickets: 0,
        remainingTickets: 10000,
        minimumAge: 18,
        participationRules: 'Must be 18+ and a registered resident.',
        prizeStructure: [
          { rank: 1, description: 'Grand Jackpot', amount: 1000000, currency: 'ETB' },
          { rank: 2, description: 'Second Prize', amount: 250000, currency: 'ETB' },
          { rank: 3, description: 'Third Prize', amount: 50000, currency: 'ETB' },
        ],
        createdBy: adminUser?._id,
        approvedBy: adminUser?._id,
      },
      {
        eventId: 'EVT-ETH-2026-02',
        name: 'Weekly Addis Fortune Draw',
        description: 'Weekly digital draw with instant Telebirr and CBE Birr payouts.',
        ticketPrice: 25,
        currency: 'ETB',
        startDate: now,
        closingDate: inDays(6),
        drawDate: inDays(7),
        status: 'Open',
        totalTickets: 5000,
        soldTickets: 0,
        remainingTickets: 5000,
        minimumAge: 18,
        participationRules: 'Valid Ethiopian phone number required.',
        prizeStructure: [
          { rank: 1, description: 'First Prize', amount: 200000, currency: 'ETB' },
          { rank: 2, description: 'Second Prize', amount: 50000, currency: 'ETB' },
        ],
        createdBy: adminUser?._id,
        approvedBy: adminUser?._id,
      },
    ];

    for (const evt of sampleEvents) {
      await LotteryEvent.findOneAndUpdate({ eventId: evt.eventId }, evt, { upsert: true, new: true });
    }
    console.log('Sample lottery events seeded.');

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
