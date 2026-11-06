import db from "../config/db.js";

// GET: All active waste types
export async function getWasteTypes(req, res) {

    try {

        const [rows] = await db.query(
            `SELECT *
             FROM waste_types
             WHERE is_active = 1
             ORDER BY name`
        );

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch waste types"
        });

    }

}


// GET: All waste types for admin
export async function getAllWasteTypes(req, res) {

    try {

        const [rows] = await db.query(
            "SELECT * FROM waste_types ORDER BY id DESC"
        );

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch waste types"
        });

    }

}


// POST: Create waste type
export async function createWasteType(req, res) {

    const { name, description, price } = req.body;

    if (!name || price === undefined || Number(price) < 0) {

        return res.status(400).json({
            success: false,
            message: "Name and valid price are required"
        });

    }

    try {

        const [result] = await db.query(
            `INSERT INTO waste_types
            (name, description, price)
            VALUES (?, ?, ?)`,
            [
                name.trim(),
                description || "",
                Number(price)
            ]
        );

        res.status(201).json({
            success: true,
            message: "Waste type created successfully",
            id: result.insertId
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                success: false,
                message: "Waste type already exists"
            });

        }

        res.status(500).json({
            success: false,
            message: "Failed to create waste type"
        });

    }

}


// PUT: Update waste type
export async function updateWasteType(req, res) {

    const { name, description, price, is_active } = req.body;

    const { id } = req.params;

    if (!name || price === undefined || Number(price) < 0) {

        return res.status(400).json({
            success: false,
            message: "Name and valid price are required"
        });

    }

    try {

        const [result] = await db.query(
            `UPDATE waste_types
             SET name = ?,
                 description = ?,
                 price = ?,
                 is_active = ?
             WHERE id = ?`,
            [
                name.trim(),
                description || "",
                Number(price),
                is_active ? 1 : 0,
                id
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Waste type not found"
            });

        }

        res.json({
            success: true,
            message: "Waste type updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to update waste type"
        });

    }

}


// DELETE: Delete waste type
export async function deleteWasteType(req, res) {

    const { id } = req.params;

    try {

        const [result] = await db.query(
            "DELETE FROM waste_types WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Waste type not found"
            });

        }

        res.json({
            success: true,
            message: "Waste type deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Cannot delete this waste type"
        });

    }

}