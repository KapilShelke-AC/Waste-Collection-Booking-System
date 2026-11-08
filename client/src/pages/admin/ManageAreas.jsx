import { useEffect, useState } from "react";
import api from "../../api/axios";
import FormInput from "../../components/FormInput";

const empty = { name: "", pincode: "" };

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2 || f.name.trim().length > 60) {
    e.name = "Name must be 2 to 60 characters";
  }
  if (!/^\d{6}$/.test(f.pincode))
    e.pincode = "Pincode must be exactly 6 digits";
  return e;
}

export default function ManageAreas() {
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/areas/admin");
      setAreas(res.data.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not load areas",
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
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

    const payload = { name: form.name.trim(), pincode: form.pincode };

    setLoading(true);
    try {
      if (editId) await api.put(`/areas/${editId}`, payload);
      else await api.post("/areas", payload);
      setMsg({ type: "ok", text: editId ? "Area updated" : "Area added" });
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

  const startEdit = (a) => {
    setEditId(a.id);
    setForm({ name: a.name, pincode: a.pincode || "" });
    setErrors({});
    setMsg({ type: "", text: "" });
  };

  const toggle = async (a) => {
    try {
      await api.patch(`/areas/${a.id}/status`, { is_active: !a.is_active });
      setMsg({
        type: "ok",
        text: a.is_active ? "Area deactivated" : "Area activated",
      });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not change status",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-1 text-3xl font-bold text-brand-900">Manage areas</h1>
      <p className="mb-4 text-sm text-gray-600">
        Areas are the zones where pickups are available. Inactive areas are
        hidden from the booking form.
      </p>

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
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="border-b bg-cream text-gray-600">
              <tr>
                <th className="p-3">Area</th>
                <th className="p-3">Pincode</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3">{a.pincode}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {a.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => startEdit(a)} className="btn-edit">
                      Edit
                    </button>
                    <button
                      onClick={() => toggle(a)}
                      className="btn-deactivate"
                    >
                      {a.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {areas.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No areas found.
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
            {editId ? "Edit area" : "Add area"}
          </h2>
          <FormInput
            label="Area name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Zone 6 North"
          />
          <FormInput
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            error={errors.pincode}
            placeholder="422001"
          />
          <button
            disabled={loading}
            className="w-full rounded-full bg-brand-700 py-2 font-semibold text-white hover:bg-brand-900 disabled:opacity-60"
          >
            {loading ? "Saving..." : editId ? "Update area" : "Add area"}
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
