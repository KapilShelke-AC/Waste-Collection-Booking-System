import express from "express";

import {
    createBooking,
    getMyBookings,
    getBookingForEdit,
    updateBooking,
    cancelBooking,
    getAllBookings,
    assignCollector
} from "../controllers/bookingController.js";

import {
    protect,
    authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();


// USER ROUTES

router.post(
    "/",
    protect,
    authorize("user"),
    createBooking
);

router.get(
    "/my",
    protect,
    authorize("user"),
    getMyBookings
);

router.get(
    "/:id/edit",
    protect,
    authorize("user"),
    getBookingForEdit
);

router.put(
    "/:id",
    protect,
    authorize("user"),
    updateBooking
);

router.patch(
    "/:id/cancel",
    protect,
    authorize("user"),
    cancelBooking
);


// ADMIN ROUTES

router.get(
    "/",
    protect,
    authorize("admin"),
    getAllBookings
);

router.patch(
    "/:id/assign",
    protect,
    authorize("admin"),
    assignCollector
);

export default router;