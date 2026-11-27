import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Sidebar({ links }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-full md:w-64 md:h-screen md:fixed md:top-0 md:left-0 bg-gray-900 text-gray-200 flex md:flex-col">
      <div className="hidden md:flex p-5 items-center gap-3 border-b border-gray-700">
        <img src="https://3.imimg.com/data3/IU/NA/MY-4439715/hrms-500x500.jpg" alt="HRMS logo" className="w-8 h-8 rounded-lg object-cover" />
        <h2 className="text-lg font-semibold">HRMS</h2>
      </div>
      <nav aria-label="Main navigation" className="flex-1 min-w-0 px-2 md:px-4 py-3 md:py-4 overflow-x-auto md:overflow-y-auto">
        <div className="flex md:block gap-2 min-w-max md:min-w-0">
          {links.map((link) => {
            const active = location.pathname.endsWith(`/${link.to}`);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 py-2 px-3 mb-0 md:mb-2 rounded whitespace-nowrap transition ${active ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"}`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="p-2 md:p-4 md:border-t border-gray-700 flex items-center">
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded transition whitespace-nowrap">
          Logout
        </button>
      </div>
    </aside>
  );
}
