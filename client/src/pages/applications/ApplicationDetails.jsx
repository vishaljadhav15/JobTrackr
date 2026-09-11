import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Fetch the selected application using the ID from the URL
  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}`);

      // Store the application returned by the backend
      setApplication(response.data.data.application);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load application details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  // Format a date so it is easier to read in the UI
  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString();
  };

  // Delete the current application after confirmation
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      // Delete the application from the backend
      await api.delete(`/applications/${id}`);

      // Return to the applications list after successful deletion
      navigate("/applications");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete application. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // Show loading state while the API request is running
  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading application details...
      </div>
    );
  }

  // Show the error returned by the backend
  if (error && !application) {
    return (
      <div>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>

        <Link
          to="/applications"
          className="mt-4 inline-block text-sm font-medium text-slate-900 hover:underline"
        >
          ← Back to Applications
        </Link>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-10 text-center text-slate-500">
        Application not found.
      </div>
    );
  }

  return (
    <div>
      {/* Back navigation */}
      <Link
        to="/applications"
        className="mb-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to Applications
      </Link>

      {/* Show delete error without hiding the application details */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Application header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {application.job?.title || "Unknown Job"}
              </h1>

              <p className="mt-2 text-lg font-medium text-slate-600">
                {application.job?.company || "Unknown Company"}
              </p>

              {application.job?.location && (
                <p className="mt-1 text-sm text-slate-500">
                  {application.job.location}
                </p>
              )}
            </div>

            {/* Application actions and current status */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {application.status}
              </span>

              {/* Open the edit page for this application */}
              <button
                type="button"
                onClick={() =>
                  navigate(`/applications/${application._id}/edit`)
                }
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Edit Application
              </button>

              {/* Delete the current application */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Application"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-3">
          {/* Application timeline and details */}
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                Application Timeline
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Applied
                  </p>
                  <p className="mt-2 font-medium text-slate-900">
                    {formatDate(application.appliedDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Interview
                  </p>
                  <p className="mt-2 font-medium text-slate-900">
                    {formatDate(application.interviewDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Follow-up
                  </p>
                  <p className="mt-2 font-medium text-slate-900">
                    {formatDate(application.followUpDate)}
                  </p>
                </div>
              </div>
            </section>

            {/* Display contact person */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Contact Person
              </h2>

              <p className="mt-3 text-sm text-slate-600">
                {application.contactPerson || "Not specified"}
              </p>
            </section>

            {/* Display interview rounds */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Interview Rounds
              </h2>

              {application.interviewRounds?.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {application.interviewRounds.map((round, index) => (
                    <div
                      key={`${round.round || "round"}-${index}`}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <p className="font-medium text-slate-900">
                        {round.round || `Round ${index + 1}`}
                      </p>

                      {round.date && (
                        <p className="mt-1 text-sm text-slate-500">
                          Date: {formatDate(round.date)}
                        </p>
                      )}

                      {round.result && (
                        <p className="mt-1 text-sm text-slate-500">
                          Result: {round.result}
                        </p>
                      )}

                      {round.notes && (
                        <p className="mt-2 text-sm text-slate-600">
                          {round.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No interview rounds added yet.
                </p>
              )}
            </section>

            {/* Display application notes */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Notes
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {application.notes || "No notes added."}
              </p>
            </section>

            {/* Display rejection reason when applicable */}
            {application.rejectionReason && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">
                  Rejection Reason
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {application.rejectionReason}
                </p>
              </section>
            )}
          </div>

          {/* Additional application information */}
          <aside className="rounded-xl bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Application Information
            </h2>

            <div className="mt-5 space-y-5 text-sm">
              <div>
                <p className="text-slate-400">Current Status</p>
                <p className="mt-1 font-medium text-slate-700">
                  {application.status}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Applied Date</p>
                <p className="mt-1 font-medium text-slate-700">
                  {formatDate(application.appliedDate)}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Interview Date</p>
                <p className="mt-1 font-medium text-slate-700">
                  {formatDate(application.interviewDate)}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Follow-up Date</p>
                <p className="mt-1 font-medium text-slate-700">
                  {formatDate(application.followUpDate)}
                </p>
              </div>
            </div>

            {/* Link back to the original job */}
            {application.job?._id && (
              <Link
                to={`/jobs/${application.job._id}`}
                className="mt-6 block text-sm font-medium text-slate-900 hover:underline"
              >
                View Original Job →
              </Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;