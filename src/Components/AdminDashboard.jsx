import React, { useState, useEffect } from "react";

function AdminDashboard({ setUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch users from backend
  // useEffect(() => {
  //   fetchUsers();
  // }, []);

  // const fetchUsers = async () => {
  //   const res = await fetch("http://localhost:5000/get-users");
  //   const data = await res.json();
  //   setUsers(data.users || []);
  // };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };


  const addUser = async () => {
    const username = prompt("Enter new username:");
    const password = prompt("Enter password:");
    const limit = prompt("Enter limit:");

    const res = await fetch("http://localhost:5000/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, limit: parseInt(limit) }),
    });

    const data = await res.json();
    if (res.ok) setUsers(data.users);
    else alert(data.message);
  };

  const removeUser = (username) => {
    setUsers((prev) => prev.filter((u) => u.username !== username));
    // (You can also add a backend delete route later)
  };

  // Calculate stats
  const totalUsers = users.length;
  const totalLimit = users.reduce((sum, u) => +sum + u.limit, 0);
  const usedTokens = users.reduce((sum, u) => +sum + u.used, 0);
  const expiredUsers = users.filter((u) => u.used >= u.limit).length;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-red-600">Dashboard</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500">Total Users</p>
              <h2 className="text-3xl font-bold text-red-600 mt-2">
                {totalUsers}
              </h2>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500">Total Tokens</p>
              <h2 className="text-3xl font-bold text-green-600 mt-2">
                {totalLimit}
              </h2>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500">Used Tokens</p>
              <h2 className="text-3xl font-bold text-blue-600 mt-2">
                {usedTokens}
              </h2>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500">Expired Limit Users</p>
              <h2 className="text-3xl font-bold text-red-500 mt-2">
                {expiredUsers}
              </h2>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b font-bold text-red-600">User List</div>
            <table className="w-full text-left">
              <thead className="bg-purple-50">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Limit</th>
                  <th className="p-4">Used</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Remove User</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(
                    (u) =>
                      u.username &&
                      u.username.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((u) => (
                    <tr key={u.username} className="border-t">
                      <td className="p-4">{u.username}</td>
                      <td className="p-4">{u.limit}</td>
                      <td className="p-4">{u.used}</td>
                      <td
                        className={`p-4 font-bold ${
                          u.used >= u.limit ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {u.used >= u.limit ? "Expired" : "Active"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => removeUser(u.username)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Profile + Add User Button */}
          <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-red-600">Admin</h3>
              <p className="text-gray-500">Administrator</p>
              <div className="flex gap-2">
                <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600">
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
                >
                  Log Out
                </button>
              </div>
            </div>

            <button
              onClick={addUser}
              className="bg-green-600 h-12 text-white py-1 px-6 rounded-lg shadow hover:bg-green-700"
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
