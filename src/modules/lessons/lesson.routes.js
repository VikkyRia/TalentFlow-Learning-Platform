const express = require("express");
const router = express.Router({ mergeParams: true });
const LessonController = require("./lesson.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { allowRoles } = require("../../middlewares/role.middleware");

// GET /api/courses/:id/lessons - Get all lessons in a course
router.get("/", protect, LessonController.getLessons);

// POST /api/courses/:id/lessons - Add lesson (instructor/admin only)
router.post(
  "/",
  protect,
  allowRoles("instructor", "admin"),
  LessonController.createLesson
);

// GET /api/courses/:id/lessons/:lessonId - Get single lesson
router.get("/:lessonId", protect, LessonController.getLessonById);

// PATCH /api/courses/:id/lessons/:lessonId - Update lesson (instructor/admin only)
router.patch(
  "/:lessonId",
  protect,
  allowRoles("instructor", "admin"),
  LessonController.updateLesson
);

// DELETE /api/courses/:id/lessons/:lessonId - Delete lesson (instructor/admin only)
router.delete(
  "/:lessonId",
  protect,
  allowRoles("instructor", "admin"),
  LessonController.deleteLesson
);

// POST /api/courses/:id/lessons/:lessonId/complete - Mark lesson complete
router.post(
  "/:lessonId/complete",
  protect,
  LessonController.markComplete
);

module.exports = router;