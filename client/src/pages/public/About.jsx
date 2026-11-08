import { Link } from "react-router-dom";

const stats = [
  ["3", "User roles"],
  ["24h", "Pickup response"],
  ["100%", "Online booking"],
];

const steps = [
  [
    "📝",
    "Register",
    "Create a free account with your name, phone and address.",
  ],
  [
    "📅",
    "Book a pickup",
    "Choose the waste type, your area and a convenient date.",
  ],
  ["🚛", "We collect", "Admin assigns a collector, who completes the pickup."],
];

const roles = [
  [
    "🏠",
    "Citizen",
    "Books and tracks pickups, and edits or cancels a booking while it is pending.",
  ],
  ["🛠️", "Admin", "Manages users, areas and bookings, and assigns collectors."],
  ["♻️", "Collector", "Sees assigned pickups and marks them as completed."],
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-16 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">About RecycleConnect</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          Reduce &middot; Recycle &middot; Reconnect. <br></br>We make waste
          pickup simple for people and organised for the municipal team.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        {/* Stats */}
        <div className="-mt-8 grid gap-4 md:grid-cols-3 ">
          {stats.map(([n, l]) => (
            <div
              key={l}
              className="rounded-2xl bg-white p-6 text-center shadow-lg shadow-brand-500"
            >
              <p className="text-3xl font-bold text-brand-700">{n}</p>
              <p className="text-sm text-gray-600">{l}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <section className="py-12 text-center">
          <h2 className="mb-3 text-2xl font-bold text-brand-900">
            Our mission
          </h2>
          <p className="mx-auto max-w-3xl text-gray-700">
            RecycleConnect is a waste collection booking system. Residents
            schedule household waste pickups in a few clicks, and the team
            tracks every request from booking to completion. Small steps. Big
            change.
          </p>
        </section>

        {/* How it works */}
        <section className="pb-12">
          <h2 className="mb-6 text-center text-2xl font-bold text-brand-900">
            How it works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(([icon, t, d], i) => (
              <div
                key={t}
                className="rounded-2xl bg-cream p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
                  {icon}
                </div>
                <h3 className="mb-1 font-semibold text-brand-900">
                  {i + 1}. {t}
                </h3>
                <p className="text-sm text-gray-700">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section className="pb-12">
          <h2 className="mb-6 text-center text-2xl font-bold text-brand-900">
            Who uses it
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map(([icon, t, d]) => (
              <div
                key={t}
                className="rounded-2xl border border-brand-100 bg-white p-6 shadow"
              >
                <div className="mb-2 text-3xl">{icon}</div>
                <h3 className="mb-1 font-semibold text-brand-700">{t}</h3>
                <p className="text-sm text-gray-700">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-2xl bg-brand-100 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-brand-900">
            Ready to book your first pickup?
          </h2>
          <p className="mb-4 text-gray-700">
            Join RecycleConnect and keep your area clean.
          </p>
          <Link
            to="/register"
            className="inline-block rounded-full bg-brand-700 px-6 py-2 font-semibold text-white hover:bg-brand-900"
          >
            Get started
          </Link>
        </section>
      </div>
    </div>
  );
}
