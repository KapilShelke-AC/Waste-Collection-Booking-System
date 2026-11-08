const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const signToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1d",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered!",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = await User.create({ name, email, passwordHash, phone, address });

    res.status(201).json({
      success: true,
      message: "Registered Successfully",
      data: { id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    const ok = user && (await bcrypt.compare(password, user.passwordHash));

    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password!" });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is deactivated" });
    }

    const { id, name, role } = user;
    res.json({
      success: true,
      message: "Login Successful",
      data: { token: signToken(user), user: { id, name, email, role } },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.me = async (req, res) => {
  res.json({ success: true, data: req.user });
};
