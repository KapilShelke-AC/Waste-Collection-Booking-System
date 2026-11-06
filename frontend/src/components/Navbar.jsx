import { Link } from "react-router-dom";

export default function Navbar() {

    return (

        <nav className="navbar">

            <Link to="/" className="logo">
                ♻ EcoCollect
            </Link>

            <div className="nav-links">

                <Link to="/">
                    Dashboard
                </Link>

                <Link to="/book">
                    Book Pickup
                </Link>

                <Link to="/my-bookings">
                    My Bookings
                </Link>

                <Link to="/admin/bookings">
                    Admin Bookings
                </Link>

                <Link to="/admin/waste-types">
                    Waste Types
                </Link>

            </div>

        </nav>

    );

}