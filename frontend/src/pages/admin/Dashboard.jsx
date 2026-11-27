import { useEffect, useState } from "react";
import api from "../../api/axios";
import Card from "../../components/Card";
import { indiaDate, indiaMinutes } from "../../utils/date";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
        setAdmin(loggedUser);

        const [empRes, attRes, leaveRes] = await Promise.all([
          api.get("/employees"),
          api.get("/attendance"),
          api.get("/leaves")
        ]);

        const employees = empRes.data;
        const attendance = attRes.data;
        const leaves = leaveRes.data;
        const today = indiaDate();
        const presentIds = new Set(
          attendance.filter((record) => record.date === today && record.login).map((record) => record.employeeId)
        );
        const leaveIds = new Set(
          leaves.filter((leave) =>
            leave.status === "Approved" &&
            leave.startDate <= today &&
            leave.endDate >= today &&
            !presentIds.has(leave.employeeId)
          ).map((leave) => leave.employeeId)
        );

        const present = presentIds.size;
        const onLeave = leaveIds.size;
        const isWorkdayOver = indiaMinutes() >= 19 * 60;

        setData({
          totalEmployees: employees.length,
          present,
          onLeave,
          absent: isWorkdayOver ? Math.max(0, employees.length - present - onLeave) : 0
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      }
    };

    fetchData();
  }, []);

  if (error) return <p role="alert" className="p-6 text-red-600">{error}</p>;
  if (!data) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6 bg-gray-100 p-4 sm:p-6 min-h-full">
      {admin && (
        <div className="bg-white p-5 rounded-xl shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Welcome, {admin.name}</h2>
            <p className="text-gray-500 text-sm">Admin Dashboard</p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-medium text-gray-700 break-all">{admin.email}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card title="Total Employees" value={data.totalEmployees} color="bg-blue-100 text-blue-600" />
        <Card title="Present Today" value={data.present} color="bg-green-100 text-green-600" />
        <Card title="Absent Today" value={data.absent} color="bg-red-100 text-red-600" />
        <Card title="On Leave Today" value={data.onLeave} color="bg-yellow-100 text-yellow-600" />
      </div>
      {indiaMinutes() < 19 * 60 && <p className="text-sm text-gray-500">Absence totals are finalized after 7:00 PM IST.</p>}
    </div>
  );
}
