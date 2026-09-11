import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const EditApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    status: "Applied",
    appliedDate: "",
    interviewDate: "",
    followUpDate: "",
    contactPerson: "",
    notes: "",
    rejectionReason: "",
    interviewRounds: [],
  });

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch the existing application when the page opens
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await api.get(`/applications/${id}`);
        const application = response.data.data.application;

        // Store the job details for the page header
        setJob(application.job);

        // Fill the form with the existing application data
        setFormData({
          status: application.status || "Applied",
          appliedDate: application.appliedDate
            ? application.appliedDate.split("T")[0]
            : "",
          interviewDate: application.interviewDate
            ? application.interviewDate.split("T")[0]
            : "",
          followUpDate: application.followUpDate
            ? application.followUpDate.split("T")[0]
            : "",
          contactPerson: application.contactPerson || "",
          notes: application.notes || "",
          rejectionReason: application.rejectionReason || "",
          interviewRounds: application.interviewRounds || [],
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load application",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  // Update the main form fields
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Update a specific interview round
  const handleRoundChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedRounds = [...prev.interviewRounds];

      updatedRounds[index] = {
        ...updatedRounds[index],
        [field]: value,
      };

      return {
        ...prev,
        interviewRounds: updatedRounds,
      };
    });
  };

  // Add a new interview round
  const handleAddRound = () => {
    setFormData((prev) => ({
      ...prev,
      interviewRounds: [
        ...prev.interviewRounds,
        {
          round: "",
          date: "",
          result: "Pending",
          notes: "",
        },
      ],
    }));
  };

  // Remove an interview round
  const handleRemoveRound = (index) => {
    setFormData((prev) => ({
      ...prev,
      interviewRounds: prev.interviewRounds.filter(
        (_, roundIndex) => roundIndex !== index,
      ),
    }));
  };

  // Save the updated application to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/applications/${id}`, formData);

      // Return to the application details page after updating
      navigate(`/applications/${id}`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update application. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Show loading state while the application is being fetched
  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading application...
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Application
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the status and details of your application.
        </p>
      </div>

      {/* Show which job this application belongs to */}
      {job && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {job.title}
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {job.company}
          </p>

          {job.location && (
            <p className="mt-1 text-sm text-slate-500">
              {job.location}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Application status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Application Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
            >
              <option>Saved</option>
              <option>Applied</option>
              <option>Screening</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Accepted</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* Applied date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Applied Date
            </label>

            <input
              type="date"
              name="appliedDate"
              value={formData.appliedDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {/* Interview date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Interview Date
            </label>

            <input
              type="date"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {/* Follow-up date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Follow-up Date
            </label>

            <input
              type="date"
              name="followUpDate"
              value={formData.followUpDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {/* Contact person */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Contact Person
            </label>

            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. HR Manager - Priya"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {/* Interview rounds */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Interview Rounds
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track each interview round and its result.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRound}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                + Add Round
              </button>
            </div>

            {formData.interviewRounds.length === 0 ? (
              <div className="mt-4 rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">
                No interview rounds added yet.
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                {formData.interviewRounds.map((round, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-medium text-slate-900">
                        Round {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => handleRemoveRound(index)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      {/* Round name */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Round
                        </label>

                        <input
                          type="text"
                          value={round.round || ""}
                          onChange={(e) =>
                            handleRoundChange(
                              index,
                              "round",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. Technical Interview"
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                      </div>

                      {/* Round date */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Date
                        </label>

                        <input
                          type="date"
                          value={
                            round.date
                              ? round.date.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleRoundChange(
                              index,
                              "date",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                      </div>

                      {/* Round result */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Result
                        </label>

                        <select
                          value={round.result || "Pending"}
                          onChange={(e) =>
                            handleRoundChange(
                              index,
                              "result",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                        >
                          <option>Pending</option>
                          <option>Passed</option>
                          <option>Failed</option>
                        </select>
                      </div>

                      {/* Round notes */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Round Notes
                        </label>

                        <textarea
                          value={round.notes || ""}
                          onChange={(e) =>
                            handleRoundChange(
                              index,
                              "notes",
                              e.target.value,
                            )
                          }
                          rows="3"
                          placeholder="Add notes about this interview round..."
                          className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application notes */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Add notes about this application..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {/* Rejection reason */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Rejection Reason
            </label>

            <textarea
              name="rejectionReason"
              value={formData.rejectionReason}
              onChange={handleChange}
              rows="3"
              placeholder="Add rejection reason if applicable..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>
        </div>

        {/* Form actions */}
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/applications/${id}`)}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Application"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditApplication;