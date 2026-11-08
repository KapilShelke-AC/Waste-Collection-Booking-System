const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingForEdit,
  updateBooking,
  cancelBooking,
  getAllBookings,
  assignCollector,
  deleteBooking,
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

// User booking routes
router.post("/", protect, authorize("user"), createBooking);
router.get("/my", protect, authorize("user"), getMyBookings);
router.get("/:id/edit", protect, authorize("user"), getBookingForEdit);
router.put("/:id", protect, authorize("user"), updateBooking);
router.patch("/:id/cancel", protect, authorize("user"), cancelBooking);

// Admin booking routes
router.get("/", protect, authorize("admin"), getAllBookings);
router.patch("/:id/assign", protect, authorize("admin"), assignCollector);
router.delete("/:id", protect, authorize("admin"), deleteBooking);

module.exports = router;
