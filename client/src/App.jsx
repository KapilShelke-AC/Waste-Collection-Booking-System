import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Profile from "./pages/user/Profile";
import AdminUsers from "./pages/admin/AdminUsers";
import CollectorTasks from "./pages/collector/CollectorTasks";

function Placeholder({ title }) {
  const isHome = title === "Home (Member 3)";

  return (
    <div className="p-6 ml-10 flex-1">
      {isHome ? (
        <>
          <h1 className="text-8xl font-bold mt-50">
            Recycle<span className="text-brand-700">Connect</span>
          </h1>

          <h2 className="text-lg font-bold mt-5">
            Reduce &middot; Recycle &middot; Reconnect
          </h2>

          <h2 className="text-lg mt-2">Small steps. Big change.</h2>
          <h2 className="text-lg">Together for a sustainable planet.</h2>
        </>
      ) : (
        <h1 className="text-3xl font-bold text-brand-700">{title}</h1>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Placeholder title="Home (Member 3)" />} />

        <Route
          path="/about"
          element={<Placeholder title="About Us (Member 3)" />}
        />

        <Route
          path="/contact"
          element={<Placeholder title="Contact Us (Member 3)" />}
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* Any logged-in user */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* User */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["user"]}>
              <Placeholder title="User Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book"
          element={
            <ProtectedRoute roles={["user"]}>
              <Placeholder title="Book pickup (Member 2)" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute roles={["user"]}>
              <Placeholder title="My bookings (Member 2)" />
            </ProtectedRoute>
          }
        />

        {/* Collector */}
        <Route
          path="/collector"
          element={
            <ProtectedRoute roles={["collector"]}>
              <CollectorTasks />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Placeholder title="Admin dashboard (Member 3)" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Placeholder title="Admin bookings (Member 2)" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/waste-types"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Placeholder title="Waste types (Member 3)" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/areas"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Placeholder title="Areas (Member 3)" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Placeholder title="Messages (Member 3)" />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
