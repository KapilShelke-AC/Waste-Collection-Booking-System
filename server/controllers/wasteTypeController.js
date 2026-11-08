const pool = require("../db/pool");

// GET: All active waste types
exports.getWasteTypes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, description, price
       FROM waste_types
       WHERE is_active = 1
       ORDER BY name ASC`
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get waste types error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch waste types",
    });
  }
};

// GET: All waste types for admin
exports.getAllWasteTypes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, description, price, is_active
       FROM waste_types
       ORDER BY id DESC`
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get all waste types error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch waste types",
    });
  }
};

// POST: Create waste type
exports.createWasteType = async (req, res) => {
  const { name, description, price } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Name and valid non-negative price are required",
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO waste_types (name, description, price)
       VALUES (?, ?, ?)`,
      [name.trim(), description || "", Number(price)]
    );

    return res.status(201).json({
      success: true,
      message: "Waste type created successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Waste type already exists",
      });
    }

    console.error("Create waste type error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create waste type",
    });
  }
};

// PUT: Update waste type
exports.updateWasteType = async (req, res) => {
  const { name, description, price, is_active } = req.body;
  const id = Number(req.params.id);

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof name !== "string" ||
    !name.trim() ||
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0 ||
    typeof is_active !== "boolean" &&
      ![0, 1, "0", "1"].includes(is_active)
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid ID, name, price and active status are required",
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE waste_types
       SET name = ?, description = ?, price = ?, is_active = ?
       WHERE id = ?`,
      [
        name.trim(),
        description || "",
        Number(price),
        is_active === true || is_active === 1 || is_active === "1" ? 1 : 0,
        id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Waste type not found",
      });
    }

    return res.json({
      success: true,
      message: "Waste type updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Waste type name already exists",
      });
    }

    console.error("Update waste type error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update waste type",
    });
  }
};

// DELETE: Delete waste type
exports.deleteWasteType = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid waste type ID",
    });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM waste_types WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Waste type not found",
      });
    }

    return res.json({
      success: true,
      message: "Waste type deleted successfully",
    });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message: "This waste type is used by existing bookings and cannot be deleted",
      });
    }

    console.error("Delete waste type error:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot delete this waste type",
    });
  }
};