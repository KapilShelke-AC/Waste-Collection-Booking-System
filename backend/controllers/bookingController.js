import db from "../config/db.js";


// CREATE BOOKING
export async function createBooking(req, res) {

    const {
        waste_type_id,
        area_id,
        pickup_date,
        time_slot,
        address,
        notes
    } = req.body;

    const user_id = req.user.id;

    if (
        !waste_type_id ||
        !area_id ||
        !pickup_date ||
        !time_slot ||
        !address
    ) {

        return res.status(400).json({
            success: false,
            message: "All required fields must be filled"
        });

    }

    const validSlots = [
        "9-11 AM",
        "11-1 PM",
        "2-4 PM",
        "4-6 PM"
    ];

    if (!validSlots.includes(time_slot)) {

        return res.status(400).json({
            success: false,
            message: "Invalid pickup time slot"
        });

    }

    try {

        const [result] = await db.query(
            `INSERT INTO bookings
            (
                user_id,
                waste_type_id,
                area_id,
                pickup_date,
                time_slot,
                address,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                waste_type_id,
                area_id,
                pickup_date,
                time_slot,
                address,
                notes || ""
            ]
        );

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking_id: result.insertId
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to create booking"
        });

    }

}


// GET MY BOOKINGS
export async function getMyBookings(req, res) {

    const user_id = req.user.id;

    try {

        const [rows] = await db.query(
            `SELECT
                b.*,
                w.name AS waste_name,
                w.price AS waste_price,
                a.name AS area_name

            FROM bookings b

            JOIN waste_types w
                ON b.waste_type_id = w.id

            JOIN areas a
                ON b.area_id = a.id

            WHERE b.user_id = ?

            ORDER BY b.created_at DESC`,
            [user_id]
        );

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });

    }

}


// UPDATE BOOKING
export async function updateBooking(req, res) {

    const { id } = req.params;

    const user_id = req.user.id;

    const {
        waste_type_id,
        area_id,
        pickup_date,
        time_slot,
        address,
        notes
    } = req.body;

    try {

        const [result] = await db.query(
            `UPDATE bookings

            SET
                waste_type_id = ?,
                area_id = ?,
                pickup_date = ?,
                time_slot = ?,
                address = ?,
                notes = ?

            WHERE
                id = ?
                AND user_id = ?
                AND status = 'Pending'`,
            [
                waste_type_id,
                area_id,
                pickup_date,
                time_slot,
                address,
                notes || "",
                id,
                user_id
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Pending booking not found"
            });

        }

        res.json({
            success: true,
            message: "Booking updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to update booking"
        });

    }

}


// CANCEL BOOKING
export async function cancelBooking(req, res) {

    const { id } = req.params;

    const user_id = req.user.id;

    try {

        const [result] = await db.query(
            `UPDATE bookings

            SET status = 'Cancelled'

            WHERE
                id = ?
                AND user_id = ?
                AND status = 'Pending'`,
            [id, user_id]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Booking cannot be cancelled"
            });

        }

        res.json({
            success: true,
            message: "Booking cancelled successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to cancel booking"
        });

    }

}

// ADMIN: GET ALL BOOKINGS
export async function getAllBookings(req, res) {

    try {

        const [rows] = await db.query(
            `SELECT
                b.*,
                u.name AS customer_name,
                w.name AS waste_name,
                a.name AS area_name,
                c.name AS collector_name

            FROM bookings b

            JOIN users u
                ON b.user_id = u.id

            JOIN waste_types w
                ON b.waste_type_id = w.id

            JOIN areas a
                ON b.area_id = a.id

            LEFT JOIN users c
                ON b.collector_id = c.id

            ORDER BY b.created_at DESC`
        );

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });

    }

}


// ADMIN: ASSIGN COLLECTOR
export async function assignCollector(req, res) {

    const { id } = req.params;

    const { collector_id } = req.body;

    try {

        const [collectors] = await db.query(
            `SELECT id
             FROM users
             WHERE id = ?
             AND role = 'collector'
             AND is_active = 1`,
            [collector_id]
        );

        if (collectors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Active collector not found"
            });

        }

        const [result] = await db.query(
            `UPDATE bookings

            SET
                collector_id = ?,
                status = 'Assigned'

            WHERE
                id = ?
                AND status = 'Pending'`,
            [collector_id, id]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Pending booking not found"
            });

        }

        res.json({
            success: true,
            message: "Collector assigned successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to assign collector"
        });

    }

}

// GET SINGLE BOOKING FOR EDIT

export async function getBookingForEdit(req, res) {

    const { id } = req.params;

    const user_id = req.user.id;

    try {

        const [rows] = await db.query(
            `SELECT *
             FROM bookings
             WHERE id = ?
             AND user_id = ?
             AND status = 'Pending'`,
            [id, user_id]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Pending booking not found"
            });

        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch booking"
        });

    }

}