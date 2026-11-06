export const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function validateLogin({ email, password }) {
  const e = {};
  if (!emailOk(email.trim())) e.email = "Enter a valid email";
  if (!password) e.password = "Password is required";
  return e;
}

export function validateRegister(f) {
  const e = {};
  const name = f.name.trim();
  if (name.length < 2 || name.length > 50)
    e.name = "Name must be 2 to 50 characters";
  if (!emailOk(f.email.trim())) e.email = "Enter a valid email";
  if (!/^\d{10}$/.test(f.phone)) e.phone = "Phone must be exactly 10 digits";
  if (!f.address.trim()) e.address = "Address is required";
  if (f.password.length < 6)
    e.password = "Password must be at least 6 characters";
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
    e.password = "Password needs a letter and a number";
  if (f.confirmPassword !== f.password)
    e.confirmPassword = "Passwords do not match";
  return e;
}
