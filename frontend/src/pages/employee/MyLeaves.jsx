import { useEffect, useState } from "react";
import api from "../../api/axios";

const formatDate = (value) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
});

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/leaves")
      .then((response) => setLeaves(response.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load leave requests."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-white p-8 rounded-xl shadow text-center">Loading leave requests...</div>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">My Leave Applications</h2>
        <p className="text-gray-500 text-sm">Track your leave requests and approval status</p>
      </div>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead className="bg-gray-100 text-left">
            <tr><th className="p-4">From</th><th className="p-4">To</th><th className="p-4">Type</th><th className="p-4">Status</th></tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan="4" className="text-center p-6 text-gray-500">No leave applications found</td></tr>
            ) : leaves.map((leave) => (
              <tr key={leave.id} className="border-t">
                <td className="p-4">{formatDate(leave.startDate)}</td>
                <td className="p-4">{formatDate(leave.endDate)}</td>
                <td className="p-4 font-medium">{leave.type}</td>
                <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${leave.status === "Approved" ? "bg-green-100 text-green-700" : leave.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{leave.status || "Pending"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
