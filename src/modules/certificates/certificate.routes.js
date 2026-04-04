const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const certificatesController = require("./certificate.controller");

// GET all my certificates
router.get("/certificates", protect, certificatesController.getMyCertificates);

// GET single certificate by ID
router.get("/certificates/:id", protect, certificatesController.getCertificateById);

module.exports = router;