const express = require("express");
const router = express.Router();

const progressController = require("./progress.controller");
const { protect } = require("../../middlewares/auth.middleware");

// GET /api/progress
router.get(
    "/progress",
    protect,
    progressController.getMyProgress
);


// GET /api/progress/courses/:courseId
router.get(
    "/progress/courses/:courseId",
    protect,
    progressController.getCourseProgress
);

module.exports = router;