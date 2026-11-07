import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function BookPickup() {
    const navigate = useNavigate();

    const [wasteTypes, setWasteTypes] = useState([]);
    const [areas, setAreas] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        waste_type_id: "",
        area_id: "",
        pickup_date: "",
        time_slot: "",
        address: "",
        notes: ""
    });

    useEffect(() => {
        loadFormData();
    }, []);

    async function loadFormData() {
        try {
            const wasteResponse = await api.get("/wastetypes");

            const wasteData =
                wasteResponse.data.wasteTypes ??
                wasteResponse.data.data ??
                wasteResponse.data;

            setWasteTypes(
                Array.isArray(wasteData) ? wasteData : []
            );

        } catch (error) {
            console.error("Waste Types Error:", error);
            setMessage("Unable to load waste types.");
        }

        try {
            const areaResponse = await api.get("/areas");

            const areaData =
                areaResponse.data.areas ??
                areaResponse.data.data ??
                areaResponse.data;

            setAreas(
                Array.isArray(areaData) ? areaData : []
            );

        } catch (error) {
            console.error("Areas Error:", error);
            setMessage("Unable to load pickup areas.");
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");

        try {
            setLoading(true);

            const response = await api.post(
                "/bookings",
                {
                    ...form,
                    waste_type_id: Number(form.waste_type_id),
                    area_id: Number(form.area_id)
                }
            );

            setMessage(
                response.data.message ||
                "Booking created successfully!"
            );

            navigate("/my-bookings");

        } catch (error) {
            console.error("Booking Error:", error);

            setMessage(
                error.response?.data?.message ||
                "Booking failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <h1>Book Waste Pickup</h1>

            {message && <p>{message}</p>}

            <form className="form" onSubmit={handleSubmit}>
                <label>Waste Type</label>

                <select
                    name="waste_type_id"
                    value={form.waste_type_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Waste Type</option>

                    {wasteTypes.map(waste => (
                        <option key={waste.id} value={waste.id}>
                            {waste.name} - ₹{waste.price}
                        </option>
                    ))}
                </select>

                {wasteTypes.length === 0 && (
                    <small>No waste types available.</small>
                )}

                <label>Pickup Area</label>

                <select
                    name="area_id"
                    value={form.area_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Area</option>

                    {areas.map(area => (
                        <option key={area.id} value={area.id}>
                            {area.name}
                        </option>
                    ))}
                </select>

                {areas.length === 0 && (
                    <small>No pickup areas available.</small>
                )}

                <label>Pickup Date</label>

                <input
                    type="date"
                    name="pickup_date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={form.pickup_date}
                    onChange={handleChange}
                    required
                />

                <label>Pickup Time</label>

                <select
                    name="time_slot"
                    value={form.time_slot}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Time</option>
                    <option value="9-11 AM">9-11 AM</option>
                    <option value="11-1 PM">11-1 PM</option>
                    <option value="2-4 PM">2-4 PM</option>
                    <option value="4-6 PM">4-6 PM</option>
                </select>

                <label>Pickup Address</label>

                <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    minLength={10}
                    placeholder="Enter your complete pickup address"
                    required
                />

                <label>Additional Notes</label>

                <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any additional instructions (optional)"
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Booking..." : "Confirm Booking"}
                </button>
            </form>
        </div>
    );
}
