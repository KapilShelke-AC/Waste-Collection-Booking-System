const pool = require("../db/pool");

exports.findByEmail = async (email) => {
  const [rows] = await pool.query(
    "select *,password_hash as passwordHash from users where email=?",
    [email],
  );
  return rows[0];
};

exports.findById = async (id) => {
  const [rows] = await pool.query(
    "select id,name,email,phone,address,role,is_active,created_at from users where id=?",
    [id],
  );
  return rows[0];
};

exports.findWithPasswordById = async (id) => {
  const [rows] = await pool.query("select * from users where id=?", [id]);
  return rows[0];
};

exports.updateProfile = async (id, { name, phone, address }) => {
  await pool.query("update users set name=?,phone=?,address=? where id=?", [
    name,
    phone,
    address,
    id,
  ]);
};

exports.updatePassword = async (id, passwordHash) => {
  await pool.query("update users set password_hash=? where id=?", [
    passwordHash,
    id,
  ]);
};

exports.list = async ({ role, search }) => {
  let sql =
    "select id,name,email,phone,address,role,is_active,created_at from users where 1=1";
  const params = [];
  if (role) {
    sql += " and role=?";
    params.push(role);
  }
  if (search) {
    sql += " and (name like ? or email like ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += " order by created_at desc";
  const [rows] = await pool.query(sql, params);
  return rows;
};

exports.adminUpdate = async (id, { name, phone, address, role, is_active }) => {
  await pool.query(
    "update users set name=?,phone=?,address=?,role=?,is_active=? where id=?",
    [name, phone, address, role, is_active, id],
  );
};

exports.remove = async (id) => {
  await pool.query("delete from users where id=?", [id]);
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
