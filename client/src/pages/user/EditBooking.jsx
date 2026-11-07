import { useEffect, useState } from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import api from "../../api/axios";

export default function EditBooking() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [form, setForm] = useState({

        waste_type_id: "",
        area_id: "",
        pickup_date: "",
        time_slot: "",
        address: "",
        notes: ""

    });

    const [message, setMessage] = useState("");


    useEffect(() => {

        api.get(`/bookings/${id}/edit`)
            .then(response => {

                setForm(response.data.data);

            })
            .catch(error => {

                setMessage(
                    error.response?.data?.message
                    || "Booking not found"
                );

            });

    }, [id]);


    function handleChange(e) {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    }


    async function handleSubmit(e) {

        e.preventDefault();

        try {

            await api.put(
                `/bookings/${id}`,
                form
            );

            navigate("/my-bookings");

        } catch (error) {

            setMessage(
                error.response?.data?.message
                || "Update failed"
            );

        }

    }


    return (

        <div className="container">

            <h1>Edit Booking</h1>

            <form
                className="form"
                onSubmit={handleSubmit}
            >

                <label>
                    Waste Type ID
                </label>

                <input
                    type="number"
                    name="waste_type_id"
                    value={form.waste_type_id}
                    onChange={handleChange}
                    required
                />


                <label>
                    Area ID
                </label>

                <input
                    type="number"
                    name="area_id"
                    value={form.area_id}
                    onChange={handleChange}
                    required
                />


                <label>
                    Pickup Date
                </label>

                <input
                    type="date"
                    name="pickup_date"
                    value={form.pickup_date}
                    onChange={handleChange}
                    required
                />


                <label>
                    Pickup Time
                </label>

                <select
                    name="time_slot"
                    value={form.time_slot}
                    onChange={handleChange}
                    required
                >

                    <option value="9-11 AM">
                        9-11 AM
                    </option>

                    <option value="11-1 PM">
                        11-1 PM
                    </option>

                    <option value="2-4 PM">
                        2-4 PM
                    </option>

                    <option value="4-6 PM">
                        4-6 PM
                    </option>

                </select>


                <label>
                    Address
                </label>

                <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                />


                <label>
                    Notes
                </label>

                <textarea
                    name="notes"
                    value={form.notes || ""}
                    onChange={handleChange}
                />


                <button type="submit">
                    Update Booking
                </button>

                {message && (
                    <p>{message}</p>
                )}

            </form>

        </div>

    );

}
