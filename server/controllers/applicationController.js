const Application = require("../models/Application");
const Job = require("../models/Job");

const createApplication = async (req, res) => {
  try {
    const { job, status, appliedDate, notes } = req.body;

    if (!job) {
      return res.status(400).json({
        success: false,
        message: "Job is required",
      });
    }

    const existingJob = await Job.findOne({
      _id: job,
      user: req.user._id,
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const existingApplication = await Application.findOne({
      job,
      user: req.user._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "Application for this job already exists",
      });
    }

    const application = await Application.create({
      ...req.body,
      user: req.user._id,
    });

    const populatedApplication = await application.populate("job");

    res.status(201).json({
      success: true,
      message: "Application created successfully",
      data: {
        application: populatedApplication,
      },
    });
  } catch (error) {
    console.error("Create application error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating application",
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = 1,
      limit = 6,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsPerPage = Math.max(Number(limit) || 6, 1);
    const skip = (currentPage - 1) * itemsPerPage;

    const query = {
      user: req.user._id,
    };

    // Filter applications by status
    if (status) {
      query.status = status;
    }

    let applications = await Application.find(query)
      .populate("job")
      .sort({ createdAt: -1 });

    // Search by job title or company
    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();

      applications = applications.filter((application) => {
        const jobTitle = application.job?.title?.toLowerCase() || "";
        const company = application.job?.company?.toLowerCase() || "";

        return (
          jobTitle.includes(searchTerm) ||
          company.includes(searchTerm)
        );
      });
    }

    const total = applications.length;
    const totalPages = Math.ceil(total / itemsPerPage);

    const paginatedApplications = applications.slice(
      skip,
      skip + itemsPerPage
    );

    res.status(200).json({
      success: true,
      data: {
        applications: paginatedApplications,
        pagination: {
          page: currentPage,
          limit: itemsPerPage,
          total,
          pages: totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching applications",
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("job");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        application,
      },
    });
  } catch (error) {
    console.error("Get application error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching application",
    });
  }
};

const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: {
        application,
      },
    });
  } catch (error) {
    console.error("Update application error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating application",
    });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting application",
    });
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};