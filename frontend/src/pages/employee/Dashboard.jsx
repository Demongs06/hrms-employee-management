import { useEffect, useState } from "react";
import api from "../../api/axios";
import Card from "../../components/Card";
import { indiaDate, indiaWeekStart } from "../../utils/date";

const formatTime = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    attended: 0, avgHours: "0h 0m", late: "0h 0m",
    early: "0h 0m", overtime: "0h 0m", earlyLogout: "0h 0m"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedUser = JSON.parse(sessionStorage.getItem("user") || "null");
        setUser(loggedUser);
        const [attRes, holRes] = await Promise.all([api.get("/attendance"), api.get("/holidays")]);
        const attendance = attRes.data.filter((record) => record.employeeId === loggedUser?.id);
        const holidays = new Set(holRes.data.map((holiday) => holiday.date));
        const today = indiaDate();
        const monthPrefix = today.slice(0, 7);
        const weekStart = indiaWeekStart();
        const monthly = attendance.filter((record) =>
          record.date?.startsWith(monthPrefix) && !holidays.has(record.date) && record.login
        );
        const weekly = attendance.filter((record) => record.date >= weekStart && record.login);

        let totalMinutes = 0;
        let lateMinutes = 0;
        let earlyMinutes = 0;
        let overtimeMinutes = 0;
        let earlyLogoutMinutes = 0;

        for (const record of monthly) {
          if (!record.logout) continue;
          const [loginHour, loginMinute] = record.login.split(":").map(Number);
          const [logoutHour, logoutMinute] = record.logout.split(":").map(Number);
          const worked = logoutHour * 60 + logoutMinute - (loginHour * 60 + loginMinute);
          totalMinutes += Math.max(0, worked);
        }

        for (const record of weekly) {
          const [loginHour, loginMinute] = record.login.split(":").map(Number);
          const login = loginHour * 60 + loginMinute;
          lateMinutes += Math.max(0, login - 600);
          earlyMinutes += Math.max(0, 600 - login);
          if (!record.logout) continue;
          const [logoutHour, logoutMinute] = record.logout.split(":").map(Number);
          const logout = logoutHour * 60 + logoutMinute;
          overtimeMinutes += Math.max(0, logout - 1140);
          earlyLogoutMinutes += Math.max(0, 1140 - logout);
        }

        const completedDays = monthly.filter((record) => record.logout).length;
        setStats({
          attended: monthly.length,
          avgHours: formatTime(completedDays ? Math.floor(totalMinutes / completedDays) : 0),
          late: formatTime(lateMinutes),
          early: formatTime(earlyMinutes),
          overtime: formatTime(overtimeMinutes),
          earlyLogout: formatTime(earlyLogoutMinutes)
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load attendance summary.");
      }
    };
    fetchData();
  }, []);

  if (error) return <p role="alert" className="p-6 text-red-600">{error}</p>;
  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-semibold">Welcome, {user.name}</h2>
          <p className="text-gray-500 text-sm">Employee Dashboard</p>
        </div>
        <p className="text-sm text-gray-500 break-all">{user.email}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Attended Days (Month)" value={stats.attended} />
        <Card title="Avg Login Hours (Month)" value={stats.avgHours} />
        <Card title="Overtime (Week)" value={stats.overtime} />
        <Card title="Early Login (Week)" value={stats.early} />
        <Card title="Late Login (Week)" value={stats.late} />
        <Card title="Early Logout (Week)" value={stats.earlyLogout} />
      </div>
    </div>
  );
}
