const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const serverError = (res, error) => {
  console.log(error);
  return res.status(500).json({
    success: false,
    message: "Server error",
  });
};

// for any user
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, currentPassword, newPassword } = req.body;

    if (newPassword) {
      const full = await User.findWithPasswordById(req.user.id);
      const ok = await bcrypt.compare(
        currentPassword || "",
        full.password_hash,
      );

      if (!ok) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      }
      await User.updatePassword(
        req.user.id,
        await bcrypt.hash(newPassword, 10),
      );
    }
    await User.updateProfile(req.user.id, { name, phone, address });
    const user = await User.findByEmail(req.user.id);
    res.json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    serverError(res, error);
  }
};

//for admin only
exports.list = async (req, res) => {
  try {
    const users = await User.list({
      role: req.query.role,
      search: req.query.search,
    });
    res.json({ success: true, data: users });
  } catch (error) {
    serverError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, phone, address, password, role } = req.body;
    if (await User.findByEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const id = await User.create({
      name,
      email,
      passwordHash,
      phone,
      address,
      role,
    });
    res
      .status(201)
      .json({ success: true, message: "User created", data: { id } });
  } catch (error) {
    serverError(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await User.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const { name, phone, address, role, is_active } = req.body;
    const active = [true, 1, "true", "1"].includes(is_active) ? 1 : 0;

    if (id === req.user.id && (role !== "admin" || !active)) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin access",
      });
    }

    await User.adminUpdate(id, {
      name,
      phone,
      address,
      role,
      is_active: active,
    });
    res.json({ success: true, message: "User updated" });
  } catch (error) {
    serverError(res, error);
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }
    const existing = await User.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await User.remove(id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    serverError(res, error);
  }
};
