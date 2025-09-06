import React, { useEffect, useState } from "react";

export default function AdminUser() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({});
  const [message,setMessage] = useState("");
  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const authData = JSON.parse(localStorage.getItem("user"));
  if (!authData) {
    setMessage("Not logged in");
    return;
  }

  const requesterId = authData.user.id; // UUID of the logged-in user

  fetch("https://verigate-backend.onrender.com/get-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requesterId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.users) {
        setUsers(data.users);
      } else {
        setMessage(data.message || "Failed to load users");
      }
    })
    .catch(() => setMessage("Failed to load users"));
  };

  // Edit user
  const editUser = (user) => {
    setEditingUserId(user.id);
    setFormData(user);
  };

  // Save edited user
  const saveUser = async () => {
    try {
      const res = await fetch(`https://verigate-backend.onrender.com/edit-user/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updatedUser = await res.json();

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUserId ? updatedUser : user))
      );

      setEditingUserId(null);
      setFormData({});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between pb-6">
        <div>
          <h2 className="font-semibold text-gray-700">User Accounts</h2>
          <span className="text-xs text-gray-500">
            View accounts of registered users
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="ml-10 space-x-8 lg:ml-40">
            <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring hover:bg-blue-700">
              CSV
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-left text-xs font-semibold uppercase tracking-widest text-white">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Full Name</th>
                <th className="px-5 py-3">User Role</th>
                <th className="px-5 py-3">Created At</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-500">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    {user.id}
                  </td>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      user.fullName
                    )}
                  </td>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    {user.createdAt}
                  </td>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    {editingUserId === user.id ? (
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    ) : (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-green-200 text-green-900"
                            : user.status === "Suspended"
                            ? "bg-yellow-200 text-yellow-900"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {user.status}
                      </span>
                    )}
                  </td>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    {editingUserId === user.id ? (
                      <button
                        onClick={saveUser}
                        className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => editUser(user)}
                        className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
