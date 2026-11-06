import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/FormInput";
import { validateLogin } from "../../utils/validators";
import { homeFor } from "../../utils/roles";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation(); // success message sent from Register
  const [form, setForm] = useState({ email: "", password: "" });
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
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      navigate(homeFor[user.role]);
    } catch (err) {
      setServerError(err.response?.data?.message || "Cannot reach the server");
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
        <h1 className="text-center text-2xl font-bold text-brand-700">
          Welcome back
        </h1>
        <p className="mb-4 text-center text-sm text-gray-500">
          Login to manage your pickups
        </p>

        {state?.message && (
          <p className="mb-3 rounded bg-brand-100 p-2 text-sm text-brand-800">
            {state.message}
          </p>
        )}
        {serverError && (
          <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <FormInput
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="xyz@example.com"
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="********"
        />

        <button
          disabled={loading}
          className="mt-2 w-full rounded bg-brand-600 py-2 font-semibold text-white bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-4 text-center text-sm">
          New here?{" "}
          <Link to="/register" className="font-semibold text-brand-700">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
