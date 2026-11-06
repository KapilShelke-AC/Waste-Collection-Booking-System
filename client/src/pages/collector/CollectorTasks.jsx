import { useEffect, useState } from "react";
import api from "../../api/axios";

const BADGE = {
  Assigned: "bg-sky-100 text-sky-800",
  Completed: "bg-brand-100 text-brand-900",
};

const fmt = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function CollectorTasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = async () => {
    try {
      const res = await api.get("/collector/tasks");
      setTasks(res.data.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not load tasks",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const complete = async (t) => {
    if (!window.confirm(`Mark booking #${t.id} as completed?`)) return;
    try {
      await api.patch(`/collector/tasks/${t.id}/complete`);
      setMsg({ type: "ok", text: `Booking #${t.id} marked as completed` });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not update the task",
      });
    }
  };

  const count = (s) => tasks.filter((t) => t.status === s).length;
  const shown =
    filter === "All" ? tasks : tasks.filter((t) => t.status === filter);
  const tabs = [
    ["All", tasks.length],
    ["Assigned", count("Assigned")],
    ["Completed", count("Completed")],
  ];

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold text-brand-700">My assigned pickups</h1>

      <div className="my-3 flex gap-2">
        {tabs.map(([name, n]) => (
          <button
            key={name}
            onClick={() => setFilter(name)}
            className={`rounded-full px-4 py-1 text-sm font-semibold ${
              filter === name
                ? "bg-brand-700 text-white"
                : "bg-brand-100 text-brand-900"
            }`}
          >
            {name} ({n})
          </button>
        ))}
      </div>

      {msg.text && (
        <p
          className={`mb-3 rounded p-2 text-sm ${msg.type === "ok" ? "bg-brand-100 text-brand-900" : "bg-red-100 text-red-700"}`}
        >
          {msg.text}
        </p>
      )}

      {shown.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
          No tasks here.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <div key={t.id} className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-semibold text-brand-900">Booking #{t.id}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[t.status]}`}
              >
                {t.status}
              </span>
            </div>

            <dl className="my-3 space-y-1.5 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Address</dt>
                <dd>
                  {t.address} ({t.area})
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Date and slot</dt>
                <dd>
                  {fmt(t.pickup_date)} | {t.time_slot}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Waste type</dt>
                <dd>{t.waste_type}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Customer</dt>
                <dd>
                  {t.customer} |{" "}
                  <a
                    href={`tel:${t.customer_phone}`}
                    className="text-brand-700 underline"
                  >
                    {t.customer_phone}
                  </a>
                </dd>
              </div>
              {t.notes && (
                <div>
                  <dt className="text-xs text-gray-500">Notes</dt>
                  <dd>{t.notes}</dd>
                </div>
              )}
            </dl>

            {t.status === "Assigned" ? (
              <button
                onClick={() => complete(t)}
                className="w-full rounded-full bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-900"
              >
                Mark as Completed
              </button>
            ) : (
              <p className="rounded-full bg-brand-100 py-2 text-center text-sm text-brand-900">
                Done on {t.completed_at}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
