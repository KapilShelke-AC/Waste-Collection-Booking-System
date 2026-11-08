import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function MyBookings() {
  const { state } = useLocation(); // success message from Book / Edit
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState({
    type: state?.message ? "ok" : "",
    text: state?.message || "",
  });
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not load bookings",
      });
    } finally {
      setLoaded(true);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setMsg({ type: "ok", text: "Booking cancelled" });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Cancellation failed",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-900">My bookings</h1>
        <Link
          to="/book"
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
        >
          + New booking
        </Link>
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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-cream text-gray-600">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Waste</th>
              <th className="p-3">Area</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Collector</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b last:border-0">
                <td className="p-3">{b.id}</td>
                <td className="p-3">{b.waste_name}</td>
                <td className="p-3">{b.area_name}</td>
                <td className="p-3">{b.pickup_date}</td>
                <td className="p-3">{b.time_slot}</td>
                <td className="p-3">{b.collector_name || "-"}</td>
                <td className="p-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="p-3">
                  {b.status === "Pending" && (
                    <>
                      <Link to={`/book/${b.id}/edit`} className="btn-edit">
                        Edit
                      </Link>
                      <button
                        onClick={() => cancel(b.id)}
                        className="btn-delete"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {loaded && bookings.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No bookings yet. Book your first pickup.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
