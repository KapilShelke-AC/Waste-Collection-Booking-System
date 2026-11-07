import { useEffect, useState } from "react";
import api from "../../api/axios";

const initialForm = {
  name: "",
  description: "",
  pincode: "",
};

export default function ManageAreas() {
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAreas();
  }, []);

  async function loadAreas() {
    try {
      setLoading(true);
      const response = await api.get("/areas/admin");
      setAreas(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load areas");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    const name = form.name.trim();
    const pincode = form.pincode.trim();

    if (!name) {
      setError("Please enter area name");
      return;
    }

    if (pincode && !/^\d{6}$/.test(pincode)) {
      setError("Pincode must contain exactly 6 digits");
      return;
    }

    const payload = {
      name,
      description: form.description.trim(),
      pincode,
    };

    try {
      setSaving(true);

      const response = editId
        ? await api.put(`/areas/${editId}`, payload)
        : await api.post("/areas", payload);

      setMessage(response.data.message);
      setForm(initialForm);
      setEditId(null);
      await loadAreas();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save area");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(area) {
    setEditId(area.id);
    setForm({
      name: area.name || "",
      description: area.description || "",
      pincode: area.pincode || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(initialForm);
    setMessage("");
    setError("");
  }

  async function toggleAreaStatus(area) {
    const action = area.is_active ? "deactivate" : "activate";

    if (!window.confirm(`Are you sure you want to ${action} ${area.name}?`)) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await api.patch(`/areas/${area.id}/status`, {
        is_active: !Boolean(area.is_active),
      });

      setMessage(response.data.message);
      await loadAreas();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  }

  return (
    <div className="container">
      <h1>Manage Areas</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Existing areas on top */}
      <div className="table-container">
        <h2>Available Service Areas</h2>

        {loading ? (
          <p>Loading areas...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Area Name</th>
                <th>Description</th>
                <th>Pincode</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {areas.length > 0 ? (
                areas.map((area) => (
                  <tr key={area.id}>
                    <td>{area.id}</td>
                    <td>{area.name}</td>
                    <td>{area.description || "-"}</td>
                    <td>{area.pincode || "-"}</td>
                    <td>
                      {Boolean(area.is_active) ? "Active" : "Inactive"}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(area)}>
                        Edit
                      </button>

                      <button
                        onClick={() => toggleAreaStatus(area)}
                        style={{
                          marginLeft: "8px",
                          backgroundColor: area.is_active ? "#dc2626" : "#15803d",
                          color: "white",
                        }}
                      >
                        {area.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No areas found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit form below the table */}
      <div style={{ marginTop: "35px" }}>
        <h2>{editId ? "Edit Area" : "Add New Area"}</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>Area Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter area name"
            maxLength={100}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter area description"
            maxLength={255}
          />

          <label>Pincode (Optional)</label>
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            inputMode="numeric"
          />

          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editId
                ? "Update Area"
                : "Add Area"}
          </button>

          {editId && (
            <button type="button" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
}