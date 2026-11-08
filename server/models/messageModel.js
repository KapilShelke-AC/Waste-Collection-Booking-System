const pool = require("../db/pool");

exports.create = async ({ name, email, subject, message }) => {
  const [r] = await pool.query(
    "INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name, email, subject, message],
  );
  return r.insertId;
};

exports.list = async (search) => {
  let sql = "SELECT * FROM messages WHERE 1=1";
  const params = [];
  if (search) {
    sql += " AND (name LIKE ? OR email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += " ORDER BY id DESC";
  const [rows] = await pool.query(sql, params);
  return rows;
};

exports.remove = async (id) => {
  const [r] = await pool.query("DELETE FROM messages WHERE id = ?", [id]);
  return r.affectedRows;
};
  