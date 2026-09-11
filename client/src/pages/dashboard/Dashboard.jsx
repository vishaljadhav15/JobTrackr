import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";

const statItems = [
  { key: "totalJobs", label: "Total Jobs" },
  { key: "totalApplications", label: "Applications" },
  { key: "interviews", label: "Interviews" },
  { key: "offers", label: "Offers" },
  { key: "rejected", label: "Rejected" },
];

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [applicationStatusData, setApplicationStatusData] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");

        const dashboardData = response.data.data;

        setStats(dashboardData.stats);
        setApplicationStatusData(
          dashboardData.applicationStatusData || [],
        );
        setRecentApplications(
          dashboardData.recentApplications || [],
        );
        setUpcomingInterviews(
          dashboardData.upcomingInterviews || [],
        );
        setUpcomingFollowUps(
          dashboardData.upcomingFollowUps || [],
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Format a date for dashboard display
  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString();
  };

  // Check whether an interview or follow-up is overdue or due soon
  const getDateStatus = (date) => {
    if (!date) {
      return {
        label: "Not scheduled",
        className: "bg-slate-100 text-slate-600",
      };
    }

    const eventDate = new Date(date);
    const today = new Date();

    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const differenceInDays = Math.ceil(
      (eventDate - today) / (1000 * 60 * 60 * 24),
    );

    if (differenceInDays < 0) {
      const overdueDays = Math.abs(differenceInDays);

      return {
        label: `Overdue ${overdueDays}d`,
        className: "bg-red-100 text-red-700",
      };
    }

    if (differenceInDays === 0) {
      return {
        label: "Due Today",
        className: "bg-amber-100 text-amber-700",
      };
    }

    if (differenceInDays === 1) {
      return {
        label: "Tomorrow",
        className: "bg-blue-100 text-blue-700",
      };
    }

    if (differenceInDays <= 3) {
      return {
        label: `In ${differenceInDays} days`,
        className: "bg-orange-100 text-orange-700",
      };
    }

    return {
      label: `In ${differenceInDays} days`,
      className: "bg-slate-100 text-slate-600",
    };
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track your job search progress in one place.
        </p>
      </div>

      {/* Summary statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statItems.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {item.label}
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {stats[item.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Application pipeline chart */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-semibold text-slate-900">
            Application Pipeline
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            See how your applications are distributed across each stage.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={applicationStatusData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="status"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                name="Applications"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming interviews and follow-ups */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upcoming interviews */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Upcoming Interviews
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your next scheduled interviews.
                </p>
              </div>

              {upcomingInterviews.length > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {upcomingInterviews.length}
                </span>
              )}
            </div>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                No upcoming interviews.
              </p>

              <Link
                to="/applications"
                className="mt-3 inline-block text-sm font-medium text-slate-900 hover:underline"
              >
                View applications
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {upcomingInterviews.map((application) => {
                const dateStatus = getDateStatus(
                  application.interviewDate,
                );

                return (
                  <div
                    key={application._id}
                    className="px-6 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-slate-900">
                          {application.job?.title || "Unknown Job"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {application.job?.company ||
                            "Unknown Company"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${dateStatus.className}`}
                      >
                        {dateStatus.label}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="font-medium text-slate-700">
                        Interview:{" "}
                        {formatDate(application.interviewDate)}
                      </span>

                      {application.job?.location && (
                        <span className="text-slate-400">
                          {application.job.location}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/applications/${application._id}`}
                      className="mt-3 inline-block text-sm font-medium text-slate-900 hover:underline"
                    >
                      View application →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming follow-ups */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Upcoming Follow-ups
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Applications that need your follow-up.
                </p>
              </div>

              {upcomingFollowUps.length > 0 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {upcomingFollowUps.length}
                </span>
              )}
            </div>
          </div>

          {upcomingFollowUps.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                No upcoming follow-ups.
              </p>

              <Link
                to="/applications"
                className="mt-3 inline-block text-sm font-medium text-slate-900 hover:underline"
              >
                View applications
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {upcomingFollowUps.map((application) => {
                const dateStatus = getDateStatus(
                  application.followUpDate,
                );

                return (
                  <div
                    key={application._id}
                    className="px-6 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-slate-900">
                          {application.job?.title || "Unknown Job"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {application.job?.company ||
                            "Unknown Company"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${dateStatus.className}`}
                      >
                        {dateStatus.label}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="font-medium text-slate-700">
                        Follow-up:{" "}
                        {formatDate(application.followUpDate)}
                      </span>

                      {application.job?.location && (
                        <span className="text-slate-400">
                          {application.job.location}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/applications/${application._id}`}
                      className="mt-3 inline-block text-sm font-medium text-slate-900 hover:underline"
                    >
                      View application →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent applications */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Recent Applications
          </h2>
        </div>

        {recentApplications.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No applications yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {recentApplications.map((application) => (
              <div
                key={application._id}
                className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium text-slate-900">
                    {application.job?.title || "Unknown Job"}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {application.job?.company || "Unknown Company"}
                    {application.job?.location
                      ? ` • ${application.job.location}`
                      : ""}
                  </p>
                </div>

                <StatusBadge status={application.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;