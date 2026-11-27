import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../api/axios";
import { indiaDate, indiaMinutes, localDateKey } from "../../utils/date";

export default function CheckInOut() {
  const [holidays, setHolidays] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const today = indiaDate();
  const todayRecord = attendance.find((record) => record.employeeId === user?.id && record.date === today);

  const refresh = async () => {
    const [holidayResponse, attendanceResponse, leaveResponse] = await Promise.all([
      api.get("/holidays"), api.get("/attendance"), api.get("/leaves")
    ]);
    setHolidays(holidayResponse.data);
    setAttendance(attendanceResponse.data);
    setLeaves(leaveResponse.data);
  };

  useEffect(() => {
    refresh().catch((err) => setError(err.response?.data?.message || "Unable to load attendance."))
      .finally(() => setLoading(false));
  }, []);

  const isHoliday = (date) => holidays.find((holiday) => holiday.date === localDateKey(date));
  const isPresent = (date) => attendance.find((record) =>
    record.employeeId === user?.id && record.date === localDateKey(date) && record.login
  );
  const isLeave = (date) => leaves.find((leave) =>
    leave.employeeId === user?.id && leave.status === "Approved" &&
    leave.startDate <= localDateKey(date) && leave.endDate >= localDateKey(date)
  );
  const isAbsent = (date) => {
    const key = localDateKey(date);
    return key < today || (key === today && indiaMinutes() >= 19 * 60);
  };

  const handleAttendance = async (action) => {
    setWorking(true);
    setError("");
    try {
      await api.post(action === "checkin" ? "/checkin" : "/checkout");
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Attendance update failed.");
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <p className="p-4 text-gray-500">Loading attendance...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Attendance Calendar</h2>
        <p className="text-gray-500 text-sm">Track your daily attendance</p>
      </div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <div className="bg-white p-3 sm:p-5 rounded-xl shadow overflow-x-auto">
        <Calendar
          tileClassName={({ date, view }) => {
            if (view !== "month") return "";
            if (isHoliday(date)) return "bg-purple-200";
            if (isLeave(date)) return "bg-yellow-200";
            if (isPresent(date)) return "bg-green-200";
            if (isAbsent(date)) return "bg-red-200";
            return "";
          }}
          tileContent={({ date, view }) => {
            if (view !== "month") return null;
            const holiday = isHoliday(date);
            return holiday ? <p className="text-xs text-purple-700 font-semibold">{holiday.name}</p> : null;
          }}
        />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-green-200 rounded" />Present</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-red-200 rounded" />Absent</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-200 rounded" />Leave</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-purple-200 rounded" />Holiday</span>
      </div>
      <div className="bg-white p-5 rounded-xl shadow space-y-3">
        <p className="font-medium">Today's attendance: {todayRecord?.logout ? "Checked out" : todayRecord?.login ? "Checked in" : "Not checked in"}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => handleAttendance("checkin")} disabled={working || Boolean(todayRecord)} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg">
            {working ? "Please wait..." : "Check In"}
          </button>
          <button onClick={() => handleAttendance("checkout")} disabled={working || !todayRecord?.login || Boolean(todayRecord?.logout)} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-lg">
            {working ? "Please wait..." : "Check Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
