import { useState } from "react";
import api from "../../api/axios";
import FormInput from "../../components/FormInput";
import { emailOk } from "../../utils/validators";

const empty = { name: "", email: "", subject: "", message: "" };

const info = [
  ["📧", "Email", "support@recycleconnect.com"],
  ["📞", "Phone", "+91 98765 43210"],
  ["🕘", "Hours", "Mon to Sat, 9 AM to 6 PM"],
];

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Name must be at least 2 characters";
  if (!emailOk(f.email.trim())) e.email = "Enter a valid email";
  if (f.subject.trim().length < 3)
    e.subject = "Subject must be at least 3 characters";
  if (f.message.trim().length < 10)
    e.message = "Message must be at least 10 characters";
  return e;
}

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setServerError("");
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const { data } = await api.post("/messages", form);
      setSuccess(data.message);
      setForm(empty);
    } catch (err) {
      const fe = {};
      err.response?.data?.errors?.forEach((x) => {
        fe[x.field] = x.message;
      });
      if (Object.keys(fe).length) setErrors(fe);
      else
        setServerError(
          err.response?.data?.message || "Cannot reach the server",
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-14 text-center text-white mb-15">
        <h1 className="text-4xl font-bold md:text-5xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/90">
          Questions about pickups, missed collections or your account? We are
          happy to help.
        </p>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-6 pb-12 md:grid-cols-5">
        {/* Info cards */}
        <div className="-mt-6 space-y-4 md:col-span-2">
          {info.map(([icon, t, v]) => (
            <div
              key={t}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-2xl">
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-700">{t}</p>
                <p className="text-sm text-gray-700">{v}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-cream p-5 text-sm text-gray-700">
            We usually reply within one working day.
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="-mt-6 rounded-2xl bg-white p-6 shadow-lg md:col-span-3"
        >
          <h2 className="mb-4 text-xl font-bold text-brand-900">
            Send us a message
          </h2>

          {success && (
            <p className="mb-3 rounded-lg bg-brand-100 p-3 text-sm text-brand-900">
              {success}
            </p>
          )}
          {serverError && (
            <p className="mb-3 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <div className="grid gap-x-4 md:grid-cols-2">
            <FormInput
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <FormInput
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>
          <FormInput
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            error={errors.subject}
          />

          <label className="mb-1 block text-sm font-medium">Message</label>
          <textarea
            name="message"
            rows="1"
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-600">{errors.message}</p>
          )}

          <button
            disabled={loading}
            className="mt-4 w-full rounded-full bg-brand-700 py-2.5 font-semibold text-white transition hover:bg-brand-900 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
