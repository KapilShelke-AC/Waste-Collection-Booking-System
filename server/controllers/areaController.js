const pool = require("../db/pool");

// GET: All active areas for users
exports.getAreas = async (req, res) => {
  try {
    const [areas] = await pool.query(
      `SELECT id, name, description, pincode
       FROM areas
       WHERE is_active = 1
       ORDER BY name ASC`
    );

    return res.status(200).json({
      success: true,
      count: areas.length,
      areas,
    });
  } catch (error) {
    console.error("Get areas error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch areas",
    });
  }
};

// GET: All areas for admin (active + inactive)
exports.getAllAreas = async (req, res) => {
  try {
    const [areas] = await pool.query(
      `SELECT id, name, description, pincode, is_active
       FROM areas
       ORDER BY id DESC`
    );

    return res.json({
      success: true,
      data: areas,
    });
  } catch (error) {
    console.error("Get all areas error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch areas",
    });
  }
};

// POST: Create new area
exports.createArea = async (req, res) => {
  const { name, description, pincode } = req.body;

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanDescription =
    typeof description === "string" ? description.trim() : "";
  const cleanPincode =
    typeof pincode === "string" ? pincode.trim() : "";

  if (!cleanName || cleanName.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Area name is required and must be under 100 characters",
    });
  }

  if (cleanDescription.length > 255) {
    return res.status(400).json({
      success: false,
      message: "Description must be under 255 characters",
    });
  }

  if (cleanPincode && !/^\d{6}$/.test(cleanPincode)) {
    return res.status(400).json({
      success: false,
      message: "Pincode must contain exactly 6 digits",
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO areas (name, description, pincode, is_active)
       VALUES (?, ?, ?, 1)`,
      [cleanName, cleanDescription || null, cleanPincode || null]
    );

    return res.status(201).json({
      success: true,
      message: "Area added successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This area already exists",
      });
    }

    console.error("Create area error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add area",
    });
  }
};

// PUT: Update area details
exports.updateArea = async (req, res) => {
  const id = Number(req.params.id);
  const { name, description, pincode } = req.body;

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanDescription =
    typeof description === "string" ? description.trim() : "";
  const cleanPincode =
    typeof pincode === "string" ? pincode.trim() : "";

  if (!Number.isInteger(id) || id <= 0 || !cleanName || cleanName.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Valid area ID and name are required",
    });
  }

  if (cleanDescription.length > 255) {
    return res.status(400).json({
      success: false,
      message: "Description must be under 255 characters",
    });
  }

  if (cleanPincode && !/^\d{6}$/.test(cleanPincode)) {
    return res.status(400).json({
      success: false,
      message: "Pincode must contain exactly 6 digits",
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE areas
       SET name = ?, description = ?, pincode = ?
       WHERE id = ?`,
      [cleanName, cleanDescription || null, cleanPincode || null, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Area not found",
      });
    }

    return res.json({
      success: true,
      message: "Area updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An area with this name already exists",
      });
    }

    console.error("Update area error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update area",
    });
  }
};

// PATCH: Activate or deactivate an area (safe for existing bookings)
exports.updateAreaStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { is_active } = req.body;

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof is_active !== "boolean"
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid area ID and active status are required",
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE areas SET is_active = ? WHERE id = ?",
      [is_active ? 1 : 0, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Area not found",
      });
    }

    return res.json({
      success: true,
      message: is_active
        ? "Area activated successfully"
        : "Area deactivated successfully",
    });
  } catch (error) {
    console.error("Update area status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update area status",
    });
  }
};