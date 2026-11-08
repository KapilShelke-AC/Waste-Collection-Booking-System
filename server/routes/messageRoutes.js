const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");
const c = require("../controllers/messageController");

const rules = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2 to 100 characters"),
  body("email").trim().isEmail().withMessage("Enter a valid email"),
  body("subject")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Subject must be 3 to 150 characters"),
  body("message")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Message must be 10 to 1000 characters"),
];

router.post("/", rules, validate, c.save);
router.get("/", protect, authorize("admin"), c.list);
router.delete("/:id", protect, authorize("admin"), c.remove);

module.exports = router;
