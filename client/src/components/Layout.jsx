import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  const isHome = useLocation().pathname === "/";

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isHome
          ? "bg-cover bg-center bg-no-repeat"
          : "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100"
      }`}
      style={isHome ? { backgroundImage: "url('/bg.png')" } : {}}
    >
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
