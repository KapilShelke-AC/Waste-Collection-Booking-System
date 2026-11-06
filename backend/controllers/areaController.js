import db from "../config/db.js";

// Get all active areas
export const getAreas = async (req, res) => {
    try {
        const [areas] = await db.query(
            `SELECT id, name, description
             FROM areas
             WHERE is_active = 1
             ORDER BY name ASC`
        );

        res.status(200).json({
            success: true,
            count: areas.length,
            areas
        });

    } catch (error) {
        console.error("Get Areas Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch areas"
        });
    }
};