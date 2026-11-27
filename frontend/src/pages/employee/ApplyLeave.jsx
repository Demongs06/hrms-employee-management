import { useState } from "react";
import api from "../../api/axios";
import { indiaDate } from "../../utils/date";

export default function ApplyLeave() {
  const [type, setType] = useState("PL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = indiaDate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!startDate || !endDate || !reason.trim()) {
      setError("Please complete every field.");
      return;
    }
    if (startDate < today || endDate < startDate) {
      setError("Choose a valid future date range.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/leaves", { type, startDate, endDate, reason: reason.trim() });
      setType("PL");
      setStartDate("");
      setEndDate("");
      setReason("");
      setError("Leave request submitted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply leave.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow w-full max-w-xl space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Apply for Leave</h2>
          <p className="text-gray-500 text-sm">Submit a leave request for approval</p>
        </div>
        {error && <p role="status" className={error.includes("successfully") ? "text-green-700" : "text-red-600"}>{error}</p>}
        <div>
          <label htmlFor="leave-type" className="block text-sm font-medium mb-1">Leave Type</label>
          <select id="leave-type" value={type} onChange={(event) => setType(event.target.value)} className="w-full border rounded-lg p-2">
            <option value="PL">Paid Leave (PL)</option>
            <option value="SL">Sick Leave (SL)</option>
            <option value="EL">Emergency Leave (EL)</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="leave-start" className="block text-sm font-medium mb-1">Start Date</label>
            <input id="leave-start" type="date" min={today} value={startDate} onChange={(event) => { setStartDate(event.target.value); if (endDate && event.target.value > endDate) setEndDate(event.target.value); }} className="w-full border rounded-lg p-2" required />
          </div>
          <div>
            <label htmlFor="leave-end" className="block text-sm font-medium mb-1">End Date</label>
            <input id="leave-end" type="date" min={startDate || today} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-full border rounded-lg p-2" required />
          </div>
        </div>
        <div>
          <label htmlFor="leave-reason" className="block text-sm font-medium mb-1">Reason</label>
          <textarea id="leave-reason" rows="4" maxLength={1000} placeholder="Explain the reason for leave..." value={reason} onChange={(event) => setReason(event.target.value)} className="w-full border rounded-lg p-2" required />
          <p className="text-xs text-gray-500 text-right">{reason.length}/1000</p>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </div>
  );
}
