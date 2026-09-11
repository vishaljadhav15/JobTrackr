const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  matchResumeWithJob,
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createJob)
  .get(getJobs);

router.route("/:id")
  .get(getJobById)
  .put(updateJob)
  .delete(deleteJob);

router.post("/:id/match", matchResumeWithJob);

module.exports = router;