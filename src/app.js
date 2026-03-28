const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
require("./config/db");
const migrate = require("./db/migrate");
migrate();

const app = express();

// ── Security & Utility Middleware ──────────────────
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ── Routes ─────────────────────────────────────────
app.use("/api/auth",          require("./modules/auth/auth.routes"));
app.use("/api/users",         require("./modules/users/user.routes"));
app.use("/api/courses",       require("./modules/courses/course.routes"));
app.use("/api/lessons",       require("./modules/lessons/lesson.routes"));
app.use("/api/assignments",   require("./modules/assignments/assignment.routes"));
app.use("/api/progress",      require("./modules/progress/progress.routes"));
app.use("/api/certificates",  require("./modules/certificates/certificate.routes"));
app.use("/api/notifications", require("./modules/notifications/notification.routes"));
app.use("/api/discussions",   require("./modules/discussions/discussion.routes"));

// ── Health Check ───────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "TalentFlow LMS API 🎓",
    status: "Server is running",
    version: "1.0.0",
  });
});

// ── 404 Handler ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ── Global Error Handler ───────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on our end.",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TalentFlow API running on port ${PORT}`);
});