import React, { useState, useEffect } from 'react';

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Replace with your actual admin ID from authentication/props/context
   const authData = JSON.parse(localStorage.getItem("user"));
    const adminId = authData?.user?.id;
   // Form state for adding new user
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    max_limit: 10000
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear success message after 3 seconds
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
      
      const response = await fetch('https://verigate-backend.onrender.com/get-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    // Validate inputs
    if (!newUser.email || !newUser.password) {
      setError('Email and password are required');
      return;
    }

    if (!newUser.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setAddUserLoading(true);
      setError(null);
      
      const response = await fetch('https://verigate-backend.onrender.com/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId: adminId,
          email: newUser.email,
          password: newUser.password,
          max_limit: parseInt(newUser.max_limit) || 10000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }
      
      const data = await response.json();
      
      // Update users list with the returned data from your API
      setUsers(data.users || []);
      
      // Reset form and close modal
      setNewUser({ email: '', password: '', max_limit: 10000 });
      setShowAddModal(false);
      setSuccessMessage(data.message || 'User added successfully!');
      
    } catch (err) {
      setError(err.message);
      console.error('Error adding user:', err);
    } finally {
      setAddUserLoading(false);
    }
  };

  const getUsagePercentage = (used, max_limit) => {
    if (!max_limit) return 0;
    return Math.round((used / max_limit) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-800 bg-red-200';
    if (percentage >= 70) return 'text-yellow-800 bg-yellow-200';
    return 'text-green-800 bg-green-200';
  };

  const filteredUsers = users.filter(user => 
    user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLimit = users.reduce((sum, u) => sum + (u.max_limit || 0), 0);
  const totalUsed = users.reduce((sum, u) => sum + (u.used || 0), 0);
  const activeUsers = users.filter(u => (u.used || 0) < (u.max_limit || 0)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
        <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-red-700">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 border-2 border-red-200 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-red-800 mb-2 flex items-center">
                <svg className="w-8 h-8 mr-3 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                User Management
              </h1>
              <p className="text-red-600">Manage user accounts and verification limits</p>
            </div>
            
            <div className="flex gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              {/* Add User Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <strong className="font-bold">Error: </strong>
              <span className="ml-1">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-red-800">{users.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Limit</p>
                <p className="text-2xl font-bold text-red-800">{totalLimit.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Used</p>
                <p className="text-2xl font-bold text-red-800">{totalUsed.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-red-800">{activeUsers}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const usagePercentage = getUsagePercentage(user.used || 0, user.max_limit || 0);
            const usageColorClass = getUsageColor(usagePercentage);
            
            return (
              <div
                key={user.id}
                className="bg-white rounded-xl p-6 border border-red-200 shadow-md hover:shadow-lg transition-all duration-300 hover:border-red-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">User Account</h3>
                    <p className="text-xs text-red-600 font-mono bg-red-50 px-2 py-1 rounded break-all">
                      {user.id}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${usageColorClass}`}>
                    {usagePercentage}% used
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Usage Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-red-700 mb-2">
                      <span>Usage Progress</span>
                      <span>{(user.used || 0).toLocaleString()} / {(user.max_limit || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          usagePercentage >= 90 ? 'bg-red-600' :
                          usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-red-800">{(user.max_limit || 0).toLocaleString()}</div>
                      <div className="text-xs text-red-600">Max Limit</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-red-700">{(user.used || 0).toLocaleString()}</div>
                      <div className="text-xs text-red-600">Used</div>
                    </div>
                  </div>

                  {/* Remaining */}
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-700">Remaining:</span>
                      <span className="text-red-800 font-semibold">
                        {((user.max_limit || 0) - (user.used || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button 
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium"
                    onClick={() => console.log('View details for user:', user.id)}
                  >
                    View Details
                  </button>
                  <button 
                    className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200 text-sm"
                    onClick={() => fetchUsers()}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Users Found */}
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-700">
              {searchTerm ? 'No users found matching your search' : 'No users found'}
            </h3>
            <p className="text-red-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first user'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
              >
                Add First User
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-red-800">Add New User</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                }}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="user@example.com"
                  disabled={addUserLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Minimum 6 characters"
                  disabled={addUserLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  Max Verification Limit
                </label>
                <input
                  type="number"
                  value={newUser.max_limit}
                  onChange={(e) => setNewUser(prev => ({ ...prev, max_limit: parseInt(e.target.value) || 10000 }))}
                  className="w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  min="1"
                  disabled={addUserLoading}
                />
                <p className="text-xs text-red-600 mt-1">Default: 10,000 verifications</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200"
                  disabled={addUserLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                  disabled={addUserLoading}
                >
                  {addUserLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    'Add User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementDashboard;