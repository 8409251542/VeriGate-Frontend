import React, { useState, useEffect } from 'react';

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const authData = JSON.parse(localStorage.getItem("user"));
  const adminId = authData?.user?.id;

  // Form state for adding new user
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    usdt_balance: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://nexauthapi.vercel.app/get-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: adminId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      setError('Email and password are required');
      return;
    }
    try {
      setAddUserLoading(true);
      setError(null);

      const response = await fetch('https://nexauthapi.vercel.app/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: adminId,
          email: newUser.email,
          password: newUser.password,
          usdt_balance: parseFloat(newUser.usdt_balance) || 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setNewUser({ email: '', password: '', usdt_balance: 0 });
      setShowAddModal(false);
      setSuccessMessage(data.message || 'User added successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBalance = users.reduce((sum, u) => sum + (u.usdt_balance || 0), 0);

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Total Users</p>
          <h2 className="text-xl font-bold">{users.length}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p>Total USDT Balance</p>
          <h2 className="text-xl font-bold">{totalBalance.toFixed(2)} USDT</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p>Search</p>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search user ID"
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      </div>

      {/* Users */}
      <div className="grid grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{user.email}</h3>
            <p>ID: {user.id}</p>
            <p>USDT Balance: {user.usdt_balance?.toFixed(2)} USDT</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagementDashboard;
