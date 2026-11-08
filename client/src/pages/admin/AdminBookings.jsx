import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

const STATUSES = ["Pending", "Assigned", "Completed", "Cancelled"];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = async () => {
    try {
      const res = await api.get("/bookings", { params: { status, search } });
      setBookings(res.data.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not load bookings",
      });
    }
  };

  useEffect(() => {
    load();
  }, [status]); // reload when the status filter changes

  useEffect(() => {
    api
      .get("/users", { params: { role: "collector" } })
      .then((res) =>
        setCollectors(
          res.data.data.filter((u) => u.role === "collector" && u.is_active),
        ),
      )
      .catch(() =>
        setMsg({ type: "error", text: "Could not load collectors" }),
      );
  }, []);

  const assign = async (id, collectorId) => {
    if (!collectorId) return;
    try {
      await api.patch(`/bookings/${id}/assign`, {
        collector_id: Number(collectorId),
      });
      setMsg({ type: "ok", text: "Collector assigned" });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Assignment failed",
      });
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      setMsg({ type: "ok", text: "Booking deleted" });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Delete failed",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-4 text-3xl font-bold text-brand-900">
        Manage bookings
      </h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search customer, area or waste"
          className="min-w-[220px] rounded border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={load}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
        >
          Search
        </button>
      </div>

      {msg.text && (
        <p
          className={`mb-3 rounded p-2 text-sm ${
            msg.type === "ok"
              ? "bg-brand-100 text-brand-900"
              : "bg-red-100 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b bg-cream text-gray-600">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Waste</th>
              <th className="p-3">Area</th>
              <th className="p-3">Date and time</th>
              <th className="p-3">Status</th>
              <th className="p-3">Collector</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b last:border-0">
                <td className="p-3">{b.id}</td>
                <td className="p-3">{b.customer_name}</td>
                <td className="p-3">{b.waste_name}</td>
                <td className="p-3">{b.area_name}</td>
                <td className="p-3">
                  {b.pickup_date}
                  <br />
                  <span className="text-xs text-gray-500">{b.time_slot}</span>
                </td>
                <td className="p-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="p-3">
                  {b.status === "Pending" ? (
                    <select
                      defaultValue=""
                      onChange={(e) => assign(b.id, e.target.value)}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                    >
                      <option value="">Assign collector</option>
                      {collectors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    b.collector_name || "-"
                  )}
                </td>
                <td className="p-3">
                  <button onClick={() => remove(b.id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
