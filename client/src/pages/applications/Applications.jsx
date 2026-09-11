import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";

const Applications = () => {
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/applications", {
        params: {
          search: search || undefined,
          status: status || undefined,
          page,
          limit: 6,
        },
      });

      setApplications(response.data.data.applications);
      setPagination(response.data.data.pagination);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load applications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, status, page]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Applications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track and manage all your job applications.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search job or company..."
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900 md:col-span-2"
          />

          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900"
          >
            <option value="">All Statuses</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {(search || status) && (
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
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <h2 className="font-semibold text-slate-900">
            No applications found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-500">
            Showing {applications.length} of {pagination.total} applications
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Job
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Company
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Applied Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Interview
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {applications.map((application) => (
                    <tr
                      key={application._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {application.job?.title || "Unknown Job"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {application.job?.company || "Unknown Company"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={application.status} />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {application.appliedDate
                          ? new Date(
                              application.appliedDate,
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {application.interviewDate
                          ? new Date(
                              application.interviewDate,
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          to={`/applications/${application._id}`}
                          className="text-sm font-medium text-slate-900 hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage((currentPage) => currentPage - 1)
                }
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
                onClick={() =>
                  setPage((currentPage) => currentPage + 1)
                }
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

export default Applications;