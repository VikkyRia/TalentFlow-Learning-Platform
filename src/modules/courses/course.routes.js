const express = require("express");
const router = express.Router();
const CourseController = require("./course.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { allowRoles } = require("../../middlewares/role.middleware");

// GET /api/courses - Browse all published courses (public)
router.get("/", CourseController.getAllCourses);

// GET /api/courses/:id - Get single course (public)
router.get("/:id", CourseController.getCourseById);

// POST /api/courses - Create a course (instructor/admin only)
router.post(
  "/",
  protect,
  allowRoles("instructor", "admin"),
  CourseController.createCourse
);

// PATCH /api/courses/:id - Update a course (instructor/admin only)
router.patch(
  "/:id",
  protect,
  allowRoles("instructor", "admin"),
  CourseController.updateCourse
);

// DELETE /api/courses/:id - Delete a course (admin only)
router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  CourseController.deleteCourse
);

// POST /api/courses/:id/enroll - Enroll in a course (learner)
router.post("/:id/enroll", protect, CourseController.enrollInCourse);

// GET /api/courses/:id/enrollees - Get enrollees (instructor/admin)
router.get(
  "/:id/enrollees",
  protect,
  allowRoles("instructor", "admin"),
  CourseController.getEnrollees
);

module.exports = router;