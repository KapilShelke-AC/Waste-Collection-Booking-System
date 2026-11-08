import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import BookingForm from "../../components/BookingForm";

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/bookings/${id}/edit`)
      .then((r) => {
        const b = r.data.data;
        setInitial({
          waste_type_id: String(b.waste_type_id),
          area_id: String(b.area_id),
          pickup_date: b.pickup_date,
          time_slot: b.time_slot,
          address: b.address,
          notes: b.notes ?? "",
        });
      })
      .catch((err) => setError(err.response?.data?.message || "Booking not found"));
  }, [id]);

  const save = async (payload) => {
    await api.put(`/bookings/${id}`, payload);
    navigate("/my-bookings", { state: { message: "Booking updated." } });
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-5 text-3xl font-bold text-brand-900">Edit booking</h1>

      {error && (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="mb-3 text-sm text-red-700">{error}</p>
          <Link to="/my-bookings" className="font-semibold text-brand-700">
            Back to my bookings
          </Link>
        </div>
      )}

      {initial && (
        <BookingForm initial={initial} submitLabel="Update booking" onSubmit={save} />
      )}
    </div>
  );
}
