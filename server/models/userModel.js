const pool = require("../db/pool");

exports.findByEmail = async (email) => {
  const [rows] = await pool.query("select *,password_hash as passwordHash from users where email=?", [email]);
  return rows[0];
};

exports.findById = async (id) => {
  const [rows] = await pool.query(
    "select id,name,email,phone,address,role,is_active,created_at from users where id=?",
    [id],
  );
  return rows[0];
};

exports.create = async ({
  name,
  email,
  passwordHash,
  phone,
  address,
  role = "user",
}) => {
  const [result] = await pool.query(
    "insert into users(name,email,password_hash,phone,address,role) values (?,?,?,?,?,?)",
    [name, email, passwordHash, phone, address, role],
  );
  return result.insertId;
};
