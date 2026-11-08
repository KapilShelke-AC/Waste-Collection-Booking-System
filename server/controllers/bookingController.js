const pool = require("../db/pool");

const VALID_SLOTS = ["9-11 AM", "11-1 PM", "2-4 PM", "4-6 PM"];
const STATUSES = ["Pending", "Assigned", "Completed", "Cancelled"];

// Today's date on the server (local time), as YYYY-MM-DD
const todayLocal = () => new Date().toLocaleDateString("en-CA");

// DATE_FORMAT returns pickup_date as plain text (no timezone shift in JSON)
const COLS = `b.id, b.user_id, b.waste_type_id, b.area_id, b.collector_id,
  DATE_FORMAT(b.pickup_date, '%Y-%m-%d') AS pickup_date,
  b.time_slot, b.address, b.notes, b.status, b.created_at, b.completed_at`;

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value >= todayLocal();
};

const validBooking = ({
  waste_type_id,
  area_id,
  pickup_date,
  time_slot,
  address,
}) =>
  Number.isInteger(Number(waste_type_id)) &&
  Number(waste_type_id) > 0 &&
  Number.isInteger(Number(area_id)) &&
  Number(area_id) > 0 &&
  validDate(pickup_date) &&
  VALID_SLOTS.includes(time_slot) &&
  typeof address === "string" &&
  address.trim().length >= 10 &&
  address.trim().length <= 255;

// returns an error message, or null when waste type and area are valid and active
async function checkRefs(wasteTypeId, areaId) {
  const [w] = await pool.query(
    "SELECT id FROM waste_types WHERE id = ? AND is_active = 1",
    [Number(wasteTypeId)]
  );
  if (!w.length) return "Selected waste type is not available";

  const [a] = await pool.query(
    "SELECT id FROM areas WHERE id = ? AND is_active = 1",
    [Number(areaId)]
  );
  if (!a.length) return "Selected area is not available";

  return null;
}

const BAD_BOOKING =
  "Please provide valid booking details (address of at least 10 characters and a pickup date that is not in the past)";

// ---------------- USER ----------------
exports.createBooking = async (req, res) => {
  const { waste_type_id, area_id, pickup_date, time_slot, address, notes } = req.body;

  if (!validBooking(req.body)) {
    return res.status(400).json({ success: false, message: BAD_BOOKING });
  }

  try {
    const refError = await checkRefs(waste_type_id, area_id);
    if (refError) {
      return res.status(400).json({ success: false, message: refError });
    }

    const [result] = await pool.query(
      `INSERT INTO bookings
       (user_id, waste_type_id, area_id, pickup_date, time_slot, address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        Number(waste_type_id),
        Number(area_id),
        pickup_date,
        time_slot,
        address.trim(),
        notes ? String(notes).trim().slice(0, 200) : null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking_id: result.insertId,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({ success: false, message: "Failed to create booking" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${COLS},
              w.name AS waste_name,
              w.price AS waste_price,
              a.name AS area_name,
              c.name AS collector_name
       FROM bookings b
       JOIN waste_types w ON b.waste_type_id = w.id
       JOIN areas a ON b.area_id = a.id
       LEFT JOIN users c ON b.collector_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC, b.id DESC`,
      [req.user.id]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get my bookings error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

exports.getBookingForEdit = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${COLS}
       FROM bookings b
       WHERE b.id = ? AND b.user_id = ? AND b.status = 'Pending'`,
      [req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Pending booking not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Get booking for edit error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch booking" });
  }
};

exports.updateBooking = async (req, res) => {
  if (!validBooking(req.body)) {
    return res.status(400).json({ success: false, message: BAD_BOOKING });
  }

  const { waste_type_id, area_id, pickup_date, time_slot, address, notes } = req.body;

  try {
    const refError = await checkRefs(waste_type_id, area_id);
    if (refError) {
      return res.status(400).json({ success: false, message: refError });
    }

    const [result] = await pool.query(
      `UPDATE bookings
       SET waste_type_id = ?, area_id = ?, pickup_date = ?,
           time_slot = ?, address = ?, notes = ?
       WHERE id = ? AND user_id = ? AND status = 'Pending'`,
      [
        Number(waste_type_id),
        Number(area_id),
        pickup_date,
        time_slot,
        address.trim(),
        notes ? String(notes).trim().slice(0, 200) : null,
        req.params.id,
        req.user.id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Pending booking not found" });
    }

    return res.json({ success: true, message: "Booking updated successfully" });
  } catch (error) {
    console.error("Update booking error:", error);
    return res.status(500).json({ success: false, message: "Failed to update booking" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE bookings
       SET status = 'Cancelled'
       WHERE id = ? AND user_id = ? AND status = 'Pending'`,
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Booking cannot be cancelled" });
    }

    return res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel booking" });
  }
};

// ---------------- ADMIN ----------------
// optional filters: ?status=Pending  &search=riya (customer, area or waste type)
exports.getAllBookings = async (req, res) => {
  const { status, search } = req.query;

  let sql = `SELECT ${COLS},
                    u.name AS customer_name,
                    w.name AS waste_name,
                    a.name AS area_name,
                    c.name AS collector_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN waste_types w ON b.waste_type_id = w.id
             JOIN areas a ON b.area_id = a.id
             LEFT JOIN users c ON b.collector_id = c.id
             WHERE 1=1`;
  const params = [];

  if (status) {
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status filter" });
    }
    sql += " AND b.status = ?";
    params.push(status);
  }

  if (search) {
    sql += " AND (u.name LIKE ? OR a.name LIKE ? OR w.name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY b.created_at DESC, b.id DESC";

  try {
    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

exports.assignCollector = async (req, res) => {
  const collectorId = Number(req.body.collector_id);
  const bookingId = Number(req.params.id);

  if (!Number.isInteger(collectorId) || collectorId <= 0) {
    return res.status(400).json({ success: false, message: "Valid collector ID is required" });
  }

  try {
    const [collectors] = await pool.query(
      `SELECT id FROM users
       WHERE id = ? AND role = 'collector' AND is_active = 1`,
      [collectorId]
    );

    if (!collectors.length) {
      return res.status(404).json({ success: false, message: "Active collector not found" });
    }

    const [result] = await pool.query(
      `UPDATE bookings
       SET collector_id = ?, status = 'Assigned'
       WHERE id = ? AND status = 'Pending'`,
      [collectorId, bookingId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Pending booking not found" });
    }

    return res.json({ success: true, message: "Collector assigned successfully" });
  } catch (error) {
    console.error("Assign collector error:", error);
    return res.status(500).json({ success: false, message: "Failed to assign collector" });
  }
};

exports.deleteBooking = async (req, res) => {
  const bookingId = Number(req.params.id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid booking ID" });
  }

  try {
    const [result] = await pool.query("DELETE FROM bookings WHERE id = ?", [bookingId]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete booking" });
  }
};
