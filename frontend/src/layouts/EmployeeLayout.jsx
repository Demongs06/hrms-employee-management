import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function EmployeeLayout() {
  const links = [
    { to: "dashboard", label: "Dashboard" },
    { to: "checkin", label: "Check In/Out" },
    { to: "payslips", label: "Payslips" },
    { to: "leave", label: "Apply Leave" },
    { to: "my-leaves", label: "My Leaves" }
  ];

  return (
    <div className="min-h-screen md:flex">
      <Sidebar links={links} />
      <main className="md:ml-64 flex-1 min-w-0 p-4 sm:p-6 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
