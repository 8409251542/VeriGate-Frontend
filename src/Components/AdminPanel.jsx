import React, { useState } from "react";

import AdminUser from "./AdminUser";

import AdminHistoryDashboard from "./AdminUsersData";
import PurchaseAdmin from "./AdminTokenApprovel";
import AdminDashboard from "./AdminDashboard";
import UserNumberVerification from "./UserNumberVerification";
import AdminServerManager from "./AdminServerManager";
import AdminVerificationSettings from "./AdminVerificationSettings";

export default function AdminPanel({ user, setUser }) {
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <AdminHistoryDashboard />;
      case "addUser":
        return <UserNumberVerification />;
      case "approval":
        return <PurchaseAdmin />;
      case "settings":
        return <AdminVerificationSettings />;
      case "adminUser":
        return <AdminUser />;
      case "serverManager":
        return <AdminServerManager />;
      case "dashboard":
      default:
        return <AdminDashboard setUser={setUser} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActivePage("dashboard")}
              className={`w-full text-left hover:text-red-600 ${activePage === "dashboard" ? "text-red-600 font-semibold" : ""
                }`}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActivePage("users")}
              className={`w-full text-left hover:text-red-600 ${activePage === "users" ? "text-red-600 font-semibold" : ""
                }`}
            >
              Users Data
            </button>
          </li>
          <li>
            <button
              onClick={() => setActivePage("addUser")}
              className={`w-full text-left hover:text-red-600 ${activePage === "addUser" ? "text-red-600 font-semibold" : ""
                }`}
            >
              Verfiy Mobile Number
            </button>
          </li>
          <li>
            <button
              onClick={() => setActivePage("adminUser")}
              className={`w-full text-left hover:text-red-600 ${activePage === "adminUser" ? "text-red-600 font-semibold" : ""
                }`}
            >
              All Users
            </button>
          </li>
          <li>
            <button
              onClick={() => setActivePage("serverManager")}
              className={`w-full text-left hover:text-red-600 ${activePage === "serverManager" ? "text-red-600 font-semibold" : ""
                }`}
            >
              Manage RDPs
            </button>
          </li>
          <li>
            <button
              onClick={() => setActivePage("approval")}
              className={`w-full text-left hover:text-red-600 ${activePage === "approval" ? "text-red-600 font-semibold" : ""
                }`}
            >
              Approval
            </button>
          </li>
          <li>
            <button
              onClick={() => setActivePage("settings")}
              className={`w-full text-left hover:text-red-600 ${activePage === "settings" ? "text-red-600 font-semibold" : ""
                }`}
            >
              Verification Settings
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left text-gray-600 hover:text-red-600"
            >
              Log Out
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}
