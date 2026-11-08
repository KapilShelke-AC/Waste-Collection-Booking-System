import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import BookingForm from "../../components/BookingForm";

export default function BookPickup() {
  const navigate = useNavigate();

  const save = async (payload) => {
    await api.post("/bookings", payload);
    navigate("/my-bookings", {
      state: { message: "Booking created. We will assign a collector soon." },
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-1 text-3xl font-bold text-brand-900">Book a waste pickup</h1>
      <p className="mb-5 text-sm text-gray-600">
        Choose the waste type, your area and a time that suits you.
      </p>
      <BookingForm submitLabel="Confirm booking" onSubmit={save} />
    </div>
  );
}
