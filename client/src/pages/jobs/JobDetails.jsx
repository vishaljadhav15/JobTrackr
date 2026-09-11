import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [matchResult, setMatchResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");

  // Fetch the selected job using the ID from the URL
  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);

      // Store the job received from the backend
      setJob(response.data.data.job);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load job details");
    }
  };

  // Fetch resumes belonging to the logged-in user
  const fetchResumes = async () => {
    try {
      const response = await api.get("/resumes");

      // Store the user's resumes for resume matching
      setResumes(response.data.data.resumes);
    } catch (error) {
      setMatchError(
        error.response?.data?.message || "Failed to load resumes for matching",
      );
    }
  };

  // Check the selected resume against the current job
  const handleMatch = async () => {
    if (!selectedResume) {
      setMatchError("Please select a resume first.");
      return;
    }

    setMatching(true);
    setMatchError("");
    setMatchResult(null);

    try {
      const response = await api.post(`/jobs/${id}/match`, {
        resumeId: selectedResume,
      });

      // Store the matching result returned by the backend
      setMatchResult(response.data.data.match);
    } catch (error) {
      setMatchError(
        error.response?.data?.message || "Failed to match resume with this job",
      );
    } finally {
      setMatching(false);
    }
  };

  // Delete the current job after the user confirms the action
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    // Stop if the user cancels the confirmation
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      // Send the delete request to the backend
      await api.delete(`/jobs/${id}`);

      // Go back to the jobs list after successful deletion
      navigate("/jobs");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete job. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const loadJobDetails = async () => {
      setLoading(true);

      await Promise.all([fetchJob(), fetchResumes()]);

      setLoading(false);
    };

    loadJobDetails();
  }, [id]);

  // Show a loading message while the API requests are running
  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading job details...
      </div>
    );
  }

  // Show the backend error if the job could not be loaded
  if (error && !job) {
    return (
      <div>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>

        <Link
          to="/jobs"
          className="mt-4 inline-block text-sm font-medium text-slate-900 hover:underline"
        >
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-10 text-center text-slate-500">Job not found.</div>
    );
  }

  return (
    <div>
      {/* Back navigation */}
      <Link
        to="/jobs"
        className="mb-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to Jobs
      </Link>

      {/* Show job action error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Job header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>

              <p className="mt-2 text-lg font-medium text-slate-600">
                {job.company}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`/jobs/${job._id}/edit`)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Edit Job
              </button>

              <Link
                to={`/jobs/${job._id}/apply`}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Apply for Job
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </div>
        </div>

        {/* Basic job information */}
        <div className="grid gap-4 border-b border-slate-200 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Location
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {job.location || "Not specified"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Job Type
            </p>

            <p className="mt-1 font-medium text-slate-900">{job.jobType}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Work Mode
            </p>

            <p className="mt-1 font-medium text-slate-900">{job.workMode}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Salary
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {job.salaryMin || job.salaryMax
                ? `${job.currency || "INR"} ${
                    job.salaryMin || 0
                  } - ${job.salaryMax || job.salaryMin || 0}`
                : "Not specified"}
            </p>
          </div>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-3">
          {/* Main job information */}
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                Job Description
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {job.description || "No description provided."}
              </p>
            </section>

            {/* Display required skills */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Required Skills
              </h2>

              {job.skills?.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No skills added.</p>
              )}
            </section>

            {/* Resume matching section */}
            <section className="mt-8 rounded-xl border border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Resume Match
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Compare your resume skills with the skills required for this
                  job.
                </p>
              </div>

              {matchError && (
                <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {matchError}
                </div>
              )}

              {resumes.length === 0 ? (
                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    No resumes available. Upload a resume first to check the
                    match score.
                  </p>

                  <Link
                    to="/resume"
                    className="mt-3 inline-block text-sm font-medium text-slate-900 hover:underline"
                  >
                    Go to Resumes →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <select
                      value={selectedResume}
                      onChange={(e) => {
                        setSelectedResume(e.target.value);
                        setMatchResult(null);
                        setMatchError("");
                      }}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-900"
                    >
                      <option value="">Select a resume</option>

                      {resumes.map((resume) => (
                        <option key={resume._id} value={resume._id}>
                          {resume.title}
                          {resume.isDefault ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleMatch}
                      disabled={matching || !selectedResume}
                      className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {matching ? "Checking..." : "Check Match"}
                    </button>
                  </div>

                  {/* Match result */}
                  {matchResult && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      {/* Overall match score */}
                      <div className="rounded-xl bg-slate-50 p-6">
                        <div className="flex flex-col items-center text-center">
                          <p className="text-sm font-medium text-slate-500">
                            Overall Match
                          </p>

                          <p className="mt-2 text-5xl font-bold text-slate-900">
                            {matchResult.matchScore}%
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            {matchResult.totalMatchedSkills} of{" "}
                            {matchResult.totalRequiredSkills} required skills
                            matched
                          </p>

                          <div className="mt-4 h-3 w-full max-w-md overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-slate-900 transition-all"
                              style={{
                                width: `${matchResult.matchScore}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Match summary */}
                      <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-200 p-4">
                          <p className="text-xs font-medium uppercase text-slate-400">
                            Required Skills
                          </p>

                          <p className="mt-2 text-2xl font-bold text-slate-900">
                            {matchResult.totalRequiredSkills}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 p-4">
                          <p className="text-xs font-medium uppercase text-slate-400">
                            Matched
                          </p>

                          <p className="mt-2 text-2xl font-bold text-slate-900">
                            {matchResult.totalMatchedSkills}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 p-4">
                          <p className="text-xs font-medium uppercase text-slate-400">
                            Missing
                          </p>

                          <p className="mt-2 text-2xl font-bold text-slate-900">
                            {matchResult.totalMissingSkills}
                          </p>
                        </div>
                      </div>

                      {/* Matched and missing skills */}
                      <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 p-4">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Matched Skills
                          </h3>

                          {matchResult.matchedSkills?.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {matchResult.matchedSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                                >
                                  ✓ {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-slate-500">
                              No required skills matched.
                            </p>
                          )}
                        </div>

                        <div className="rounded-lg border border-slate-200 p-4">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Missing Skills
                          </h3>

                          {matchResult.missingSkills?.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {matchResult.missingSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                                >
                                  ✕ {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-slate-500">
                              No missing skills.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Skills detected from job title and description */}
                      {matchResult.detectedJobSkills?.length > 0 && (
                        <div className="mt-5 rounded-lg border border-slate-200 p-4">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Skills Detected from Job Description
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            These skills were automatically detected from the
                            job title and description.
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {matchResult.detectedJobSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Additional job information */}
          <aside className="rounded-xl bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Job Information
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-400">Application Deadline</p>

                <p className="mt-1 font-medium text-slate-700">
                  {job.applicationDeadline
                    ? new Date(job.applicationDeadline).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Job Source</p>

                {job.sourceUrl ? (
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all font-medium text-slate-700 hover:underline"
                  >
                    View Job Posting
                  </a>
                ) : (
                  <p className="mt-1 font-medium text-slate-700">
                    Not specified
                  </p>
                )}
              </div>

              <div>
                <p className="text-slate-400">Notes</p>

                <p className="mt-1 whitespace-pre-line font-medium text-slate-700">
                  {job.notes || "No notes added."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
