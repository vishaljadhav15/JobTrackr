const Job = require("../models/Job");
const Resume = require("../models/Resume");
const calculateMatch = require("../services/matchingEngine");

const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: {
        job,
      },
    });
  } catch (error) {
    console.error("Create job error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating job",
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const {
      search = "",
      jobType,
      workMode,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 50);

    const query = {
      user: req.user._id,
    };

    // Search by job title or company
    if (search.trim()) {
      query.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          company: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Filter by job type
    if (jobType) {
      query.jobType = jobType;
    }

    // Filter by work mode
    if (workMode) {
      query.workMode = workMode;
    }

    const totalJobs = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const totalPages = Math.ceil(totalJobs / itemsPerPage);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage,
          itemsPerPage,
          totalJobs,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching jobs",
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        job,
      },
    });
  } catch (error) {
    console.error("Get job error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching job",
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: {
        job,
      },
    });
  } catch (error) {
    console.error("Update job error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating job",
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting job",
    });
  }
};

const matchResumeWithJob = async (req, res) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "Resume ID is required",
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const result = calculateMatch(
  resume.skills,
  job.skills,
  job.title,
  job.description,
);

    res.status(200).json({
      success: true,
      message: "Resume matched with job successfully",
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
        },
        resume: {
          id: resume._id,
          title: resume.title,
        },
        match: result,
      },
    });
  } catch (error) {
    console.error("Resume-job matching error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while matching resume with job",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  matchResumeWithJob,
};
