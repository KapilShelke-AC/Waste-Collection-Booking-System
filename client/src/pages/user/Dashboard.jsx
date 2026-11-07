import { Link } from "react-router-dom";

export default function Dashboard() {

    return (

        <div className="container">

            <section className="hero">

                <h1>
                    Welcome to EcoCollect
                </h1>

                <p>
                    Schedule your waste pickup
                    and help keep your city clean.
                </p>

                <Link to="/book" className="btn">
                    Book a Pickup
                </Link>

            </section>

            <div className="cards">

                <div className="card">

                    <h3>Book Pickup</h3>

                    <p>
                        Schedule a waste collection.
                    </p>

                    <Link to="/book">
                        Book Now →
                    </Link>

                </div>

                <div className="card">

                    <h3>My Bookings</h3>

                    <p>
                        Track your pickup requests.
                    </p>

                    <Link to="/my-bookings">
                        View Bookings →
                    </Link>

                </div>

                <div className="card">

                    <h3>Waste Types</h3>

                    <p>
                        Explore waste categories.
                    </p>

                    <Link to="/book">
                        Explore →
                    </Link>

                </div>

            </div>

        </div>

    );

}