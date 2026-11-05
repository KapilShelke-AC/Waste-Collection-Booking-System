const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");
const c = require("../controllers/userController");

const nameRule = body("name")
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage("Name must be 2 to 50 characters");
const phoneRule = body("phone")
  .matches(/^\d{10}$/)
  .withMessage("Phone must be exactly 10 digits");
const addressRule = body("address")
  .trim()
  .notEmpty()
  .withMessage("Address is required");
const roleRule = body("role")
  .isIn(["user", "collector", "admin"])
  .withMessage("Role must be user, collector or admin");
const passRules = (field, required) => {
  const r = body(field);
  return (required ? r : r.optional({ values: "falsy" }))
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Za-z]/)
    .withMessage("Password needs at least one letter")
    .matches(/\d/)
    .withMessage("Password needs at least one number");
};

const profileRules = [
  nameRule,
  phoneRule,
  addressRule,
  passRules("newPassword", false),
  body("currentPassword")
    .if(body("newPassword").notEmpty())
    .notEmpty()
    .withMessage("Enter your current password"),
];
const createRules = [
  nameRule,
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Enter a valid email"),
  phoneRule,
  addressRule,
  passRules("password", true),
  roleRule,
];
const updateRules = [
  nameRule,
  phoneRule,
  addressRule,
  roleRule,
  body("is_active").isBoolean().withMessage("is_active must be true or false"),
];

router.use(protect);

router.put("/profile", profileRules, validate, c.updateProfile);

router.use(authorize("admin"));
router.get("/", c.list);
router.post("/", createRules, validate, c.create);
router.put("/:id", updateRules, validate, c.update);
router.delete("/:id", c.remove);

module.exports = router;
