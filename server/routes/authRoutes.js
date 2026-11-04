const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const registerRules = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2 to 50 characters"),

  body("email")
    .trim()
    .isLowercase()
    .isEmail()
    .withMessage("Enter a valid email"),

  body("phone")
    .matches(/^\d{10}$/)
    .withMessage("Phone must be exactly 10 digits"),

  body("address").trim().notEmpty().withMessage("Address is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Za-z]/)
    .withMessage("Password needs at least one letter")
    .matches(/\d/)
    .withMessage("Password needs at least one number"),
];

const loginRules = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Enter a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", protect, me);

module.exports = router;
