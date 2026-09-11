const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createApplication)
  .get(getApplications);

router.route("/:id")
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;