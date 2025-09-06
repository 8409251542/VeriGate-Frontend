import React, { useState } from "react";
import UserDashboard from "./UserDashboard";
import UserNumberVerification from "./UserNumberVerification";
import UserPlans from "./UserPlans";
import BuyToken from "./UserBuyRequest";

export default function UserPanel({ user, setUser }) {
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activePage) {
      case "VerifyNumber":
        return <UserNumberVerification />;
      case "Plans":
        return <UserPlans />;
      case "UsdtToken":
        return <BuyToken />;
      case "dashboard":
      default:
        return <UserDashboard setUser={setUser} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-6">User Panel</h2>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActivePage("dashboard")}
              className={`w-full cursor-pointer text-left hover:text-red-600 ${
                activePage === "dashboard" ? "text-red-600 font-semibold" : ""
              }`}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActivePage("VerifyNumber")}
              className={`w-full cursor-pointer text-left hover:text-red-600 ${
                activePage === "VerifyNumber" ? "text-red-600 font-semibold" : ""
              }`}
            >
              Verify Number
            </button>
          </li>
          {/* <li>
            <button
              onClick={() => setActivePage("Plans")}
              className={`w-full cursor-pointer text-left hover:text-red-600 ${
                activePage === "Plans" ? "text-red-600 font-semibold" : ""
              }`}
            >
              Token Via UPI
            </button>
            
          </li> */}
          <li><button
              onClick={() => setActivePage("UsdtToken")}
              className={`w-full cursor-pointer text-left hover:text-red-600 ${
                activePage === "UsdtToken" ? "text-red-600 font-semibold" : ""
              }`}
            >
              Token Via Crypto
            </button></li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full cursor-pointer text-left text-gray-600 hover:text-red-600"
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
