import React, { useEffect, useState } from "react";

export default function AdminUser() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const authData = JSON.parse(localStorage.getItem("user"));
    if (!authData) {
      setMessage("Not logged in");
      return;
    }
    const requesterId = authData.user.id;

    fetch("https://verigate-backend.onrender.com/get-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
        else setMessage(data.message || "Failed to load users");
      })
      .catch(() => setMessage("Failed to load users"));
  };

  const editUser = (user) => {
    setEditingUserId(user.id);
    setFormData(user);
  };

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
    <div className="p-6">
      <h2 className="font-bold text-xl mb-4">User Accounts</h2>
      {message && <p className="text-red-600">{message}</p>}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">USDT Balance</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="px-4 py-2">{user.id}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                {editingUserId === user.id ? (
                  <input
                    type="number"
                    value={formData.usdt_balance}
                    onChange={(e) =>
                      setFormData({ ...formData, usdt_balance: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-24"
                  />
                ) : (
                  `${user.usdt_balance?.toFixed(2)} USDT`
                )}
              </td>
              <td className="px-4 py-2">{user.role || "User"}</td>
              <td className="px-4 py-2">{user.status || "Active"}</td>
              <td className="px-4 py-2">
                {editingUserId === user.id ? (
                  <button
                    onClick={saveUser}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => editUser(user)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
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
  );
}
