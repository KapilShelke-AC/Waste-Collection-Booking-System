import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecyclingIcon from "@mui/icons-material/Recycling";
import { useLocation } from "react-router-dom";

const LINKS = {
  visitor: [
    ["Home", "/"],
    ["About", "/about"],
    ["Contact", "/contact"],
    ["Login", "/login"],
    ["Register", "/register"],
  ],
  user: [
    ["Dashboard", "/dashboard"],
    ["Book Pickup", "/book"],
    ["My Bookings", "/my-bookings"],
    ["Profile", "/profile"],
  ],
  collector: [
    ["My Tasks", "/collector"],
    ["Profile", "/profile"],
  ],
  admin: [
    ["Dashboard", "/admin"],
    ["Bookings", "/admin/bookings"],
    ["Users", "/admin/users"],
    ["Waste Types", "/admin/waste-types"],
    ["Areas", "/admin/areas"],
    ["Messages", "/admin/messages"],
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = LINKS[user ? user.role : "visitor"];
  const isHome = useLocation().pathname === "/";

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-1 text-sm ${
      isActive
        ? "font-bold text-brand-700 border-b-2 border-brand-700"
        : "text-gray-700 hover:text-brand-700"
    }`;

  return (
    <nav className={isHome ? "bg-transparent" : "bg-brand"}>
      <div className="flex w-full items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <RecyclingIcon className="text-brand-700 !text-2xl" />
          <span className="text-xl font-bold text-brand-700">
            RecycleConnect
          </span>
        </div>
        <button
          className="rounded border border-brand-500 px-2 py-1 text-sm md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <div
          className={`${open ? "flex" : "hidden"} absolute left-0 top-14 z-10 w-full flex-col gap-1 border-b bg-transparent p-3 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:p-0`}
        >
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              end
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          {user && (
            <>
              <button
                onClick={handleLogout}
                className="ml-2 rounded bg-brand-600 px-3 py-1 text-sm text-white bg-brand-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
