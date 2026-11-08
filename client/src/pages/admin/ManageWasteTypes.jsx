import { useEffect, useState } from "react";
import api from "../../api/axios";
import FormInput from "../../components/FormInput";

const empty = { name: "", description: "", price: "0", is_active: true };

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Name is required";
  if (f.name.trim().length > 50) e.name = "Name can be at most 50 characters";
  if (f.description.length > 255)
    e.description = "Description can be at most 255 characters";
  if (f.price === "" || Number.isNaN(Number(f.price)) || Number(f.price) < 0) {
    e.price = "Price must be 0 or more";
  }
  return e;
}

export default function ManageWasteTypes() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/wastetypes/admin");
      setItems(res.data.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not load waste types",
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const clearForm = () => {
    setForm(empty);
    setEditId(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
    };

    setLoading(true);
    try {
      if (editId) {
        // the API needs is_active on update
        await api.put(`/wastetypes/${editId}`, {
          ...payload,
          is_active: !!form.is_active,
        });
      } else {
        await api.post("/wastetypes", payload);
      }
      setMsg({
        type: "ok",
        text: editId ? "Waste type updated" : "Waste type added",
      });
      clearForm();
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Cannot reach the server",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (w) => {
    setEditId(w.id);
    setForm({
      name: w.name,
      description: w.description || "",
      price: String(w.price),
      is_active: !!w.is_active,
    });
    setErrors({});
    setMsg({ type: "", text: "" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this waste type?")) return;
    try {
      await api.delete(`/wastetypes/${id}`);
      setMsg({ type: "ok", text: "Waste type deleted" });
      if (editId === id) clearForm();
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Delete failed",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-4 text-3xl font-bold text-brand-900">
        Manage waste types
      </h1>

      {msg.text && (
        <p
          className={`mb-3 rounded p-2 text-sm ${
            msg.type === "ok"
              ? "bg-brand-100 text-brand-900"
              : "bg-red-100 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="overflow-x-auto rounded-xl bg-white shadow md:col-span-2">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b bg-cream text-gray-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{w.name}</td>
                  <td className="p-3 text-gray-600">{w.description}</td>
                  <td className="p-3">₹{w.price}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        w.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {w.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => startEdit(w)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => remove(w.id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No waste types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="h-fit rounded-xl bg-white p-5 shadow"
        >
          <h2 className="mb-3 text-lg font-semibold text-brand-700">
            {editId ? "Edit waste type" : "Add waste type"}
          </h2>
          <FormInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <FormInput
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
          />
          <FormInput
            label="Price (₹)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            error={errors.price}
          />

          {editId && (
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Active (shown in the booking form)
            </label>
          )}

          <button
            disabled={loading}
            className="w-full rounded-full bg-brand-700 py-2 font-semibold text-white hover:bg-brand-900 disabled:opacity-60"
          >
            {loading ? "Saving..." : editId ? "Update" : "Add waste type"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={clearForm}
              className="mt-2 w-full rounded-full border py-2 text-sm"
            >
              Cancel edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
