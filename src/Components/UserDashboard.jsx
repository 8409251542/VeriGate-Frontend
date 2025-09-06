import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserDashboard = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("user"));
        if (!authData?.user?.id) {
          toast.error("User not logged in");
          return;
        }

        const res = await fetch("https://verigate-backend.onrender.com/get-user-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: authData.user.id }),
        });

        const data = await res.json();
        if (res.ok) {
          setDetails(data);
        } else {
          toast.error(data.message || "Failed to load user details");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authData");
    toast.success("Logged out successfully");
    window.location.href = "/login"; // redirect to login page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-lg">
        Failed to load user details
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-6 text-center">
          User Dashboard
        </h1>

        <div className="space-y-4">
          <p>
            <span className="font-semibold text-gray-700">Email:</span>{" "}
            {details.email}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Tokens Left:</span>{" "}
            {details.tokens_left}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Total Limit:</span>{" "}
            {details.max_limit}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Used Tokens:</span>{" "}
            {details.used}
          </p>

          {details.last_recharge ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Last Recharge</p>
              <p>
                Amount:{" "}
                <span className="text-green-600">
                  {details.last_recharge.usdt_amount} USDT
                </span>
              </p>
              <p>
                Date:{" "}
                {new Date(details.last_recharge.created_at).toLocaleString()}
              </p>
              <p>
                Status:{" "}
                <span
                  className={
                    details.last_recharge.status === "approved"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {details.last_recharge.status}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No recharge history</p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
