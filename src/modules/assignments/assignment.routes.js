const express = require("express");
const router = express.Router();

const assignmentController = require("./assignment.controller");

const { protect } = require("../../middlewares/auth.middleware"); // Using your partner's middleware
const { allowRoles } = require("../../middlewares/role.middleware");


// GET all assignments in a course
router.get(
    "/courses/:id/assignments",
    protect,
    assignmentController.getCourseAssignments
);


// CREATE assignment (Instructor only)
router.post(
    "/courses/:id/assignments",
    protect,
    allowRoles("instructor"),
    assignmentController.createAssignment
);


// GET single assignment
router.get(
    "/assignments/:id",
    protect,
    assignmentController.getAssignment
);


// UPDATE assignment (Instructor only)
router.patch(
    "/assignments/:id",
    protect,
    allowRoles("instructor"),
    assignmentController.updateAssignment
);


// DELETE assignment (Instructor only)
router.delete(
    "/assignments/:id",
    protect,
    allowRoles("instructor"),
    assignmentController.deleteAssignment
);

module.exports = router;