'use strict';

const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }, { phone: regex }];
  }

  const sort = req.query.sort || '-createdAt';

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, users, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return ApiResponse.error(res, 'User not found.', 404);
  return ApiResponse.success(res, user);
});

const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, role, status, dateOfBirth, address } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return ApiResponse.error(res, 'Email already in use.', 409);

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: role || 'customer',
    status: status || 'active',
    dateOfBirth,
    address,
    createdBy: req.user._id,
  });

  return ApiResponse.created(res, user, 'User created successfully.');
});

const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'email', 'phone', 'role', 'status', 'dateOfBirth', 'address'];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return ApiResponse.error(res, 'User not found.', 404);
  return ApiResponse.success(res, user, 'User updated successfully.');
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'deactivated' }, { new: true });
  if (!user) return ApiResponse.error(res, 'User not found.', 404);
  return ApiResponse.success(res, user, 'User deactivated successfully.');
});

const updateUserStatus = async (req, res, status) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) return ApiResponse.error(res, 'User not found.', 404);
  return ApiResponse.success(res, user, `User ${status} successfully.`);
};

const activateUser = asyncHandler((req, res) => updateUserStatus(req, res, 'active'));
const suspendUser = asyncHandler((req, res) => updateUserStatus(req, res, 'suspended'));
const deactivateUser = asyncHandler((req, res) => updateUserStatus(req, res, 'deactivated'));

const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) return ApiResponse.error(res, 'User not found.', 404);
  return ApiResponse.success(res, user, 'User role updated successfully.');
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  suspendUser,
  deactivateUser,
  changeUserRole,
};
