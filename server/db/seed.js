require("dotenv").config;
const bcrypt = require("bcryptjs");
const pool = require("./pool");

const day = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.query("set foreign_key_checks=0 ");
    for (const t of ["bookings", "messages", "waste_types", "areas", "users"]) {
      await conn.query(`TRUNCATE TABLE ${t}`);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    //users
    const admin = await bcrypt.hash("Admin@123", 10);
    const col = await bcrypt.hash("Collector@123", 10);
    const usr = await bcrypt.hash("User@123", 10);
    await conn.query(
      "INSERT INTO users (name, email, password_hash, phone, address, role) VALUES ?",
      [
        [
          [
            "Sayka Arab",
            "sayka.new@example.com",
            usr,
            "9876543219",
            "Zenda Chouk, Zone 2",
            "user",
          ],
          [
            "Admin",
            "admin@eco.com",
            admin,
            "9000000001",
            "Head Office, Zone 5",
            "admin",
          ],
          [
            "Rahul Patil",
            "rahul@eco.com",
            col,
            "9000000002",
            "Staff Colony, Zone 3",
            "collector",
          ],
          [
            "Sunil More",
            "sunil@eco.com",
            col,
            "9000000003",
            "Staff Colony, Zone 4",
            "collector",
          ],
          [
            "Riya Sharma",
            "riya@eco.com",
            usr,
            "9000000004",
            "12 Green Park, Zone 1",
            "user",
          ],
          [
            "Amit Kulkarni",
            "amit@eco.com",
            usr,
            "9000000005",
            "7 Lake View, Zone 4",
            "user",
          ],
          [
            "Neha Patil",
            "neha@eco.com",
            usr,
            "9000000006",
            "21 Rose Lane, Zone 2",
            "user",
          ],
        ],
      ],
    );

    //areas
    await conn.query("INSERT INTO areas (name, pincode) VALUES ?", [
      [
        ["Zone 1 North", "422001"],
        ["Zone 2 South", "422002"],
        ["Zone 3 East", "422003"],
        ["Zone 4 West", "422004"],
        ["Zone 5 Central", "422005"],
      ],
    ]);

    //waste types
    await conn.query(
      "INSERT INTO waste_types (name, description, price) VALUES ?",
      [
        [
          ["Wet waste", "Kitchen and food waste", 50],
          ["Dry waste", "Paper, cardboard, cloth", 50],
          ["E-waste", "Old electronics and batteries", 120],
          ["Plastic", "Bottles, covers, packaging", 60],
          ["Garden waste", "Leaves, branches, grass", 80],
        ],
      ],
    );

    //bookings
    await conn.query(
      `INSERT INTO bookings (user_id, waste_type_id, area_id, collector_id, pickup_date, time_slot,
                             address, notes, status, completed_at) VALUES ?`,
      [
        [
          [
            4,
            1,
            1,
            null,
            day(2),
            "9-11 AM",
            "12 Green Park, Zone 1",
            "Two bags",
            "Pending",
            null,
          ],
          [
            4,
            3,
            3,
            2,
            day(3),
            "2-4 PM",
            "12 Green Park, Zone 1",
            "Old keyboard",
            "Assigned",
            null,
          ],
          [
            5,
            4,
            4,
            3,
            day(4),
            "11-1 PM",
            "7 Lake View, Zone 4",
            null,
            "Assigned",
            null,
          ],
          [
            6,
            2,
            2,
            null,
            day(5),
            "4-6 PM",
            "21 Rose Lane, Zone 2",
            "Paper and boxes",
            "Pending",
            null,
          ],
          [
            4,
            1,
            1,
            2,
            day(-5),
            "9-11 AM",
            "12 Green Park, Zone 1",
            null,
            "Completed",
            day(-5) + " 10:30:00",
          ],
          [
            5,
            2,
            2,
            3,
            day(-8),
            "2-4 PM",
            "7 Lake View, Zone 4",
            null,
            "Completed",
            day(-8) + " 15:10:00",
          ],
          [
            6,
            5,
            5,
            null,
            day(-3),
            "11-1 PM",
            "21 Rose Lane, Zone 2",
            "Cancelled by user",
            "Cancelled",
            null,
          ],
          [
            5,
            1,
            1,
            null,
            day(6),
            "9-11 AM",
            "7 Lake View, Zone 4",
            null,
            "Pending",
            null,
          ],
        ],
      ],
    );

    //messages
    await conn.query(
      "INSERT INTO messages (name, email, subject, message) VALUES ?",
      [
        [
          [
            "Sanjay Joshi",
            "sanjay@example.com",
            "Pickup timing",
            "Can you add an evening slot for pickups?",
          ],
          [
            "Pooja Desai",
            "pooja@example.com",
            "New area",
            "Please start service in our colony, thank you.",
          ],
          [
            "Kiran Shah",
            "kiran@example.com",
            "Pricing",
            "Is there a discount for monthly bookings?",
          ],
        ],
      ],
    );
    console.log(
      "Seed complete: 7 users, 5 areas, 5 waste types, 8 bookings, 3 messages",
    );
  } catch (error) {
    console.log(error);
  } finally {
    conn.release();
    await pool.end();
  }
}
seed();
