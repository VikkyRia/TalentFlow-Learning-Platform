const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
require("./config/db");
const migrate = require("./db/migrate");
migrate();

// Import the team's response helper
const { error, success } = require("./utils/response");

// Import the team's response helper
const { error, success } = require("./utils/response");

const app = express();

// ── Security & Utility Middleware ──────────────────
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ── Routes ─────────────────────────────────────────
// Note: Ensure these paths match your folder structure exactly
app.use("/api/auth",          require("./modules/auth/auth.routes"));
app.use("/api/users",         require("./modules/users/user.routes"));
app.use("/api/courses",       require("./modules/courses/course.routes"));
app.use("/api/courses/:id/lessons", require("./modules/lessons/lesson.routes"));
app.use("/api/assignments",   require("./modules/assignments/assignment.routes"));
app.use("/api/progress",      require("./modules/progress/progress.routes"));
app.use("/api/certificates",  require("./modules/certificates/certificate.routes"));
app.use("/api/notifications", require("./modules/notifications/notification.routes"));
app.use("/api/discussions",   require("./modules/discussions/discussion.routes"));

// ── Health Check ───────────────────────────────────
app.get("/", (req, res) => {
  // Using the team's success helper for consistency
  return success(res, "TalentFlow LMS API 🎓", {
    status: "Server is running",
    version: "1.0.0",
  });
});

// ── 404 Handler ────────────────────────────────────
app.use((req, res) => {
  // Standardized error helper
  return error(res, "Route not found", 404);
});

// ── Global Error Handler ───────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Standardized error helper
  return error(res, "Something went wrong on our end.", 500);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TalentFlow API running on port ${PORT}`);
});

module.exports = app; // Good practice for testing