import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/FormInput";

const blank = {
  name: "",
  phone: "",
  address: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      const u = res.data.data;
      setInfo(u);
      setForm({
        ...blank,
        name: u.name,
        phone: u.phone,
        address: u.address || "",
      });
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2 || form.name.trim().length > 50)
      e.name = "Name must be 2 to 50 characters";
    if (!/^\d{10}$/.test(form.phone))
      e.phone = "Phone must be exactly 10 digits";
    if (!form.address.trim()) e.address = "Address is required";
    if (form.newPassword) {
      if (!form.currentPassword)
        e.currentPassword = "Enter your current password";
      if (form.newPassword.length < 6)
        e.newPassword = "Password must be at least 6 characters";
      else if (
        !/[A-Za-z]/.test(form.newPassword) ||
        !/\d/.test(form.newPassword)
      )
        e.newPassword = "Needs a letter and a number";
      if (form.confirmPassword !== form.newPassword)
        e.confirmPassword = "Passwords do not match";
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMsg({ type: "", text: "" });
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    const body = {
      name: form.name.trim(),
      phone: form.phone,
      address: form.address.trim(),
    };
    if (form.newPassword) {
      body.currentPassword = form.currentPassword;
      body.newPassword = form.newPassword;
    }

    setLoading(true);
    try {
      const res = await api.put("/users/profile", body);
      console.log("PROFILE UPDATE RESPONSE:", res.data);
      updateUser({ ...user, name: res.data.data.name });
      setForm({
        ...form,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMsg({ type: "ok", text: "Profile updated" });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Cannot reach the server",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!info) return <p className="p-6">Loading...</p>;

  return (
    <div className="mx-auto w-full max-w-2xl p-2 ">
      <h1 className="mb-4 text-2xl font-bold text-brand-700 text-center">
        My profile
      </h1>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl bg-white p-6 shadow-md shadow-brand-700"
      >
        {msg.text && (
          <p
            className={`mb-3 rounded p-2 text-sm ${msg.type === "ok" ? "bg-brand-100 text-brand-900" : "bg-red-100 text-red-700"}`}
          >
            {msg.text}
          </p>
        )}
        <p className="mb-3 text-sm text-gray-600">
          {info.email}{" "}
          <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
            {info.role}
          </span>
        </p>

        <FormInput
          label="Full name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
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

        <h2 className="mb-2 mt-5 text-sm font-semibold text-brand-700">
          Change password (optional)
        </h2>
        <FormInput
          label="Current password"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <FormInput
          label="New password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />
        <FormInput
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button
          disabled={loading}
          className="mt-2 w-full rounded-full bg-brand-700 py-2 font-semibold text-white hover:bg-brand-900 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
