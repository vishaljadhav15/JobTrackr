import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/jobs", {
        params: {
          search: search || undefined,
          jobType: jobType || undefined,
          workMode: workMode || undefined,
          page,
          limit: 6,
        },
      });

      setJobs(response.data.data.jobs);
      setPagination(response.data.data.pagination);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, jobType, workMode, page]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleJobTypeChange = (event) => {
    setJobType(event.target.value);
    setPage(1);
  };

  const handleWorkModeChange = (event) => {
    setWorkMode(event.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setJobType("");
    setWorkMode("");
    setPage(1);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track the jobs you are interested in.
          </p>
        </div>

        <Link
          to="/jobs/add"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Job
        </Link>
      </div>

      {/* Search and filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search jobs or companies..."
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900 md:col-span-2"
          />

          <select
            value={jobType}
            onChange={handleJobTypeChange}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>

          <select
            value={workMode}
            onChange={handleWorkModeChange}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900"
          >
            <option value="">All Work Modes</option>
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {(search || jobType || workMode) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-500">
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <h2 className="font-semibold text-slate-900">
            No jobs found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-500">
            Showing {jobs.length} of {pagination.total} jobs
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {job.title}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {job.company}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-slate-500">
                  <p>
                    <span className="font-medium text-slate-700">
                      Location:
                    </span>{" "}
                    {job.location || "Not specified"}
                  </p>

                  <p>
                    <span className="font-medium text-slate-700">
                      Type:
                    </span>{" "}
                    {job.jobType}
                  </p>

                  <p>
                    <span className="font-medium text-slate-700">
                      Work Mode:
                    </span>{" "}
                    {job.workMode}
                  </p>
                </div>

                {job.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  to={`/jobs/${job._id}`}
                  className="mt-5 inline-block text-sm font-medium text-slate-900 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-sm font-medium text-slate-600">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                type="button"
                disabled={page === pagination.pages}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;