import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/FormInput";
import { emailOk } from "../../utils/validators";

const empty = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  role: "user",
  is_active: true,
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/users", {
        params: { search, role: roleFilter },
      });
      setUsers(res.data.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not load users",
      });
    }
  };

  useEffect(() => {
    load();
  }, [roleFilter]); // reload when the role filter changes

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2 || form.name.trim().length > 50)
      e.name = "Name must be 2 to 50 characters";
    if (!editId) {
      if (!emailOk(form.email.trim())) e.email = "Enter a valid email";
      if (form.password.length < 6)
        e.password = "Password must be at least 6 characters";
      else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
        e.password = "Needs a letter and a number";
    }
    if (!/^\d{10}$/.test(form.phone))
      e.phone = "Phone must be exactly 10 digits";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  };

  const clearForm = () => {
    setForm(empty);
    setEditId(null);
    setErrors({});
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMsg({ type: "", text: "" });
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      if (editId) {
        await api.put(`/users/${editId}`, {
          name: form.name.trim(),
          phone: form.phone,
          address: form.address.trim(),
          role: form.role,
          is_active: form.is_active,
        });
        setMsg({ type: "ok", text: "User updated" });
      } else {
        await api.post("/users", {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone,
          address: form.address.trim(),
          password: form.password,
          role: form.role,
        });
        setMsg({ type: "ok", text: "User created" });
      }
      clearForm();
      load();
    } catch (err) {
      const fe = {};
      err.response?.data?.errors?.forEach((x) => {
        fe[x.field] = x.message;
      });
      if (Object.keys(fe).length) setErrors(fe);
      else
        setMsg({
          type: "error",
          text: err.response?.data?.message || "Cannot reach the server",
        });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u) => {
    setEditId(u.id);
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address || "",
      password: "",
      role: u.role,
      is_active: !!u.is_active,
    });
    setErrors({});
    setMsg({ type: "", text: "" });
  };

  const handleDelete = async (u) => {
    if (
      !window.confirm(`Delete ${u.name}? Their bookings will also be deleted.`)
    )
      return;
    try {
      await api.delete(`/users/${u.id}`);
      setMsg({ type: "ok", text: "User deleted" });
      if (editId === u.id) clearForm();
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Delete failed",
      });
    }
  };

  const btn = "rounded-full px-3 py-1 text-xs font-semibold";
  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <h1 className="mb-3 text-2xl font-bold text-brand-700">Manage users</h1>
      {msg.text && (
        <p
          className={`mb-3 rounded p-2 text-sm ${msg.type === "ok" ? "bg-brand-100 text-brand-900" : "bg-red-100 text-red-700"}`}
        >
          {msg.text}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        {/* left: list */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Search name or email"
              className="rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
            <button onClick={load} className={`${btn} bg-brand-700 text-white`}>
              Search
            </button>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="collector">Collector</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-100 text-brand-900">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">{u.is_active ? "Yes" : "No"}</td>
                    <td className="space-x-1 p-2">
                      <button
                        onClick={() => startEdit(u)}
                        className={`${btn} btn-edit`}
                      >
                        Edit
                      </button>
                      {u.id !== me.id && (
                        <button
                          onClick={() => handleDelete(u)}
                          className={`${btn} btn-delete`}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* right: add / edit form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full rounded-xl border border-brand-100 bg-white p-5 shadow-md"
        >
          <h2 className="mb-3 font-semibold text-brand-700">
            {editId ? "Edit user" : "Add user"}
          </h2>
          <FormInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          {!editId && (
            <FormInput
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
          )}
          <FormInput
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <FormInput
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            error={errors.address}
          />
          {!editId && (
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
          )}

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="user">User</option>
            <option value="collector">Collector</option>
            <option value="admin">Admin</option>
          </select>

          <label className="mb-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />{" "}
            Active
          </label>

          <button
            disabled={loading}
            className="w-full rounded-full bg-brand-700 py-2 font-semibold text-white hover:bg-brand-900 disabled:opacity-60"
          >
            {loading ? "Saving..." : editId ? "Update user" : "Create user"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={clearForm}
              className="mt-2 w-full rounded-full border border-brand-700 py-2 text-sm text-brand-700"
            >
              Cancel edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
