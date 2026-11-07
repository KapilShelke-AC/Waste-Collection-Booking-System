import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../api/axios";

export default function MyBookings() {

    const [bookings, setBookings] = useState([]);

    const [message, setMessage] = useState("");


    async function loadBookings() {

        try {

            const response = await api.get(
                "/bookings/my"
            );

            setBookings(
                response.data.data
            );

        } catch (error) {

            setMessage(
                error.response?.data?.message
                || "Failed to load bookings"
            );

        }

    }


    useEffect(() => {

        loadBookings();

    }, []);


    async function cancelBooking(id) {

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel?"
        );

        if (!confirmCancel) return;

        try {

            await api.patch(
                `/bookings/${id}/cancel`
            );

            loadBookings();

        } catch (error) {

            setMessage(
                error.response?.data?.message
                || "Cancellation failed"
            );

        }

    }


    return (

        <div className="container">

            <h1>My Bookings</h1>

            <Link
                to="/book"
                className="btn"
            >
                + New Booking
            </Link>

            {message && (
                <p>{message}</p>
            )}

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Waste</th>
                            <th>Area</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        {bookings.map(booking => (

                            <tr key={booking.id}>

                                <td>
                                    {booking.id}
                                </td>

                                <td>
                                    {booking.waste_name}
                                </td>

                                <td>
                                    {booking.area_name}
                                </td>

                                <td>
                                    {booking.pickup_date}
                                </td>

                                <td>
                                    {booking.time_slot}
                                </td>

                                <td>
                                    {booking.status}
                                </td>

                                <td>

                                    {booking.status === "Pending" && (

                                        <>

                                            <Link
                                                to={`/book/${booking.id}/edit`}
                                            >
                                                Edit
                                            </Link>

                                            {" "}

                                            <button
                                                className="danger"
                                                onClick={() =>
                                                    cancelBooking(
                                                        booking.id
                                                    )
                                                }
                                            >
                                                Cancel
                                            </button>

                                        </>

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}
