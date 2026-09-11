const express = require("express");

const protect = require("../middleware/authMiddleware");
const uploadResume = require("../middleware/uploadMiddleware");

const {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
} = require("../controllers/resumeController");

const router = express.Router();

router.use(protect);

router.route("/")
  .post(uploadResume.single("resume"), createResume)
  .get(getResumes);

router.route("/:id")
  .get(getResumeById)
  .put(updateResume)
  .delete(deleteResume);

module.exports = router;