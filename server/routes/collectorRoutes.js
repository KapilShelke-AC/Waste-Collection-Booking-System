const router = require("express").Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const c = require("../controllers/collectorController");

router.use(protect, authorize("collector"));

router.get("/tasks", c.myTasks);
router.patch("/tasks/:id/complete", c.complete);

module.exports = router;
