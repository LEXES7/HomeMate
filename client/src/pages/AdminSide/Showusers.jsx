import React, { useEffect, useState } from 'react';

export default function ShowUsers() {
  const [users, setUsers] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user`); 
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Registered Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Username</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="text-center">
                <td className="px-4 py-2 border">{user.username}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">
                  {user.isAdmin ? (
                    <span className="text-green-500 font-semibold">Yes</span>
                  ) : (
                    <span className="text-red-500 font-semibold">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}