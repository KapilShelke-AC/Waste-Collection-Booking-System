import { useEffect, useState } from "react";

import api from "../../api/axios";

export default function AdminBookings() {

    const [bookings, setBookings] = useState([]);

    const [collectors, setCollectors] = useState([]);

    const [message, setMessage] = useState("");


    async function loadBookings() {

        try {

            const response = await api.get(
                "/bookings"
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

        // Member 1's user API
        api.get("/users")
            .then(response => {

                setCollectors(
                    response.data.data.filter(
                        user => user.role === "collector"
                    )
                );

            })
            .catch(() => {});

    }, []);


    async function assignCollector(
        bookingId,
        collectorId
    ) {

        try {

            await api.patch(
                `/bookings/${bookingId}/assign`,
                {
                    collector_id: collectorId
                }
            );

            loadBookings();

        } catch (error) {

            setMessage(
                error.response?.data?.message
                || "Assignment failed"
            );

        }

    }


    return (

        <div className="container">

            <h1>Admin Booking Management</h1>

            {message && (
                <p>{message}</p>
            )}

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Waste</th>
                            <th>Area</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Collector</th>
                        </tr>

                    </thead>

                    <tbody>

                        {bookings.map(booking => (

                            <tr key={booking.id}>

                                <td>
                                    {booking.id}
                                </td>

                                <td>
                                    {booking.customer_name}
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
                                    {booking.status}
                                </td>

                                <td>

                                    {booking.status === "Pending" ? (

                                        <select
                                            defaultValue=""
                                            onChange={e =>
                                                assignCollector(
                                                    booking.id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Assign Collector
                                            </option>

                                            {collectors.map(
                                                collector => (

                                                    <option
                                                        key={collector.id}
                                                        value={collector.id}
                                                    >

                                                        {collector.name}

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    ) : (

                                        booking.collector_name
                                        || "Not Assigned"

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
