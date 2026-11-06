import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import BookPickup from "./pages/BookPickup";
import MyBookings from "./pages/MyBookings";
import EditBooking from "./pages/EditBooking";
import AdminBookings from "./pages/AdminBookings";
import ManageWasteTypes from "./pages/ManageWasteTypes";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/book" element={<BookPickup />} />

        <Route path="/my-bookings" element={<MyBookings />} />

        <Route path="/edit-booking/:id" element={<EditBooking />} />

        <Route path="/admin/bookings" element={<AdminBookings />} />

        <Route
          path="/admin/waste-types"
          element={<ManageWasteTypes />}
        />
      </Routes>
    </>
  );
}

export default App;