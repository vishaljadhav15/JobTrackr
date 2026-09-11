const Job = require("../models/Job");
const Application = require("../models/Application");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();

    const [
      totalJobs,
      totalApplications,
      interviews,
      offers,
      rejected,
      statusCounts,
      recentApplications,
      upcomingInterviews,
      upcomingFollowUps,
    ] = await Promise.all([
      Job.countDocuments({ user: userId }),

      Application.countDocuments({ user: userId }),

      Application.countDocuments({
        user: userId,
        status: "Interview",
      }),

      Application.countDocuments({
        user: userId,
        status: "Offer",
      }),

      Application.countDocuments({
        user: userId,
        status: "Rejected",
      }),

      Application.aggregate([
        {
          $match: {
            user: userId,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Application.find({
        user: userId,
      })
        .populate("job", "title company location")
        .sort({ createdAt: -1 })
        .limit(5),

      // Include overdue, today, and upcoming interviews
      Application.find({
        user: userId,
        interviewDate: {
          $ne: null,
        },
      })
        .populate("job", "title company location")
        .sort({ interviewDate: 1 })
        .limit(5),

      // Include overdue, today, and upcoming follow-ups
      Application.find({
        user: userId,
        followUpDate: {
          $ne: null,
        },
      })
        .populate("job", "title company location")
        .sort({ followUpDate: 1 })
        .limit(5),
    ]);

    // Keep all application statuses in the response
    const applicationStatuses = [
      "Saved",
      "Applied",
      "Screening",
      "Interview",
      "Offer",
      "Accepted",
      "Rejected",
    ];

    // Add zero counts for statuses that do not have applications
    const applicationStatusData = applicationStatuses.map((status) => {
      const statusItem = statusCounts.find(
        (item) => item._id === status,
      );

      return {
        status,
        count: statusItem ? statusItem.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalJobs,
          totalApplications,
          interviews,
          offers,
          rejected,
        },

        applicationStatusData,

        recentApplications,

        upcomingInterviews,

        upcomingFollowUps,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
    });
  }
};

module.exports = {
  getDashboardStats,
};