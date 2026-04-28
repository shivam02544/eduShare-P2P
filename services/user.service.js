import User from "@/models/User";

export class UserError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function searchUsers(q, role, page, limit = 20) {
  const query = {};
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }
  if (role) query.role = role;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Mark Super Admins from ENV
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
  
  const result = users.map(u => {
    const obj = u.toObject();
    obj.isSuperAdmin = adminEmails.includes(obj.email.toLowerCase());
    return obj;
  });

  return {
    users: result,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function updateUser(adminId, targetUserId, updates) {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new UserError("User not found", 404);
  }

  // Prevent modification of Super Admins (from ENV)
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
  if (adminEmails.includes(targetUser.email.toLowerCase())) {
    throw new UserError("Cannot modify a Super Admin defined in system environment", 403);
  }

  // Prevent self-modification of important fields
  if (targetUserId === adminId.toString()) {
    throw new UserError("Cannot modify your own administrative status", 400);
  }

  const { role, isSuspended, suspensionReason } = updates;

  const update = {};
  if (role) update.role = role;
  if (typeof isSuspended === "boolean") {
    update.isSuspended = isSuspended;
    update.suspensionReason = isSuspended ? (suspensionReason || "Violated community guidelines") : "";
  }

  const updatedUser = await User.findByIdAndUpdate(targetUserId, update, { new: true });

  return { message: "User updated successfully", user: updatedUser };
}
