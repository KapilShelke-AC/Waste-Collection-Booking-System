import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const SLOTS = ["9-11 AM", "11-1 PM", "2-4 PM", "4-6 PM"];

const empty = {
  waste_type_id: "",
  area_id: "",
  pickup_date: "",
  time_slot: "",
  address: "",
  notes: "",
};

const today = () => new Date().toLocaleDateString("en-IN");

const box = (err) =>
  `w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 ${
    err ? "border-red-400" : "border-gray-300"
  }`;

function validate(f) {
  const e = {};

  if (!f.waste_type_id) e.waste_type_id = "Select a waste type";
  if (!f.area_id) e.area_id = "Select an area";
  if (!f.pickup_date) e.pickup_date = "Select a pickup date";
  else if (f.pickup_date < today())
    e.pickup_date = "Pickup date cannot be in the past";
  if (!f.time_slot) e.time_slot = "Select a time slot";
  if (f.address.trim().length < 10)
    e.address = "Address must be at least 10 characters";
  if (f.notes.length > 200) e.notes = "Notes can be at most 200 characters";
  return e;
}

function Field({ label, name, error, children }) {
  return (
    <div className="mb-3">
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function BookingForm({ initial, submitLabel, onSubmit }) {
  const [form, setForm] = useState({ ...empty, ...initial });
  const [wasteTypes, setWasteTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/wastetypes")
      .then((r) => setWasteTypes(r.data.data ?? []))
      .catch(() => setServerError("Could not load waste types"));
    api
      .get("/areas")
      .then((r) => setAreas(r.data.areas ?? r.data.data ?? []))
      .catch(() => setServerError("Could not load areas"));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      await onSubmit({
        waste_type_id: Number(form.waste_type_id),
        area_id: Number(form.area_id),
        pickup_date: form.pickup_date,
        time_slot: form.time_slot,
        address: form.address.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setServerError(err.response?.data?.message || "Cannot reach the server");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl bg-white p-6 shadow-md shadow-brand-700"
    >
      {serverError && (
        <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <div className="grid gap-x-4 md:grid-cols-2">
        <Field
          label="Waste type"
          name="waste_type_id"
          error={errors.waste_type_id}
        >
          <select
            id="waste_type_id"
            name="waste_type_id"
            value={form.waste_type_id}
            onChange={handleChange}
            className={box(errors.waste_type_id)}
          >
            <option value="">Select waste type</option>
            {wasteTypes.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} (₹{w.price})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pickup area" name="area_id" error={errors.area_id}>
          <select
            id="area_id"
            name="area_id"
            value={form.area_id}
            onChange={handleChange}
            className={box(errors.area_id)}
          >
            <option value="">Select area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.pincode ? ` (${a.pincode})` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Don’t see your area?{" "}
            <Link to="/contact" className="font-semibold text-brand-700">
              Contact us
            </Link>
          </p>
        </Field>

        <Field
          label="Pickup date"
          name="pickup_date"
          error={errors.pickup_date}
        >
          <input
            id="pickup_date"
            type="date"
            name="pickup_date"
            min={today()}
            value={form.pickup_date}
            onChange={handleChange}
            className={box(errors.pickup_date)}
          />
        </Field>

        <Field label="Pickup time" name="time_slot" error={errors.time_slot}>
          <select
            id="time_slot"
            name="time_slot"
            value={form.time_slot}
            onChange={handleChange}
            className={box(errors.time_slot)}
          >
            <option value="">Select time</option>
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Pickup address" name="address" error={errors.address}>
        <textarea
          id="address"
          name="address"
          rows="2"
          value={form.address}
          onChange={handleChange}
          placeholder="Enter your complete pickup address"
          className={box(errors.address)}
        />
      </Field>

      <Field
        label="Additional notes (optional)"
        name="notes"
        error={errors.notes}
      >
        <textarea
          id="notes"
          name="notes"
          rows="2"
          value={form.notes}
          onChange={handleChange}
          placeholder="Any instructions for the collector"
          className={box(errors.notes)}
        />
      </Field>

      <button
        disabled={loading}
        className="mt-2 w-full rounded-full bg-brand-700 py-2.5 font-semibold text-white transition hover:bg-brand-900 disabled:opacity-60"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
