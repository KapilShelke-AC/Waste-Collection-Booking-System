const pool = require("../db/pool");

// Works with the shared schema.sql: areas(id, name, pincode, is_active)

const clean = (body) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  pincode: typeof body.pincode === "string" ? body.pincode.trim() : "",
});

// returns an error message, or null when the input is fine
const check = ({ name, pincode }) => {
  if (name.length < 2 || name.length > 60) {
    return "Area name must be 2 to 60 characters";
  }
  if (!/^\d{6}$/.test(pincode)) {
    return "Pincode must contain exactly 6 digits";
  }
  return null;
};

// GET: active areas (booking form dropdown)
exports.getAreas = async (req, res) => {
  try {
    const [areas] = await pool.query(
      `SELECT id, name, pincode
       FROM areas
       WHERE is_active = 1
       ORDER BY name ASC`
    );

    return res.status(200).json({
      success: true,
      count: areas.length,
      areas,
      data: areas,
    });
  } catch (error) {
    console.error("Get areas error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch areas" });
  }
};

// GET: all areas for admin (active and inactive)
exports.getAllAreas = async (req, res) => {
  try {
    const [areas] = await pool.query(
      `SELECT id, name, pincode, is_active
       FROM areas
       ORDER BY id DESC`
    );

    return res.json({ success: true, data: areas });
  } catch (error) {
    console.error("Get all areas error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch areas" });
  }
};

// POST: create area
exports.createArea = async (req, res) => {
  const data = clean(req.body);
  const problem = check(data);
  if (problem) return res.status(400).json({ success: false, message: problem });

  try {
    const [result] = await pool.query(
      "INSERT INTO areas (name, pincode, is_active) VALUES (?, ?, 1)",
      [data.name, data.pincode]
    );

    return res.status(201).json({
      success: true,
      message: "Area added successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "This area already exists" });
    }
    console.error("Create area error:", error);
    return res.status(500).json({ success: false, message: "Failed to add area" });
  }
};

// PUT: update area details
exports.updateArea = async (req, res) => {
  const id = Number(req.params.id);
  const data = clean(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid area ID" });
  }
  const problem = check(data);
  if (problem) return res.status(400).json({ success: false, message: problem });

  try {
    const [result] = await pool.query(
      "UPDATE areas SET name = ?, pincode = ? WHERE id = ?",
      [data.name, data.pincode, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Area not found" });
    }

    return res.json({ success: true, message: "Area updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "An area with this name already exists" });
    }
    console.error("Update area error:", error);
    return res.status(500).json({ success: false, message: "Failed to update area" });
  }
};

// PATCH: activate or deactivate (safe for existing bookings)
exports.updateAreaStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { is_active } = req.body;

  if (!Number.isInteger(id) || id <= 0 || typeof is_active !== "boolean") {
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
      return res.status(404).json({ success: false, message: "Area not found" });
    }

    return res.json({
      success: true,
      message: is_active ? "Area activated successfully" : "Area deactivated successfully",
    });
  } catch (error) {
    console.error("Update area status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update area status" });
  }
};
