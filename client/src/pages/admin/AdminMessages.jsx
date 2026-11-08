import { useEffect, useState } from "react";
import api from "../../api/axios";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/messages", { params: { search } });
      setMessages(res.data.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Could not load messages",
      });
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/messages/${id}`);
      setMsg({ type: "ok", text: "Message deleted" });
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-brand-900">Messages</h1>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name or email"
            className="min-w-[200px] rounded border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <button
            onClick={load}
            className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
          >
            Search
          </button>
        </div>
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
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b bg-cream text-gray-600">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Message</th>
              <th className="p-3">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="border-b align-top last:border-0">
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3 font-medium">{m.subject}</td>
                <td className="p-3 text-gray-700">{m.message}</td>
                <td className="whitespace-nowrap p-3">{fmt(m.created_at)}</td>
                <td className="p-3">
                  <button onClick={() => remove(m.id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {loaded && messages.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
