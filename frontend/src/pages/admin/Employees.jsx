import { useEffect, useState } from "react";
import api from "../../api/axios";
import { indiaDate, indiaWeekStart } from "../../utils/date";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const today = indiaDate();

  useEffect(() => {
    Promise.all([api.get("/employees"), api.get("/attendance"), api.get("/leaves")])
      .then(([empRes, attRes, leaveRes]) => {
        setEmployees(empRes.data);
        setAttendance(attRes.data);
        setLeaves(leaveRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load employees."))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

  const calculateStats = (empId) => {
    const monthRecords = attendance.filter((record) =>
      record.employeeId === empId && record.date?.startsWith(today.slice(0, 7)) && record.login && record.logout
    );
    const weeklyRecords = attendance.filter((record) =>
      record.employeeId === empId && record.date >= indiaWeekStart() && record.login && record.logout
    );
    const minutesWorked = (record) => {
      const [lh, lm] = record.login.split(":").map(Number);
      const [oh, om] = record.logout.split(":").map(Number);
      return Math.max(0, oh * 60 + om - (lh * 60 + lm));
    };
    const totalMonth = monthRecords.reduce((total, record) => total + minutesWorked(record), 0);
    const totalWeek = weeklyRecords.reduce((total, record) => total + minutesWorked(record), 0);
    return {
      loginDays: attendance.filter((record) => record.employeeId === empId && record.date?.startsWith(today.slice(0, 7)) && record.login).length,
      avgHours: formatTime(monthRecords.length ? Math.floor(totalMonth / monthRecords.length) : 0),
      weeklyTotal: formatTime(totalWeek)
    };
  };

  const getEmployeeStatus = (empId) => {
    if (attendance.some((record) => record.employeeId === empId && record.date === today && record.login)) return "Active";
    if (leaves.some((leave) =>
      leave.employeeId === empId && leave.status === "Approved" &&
      leave.startDate <= today && leave.endDate >= today
    )) return "On Leave";
    return "Inactive";
  };

  const query = search.trim().toLowerCase();
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(query) ||
    employee.email.toLowerCase().includes(query) ||
    employee.phone.includes(query)
  );

  if (loading) return <div className="p-6">Loading employees...</div>;
  if (error) return <p role="alert" className="p-6 text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="text-gray-500 text-sm">Showing {filteredEmployees.length} of {employees.length} employees</p>
        </div>
        <input type="search" aria-label="Search employees" placeholder="Search employees..." value={search} onChange={(event) => setSearch(event.target.value)} className="border rounded-lg p-2 w-full sm:w-64" />
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredEmployees.length === 0 && <p className="text-gray-500">No employees found</p>}
        {filteredEmployees.map((employee) => {
          const status = getEmployeeStatus(employee.id);
          const stats = calculateStats(employee.id);
          return (
            <article key={employee.id} className="bg-white border rounded-xl p-5 text-center hover:shadow-lg transition">
              <img src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&size=128&name=${encodeURIComponent(employee.name)}`} alt="" className="w-20 h-20 rounded-full mx-auto border" />
              <h3 className="font-semibold mt-3">{employee.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${status === "Active" ? "bg-green-100 text-green-600" : status === "On Leave" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}>{status}</span>
              <div className="mt-3 text-left text-sm space-y-1 break-words">
                <p><strong>Email:</strong> {employee.email}</p>
                <p><strong>Phone:</strong> {employee.phone}</p>
                <p><strong>Address:</strong> {employee.address}</p>
                <hr className="my-2" />
                <p><strong>Login Days:</strong> {stats.loginDays}</p>
                <p><strong>Avg Login Hours:</strong> {stats.avgHours}</p>
                <p><strong>Weekly Total:</strong> {stats.weeklyTotal}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
