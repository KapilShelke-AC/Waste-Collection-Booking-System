import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import FormInput from "../../components/FormInput";
import { validateRegister } from "../../utils/validators";

const empty = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        address: form.address.trim(),
        password: form.password,
      });
      navigate("/login", {
        state: { message: "Registration successful. Please login." },
      });
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
    <div className="flex min-h-[85vh] items-center justify-center bg-brand-50 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md shadow-brand-700"
      >
        <h1 className="mb-4 text-center text-2xl font-bold text-brand-700">
          Create your account
        </h1>
        {serverError && (
          <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <FormInput
          label="Full name"
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
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <FormInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button
          disabled={loading}
          className="mt-2 w-full rounded bg-brand-600 py-2 font-semibold text-white bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-700">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
