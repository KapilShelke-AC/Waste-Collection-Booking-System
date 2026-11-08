import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const cards = [
  ["/book", "Book a pickup", "Schedule a waste collection at your door."],
  [
    "/my-bookings",
    "My bookings",
    "Track, edit or cancel your pickup requests.",
  ],
  ["/profile", "My profile", "Update your phone, address or password."],
];

const statCards = [
  { label: "Total bookings", style: "bg-brand-100 border-brand-500/30" },
  { label: "Pending", style: "bg-cream border-amber-300/60" },
  { label: "Assigned", style: "bg-brand-50 border-brand-500/40" },
  { label: "Completed", style: "bg-leaf/20 border-leaf/50" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(null); // null = still loading

  useEffect(() => {
    api
      .get("/bookings/my")
      .then((res) => setBookings(res.data.data))
      .catch(() => setBookings(null));
  }, []);

  const count = (status) => bookings.filter((b) => b.status === status).length;

  const values = bookings
    ? [bookings.length, count("Pending"), count("Assigned"), count("Completed")]
    : ["-", "-", "-", "-"];

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <section className="mb-6 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="mt-2 text-white/90">
          Schedule your waste pickup and help keep your city clean.
        </p>
        <Link
          to="/book"
          className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-100"
        >
          Book a pickup
        </Link>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className={`rounded-xl border p-5 text-center ${s.style}`}
          >
            <p className="text-4xl font-bold">{values[i]}</p>
            <p className="mt-2 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([to, title, text]) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="mb-1 font-semibold text-brand-900">{title}</h3>
            <p className="text-sm text-gray-600">{text}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand-700">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
