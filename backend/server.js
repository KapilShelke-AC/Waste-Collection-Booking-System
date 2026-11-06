import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import bookingRoutes from "./routes/bookingRoutes.js";
import wasteTypeRoutes from "./routes/wasteTypeRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Waste Collection Backend is Running");
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend is working"
    });
});

app.use("/api/bookings", bookingRoutes);

app.use("/api/wastetypes", wasteTypeRoutes);

app.use("/api/areas", areaRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log(
        `Server running on port ${process.env.PORT || 5000}`
    );
});