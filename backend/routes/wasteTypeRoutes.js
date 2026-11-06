import express from "express";

import {
    getWasteTypes,
    getAllWasteTypes,
    createWasteType,
    updateWasteType,
    deleteWasteType
} from "../controllers/wasteTypeController.js";

import {
    protect,
    authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();


// Public: Get active waste types
router.get("/", getWasteTypes);


// Admin: Get all waste types
router.get(
    "/admin",
    protect,
    authorize("admin"),
    getAllWasteTypes
);


// Admin: Add waste type
router.post(
    "/",
    protect,
    authorize("admin"),
    createWasteType
);


// Admin: Update waste type
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateWasteType
);


// Admin: Delete waste type
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteWasteType
);

export default router;