const pool = require("../db/pool");

exports.tasksFor = async (collectorId, status) => {
  let sql = `
    SELECT b.id, DATE_FORMAT(b.pickup_date, '%Y-%m-%d') AS pickup_date, b.time_slot,
           b.address, b.notes, b.status,
           DATE_FORMAT(b.completed_at, '%Y-%m-%d %H:%i') AS completed_at,
           w.name AS waste_type, a.name AS area,
           u.name AS customer, u.phone AS customer_phone
    FROM bookings b
    JOIN waste_types w ON w.id = b.waste_type_id
    JOIN areas a       ON a.id = b.area_id
    JOIN users u       ON u.id = b.user_id
    WHERE b.collector_id = ?`;
  const params = [collectorId];
  if (status) {
    sql += " AND b.status = ?";
    params.push(status);
  }
  sql += " ORDER BY b.pickup_date, b.id";
  const [rows] = await pool.query(sql, params);
  return rows;
};

exports.findTask = async (id, collectorId) => {
  const [rows] = await pool.query(
    "SELECT id, status FROM bookings WHERE id = ? AND collector_id = ?",
    [id, collectorId],
  );
  return rows[0];
};

exports.complete = async (id) => {
  await pool.query(
    "UPDATE bookings SET status = 'Completed', completed_at = NOW() WHERE id = ?",
    [id],
  );
};
