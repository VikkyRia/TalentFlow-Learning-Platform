const express = require("express");
const router = express.Router();

const assignmentController = require("./assignment.controller");

const { protect } = require("../../middlewares/auth.middleware");
const { allowRoles } = require("../../middlewares/role.middleware");


// GET /api/courses/:id/assignments
router.get(
  "/courses/:id/assignments",
  protect,
  assignmentController.getCourseAssignments
);


// POST /api/courses/:id/assignments
router.post(
  "/courses/:id/assignments",
  protect,
  allowRoles("instructor", "admin"),
  assignmentController.createAssignment
);


// GET /api/assignments/:id
router.get(
  "/assignments/:id",
  protect,
  assignmentController.getAssignment
);


// PATCH /api/assignments/:id
router.patch(
  "/assignments/:id",
  protect,
  allowRoles("instructor", "admin"),
  assignmentController.updateAssignment
);


// DELETE /api/assignments/:id
router.delete(
  "/assignments/:id",
  protect,
  allowRoles("instructor", "admin"),
  assignmentController.deleteAssignment
);

module.exports = router;