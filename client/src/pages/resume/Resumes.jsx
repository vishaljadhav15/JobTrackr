import { useEffect, useState } from "react";
import api from "../../services/api";

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    resume: null,
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all resumes belonging to the logged-in user
  const fetchResumes = async () => {
    try {
      const response = await api.get("/resumes");
      setResumes(response.data.data.resumes);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Update the form when the user changes an input
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    // Clear previous file validation error when a new file is selected
    if (files?.[0]) {
      setError("");
    }
  };

  // Upload the selected resume
  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Resume title is required");
      return;
    }

    if (!formData.resume) {
      setError("Please select a PDF resume");
      return;
    }

    if (
      formData.resume.type !== "application/pdf" ||
      !formData.resume.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Only PDF files are allowed");
      return;
    }

    if (formData.resume.size > 5 * 1024 * 1024) {
      setError("Resume file must be smaller than 5 MB");
      return;
    }

    const uploadData = new FormData();

    uploadData.append("title", formData.title.trim());
    uploadData.append("resume", formData.resume);

    setUploading(true);

    try {
      await api.post("/resumes", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Clear the form after successful upload
      setFormData({
        title: "",
        resume: null,
      });

      setShowUploadForm(false);

      // Refresh the resume list
      await fetchResumes();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to upload resume. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id) => {
    setError("");

    try {
      const response = await api.put(`/resumes/${id}`, {
        isDefault: true,
      });

      const updatedResume = response.data.data.resume;

      setResumes((prev) =>
        prev.map((resume) => ({
          ...resume,
          isDefault: resume._id === updatedResume._id,
        })),
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to set default resume. Please try again.",
      );
    }
  };

  // Delete a resume after confirmation
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await api.delete(`/resumes/${id}`);

      // Remove the deleted resume from the current list
      setResumes((prev) => prev.filter((resume) => resume._id !== id));
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete resume. Please try again.",
      );
    }
  };

  // Show loading state while resumes are being fetched
  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">Loading resumes...</div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resumes</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your resumes and use them for job matching.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowUploadForm((prev) => !prev);
            setError("");
          }}
          className="w-fit rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {showUploadForm ? "Close Upload" : "Upload Resume"}
        </button>
      </div>

      {/* Show API and validation errors */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Upload form */}
      {showUploadForm && (
        <form
          onSubmit={handleUpload}
          className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Upload Resume
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload a PDF resume up to 5 MB.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Resume Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. React JS Developer Resume"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Resume File
              </label>

              <input
                type="file"
                name="resume"
                accept=".pdf,application/pdf"
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {resumes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <h2 className="font-semibold text-slate-900">
            No resumes uploaded yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Upload your resume to start using resume-job matching.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {/* Resume title and default badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {resume.title}
                  </h2>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {resume.fileName}
                  </p>
                </div>

                {resume.isDefault && (
                  <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                    Default
                  </span>
                )}
              </div>

              {/* Resume file information */}
              <div className="mt-5 space-y-2 text-sm text-slate-500">
                <p>
                  <span className="font-medium text-slate-700">Type:</span>{" "}
                  {resume.fileType?.toUpperCase()}
                </p>

                <p>
                  <span className="font-medium text-slate-700">Size:</span>{" "}
                  {resume.fileSize
                    ? `${(resume.fileSize / 1024).toFixed(1)} KB`
                    : "Unknown"}
                </p>
              </div>

              {/* Extracted skills */}
              <div className="mt-5">
                <h3 className="text-sm font-medium text-slate-700">
                  Extracted Skills
                </h3>

                {resume.skills?.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {resume.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No skills detected.
                  </p>
                )}
              </div>

              {/* Resume actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-4">
                  {resume.fileUrl ? (
                    <a
                      href={
                        resume.fileUrl?.startsWith("http")
                          ? resume.fileUrl
                          : `http://localhost:5000${resume.fileUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      View Resume →
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">
                      File unavailable
                    </span>
                  )}

                  {!resume.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(resume._id)}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(resume._id)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resumes;
