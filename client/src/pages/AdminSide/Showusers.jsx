import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Card, Button } from 'flowbite-react';
import { HiOutlineUsers, HiOutlineUser, HiOutlineShieldCheck, HiTrash } from 'react-icons/hi';

export default function ShowUsers() {
  const [users, setUsers] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const { theme } = useSelector((state) => state.theme); // Get the current theme from Redux

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user`, {
          credentials: 'include', // Include cookies for auth
        });
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data); // Fetch from MongoDB
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle delete user
  const handleDelete = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/delete/${userId}`, {
        method: 'DELETE',
        credentials: 'include', 
      });
      if (!res.ok) {
        throw new Error('Failed to delete user');
      }
      setUsers(users.filter((user) => user._id !== userId)); 
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.isAdmin).length;
  const totalNonAdmins = totalUsers - totalAdmins;

  return (
    <div
      className={`p-4 sm:p-6 min-h-screen ${
        theme === 'dark' ? 'bg-[rgb(16,23,42)] text-gray-200' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8">Registered Users</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <HiOutlineUsers className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Total Users</h3>
              <p className="text-xl sm:text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <HiOutlineUser className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Non-Admins</h3>
              <p className="text-xl sm:text-2xl font-bold">{totalNonAdmins}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <HiOutlineShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Admins</h3>
              <p className="text-xl sm:text-2xl font-bold">{totalAdmins}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Scrollable Table */}
      <div className="max-h-[60vh] overflow-y-auto rounded-lg shadow-md">
        <Table hoverable className="min-w-full bg-white dark:bg-gray-800">
          <Table.Head>
            <Table.HeadCell className="px-4 py-3 text-sm sm:text-base">Username</Table.HeadCell>
            <Table.HeadCell className="px-4 py-3 text-sm sm:text-base">Email</Table.HeadCell>
            <Table.HeadCell className="px-4 py-3 text-sm sm:text-base">Admin</Table.HeadCell>
            <Table.HeadCell className="px-4 py-3 text-sm sm:text-base">Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {users.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  No users found.
                </Table.Cell>
              </Table.Row>
            ) : (
              users.map((user) => (
                <Table.Row
                  key={user._id}
                  className="text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Table.Cell className="px-4 py-4 text-sm sm:text-base font-medium">
                    {user.username}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4 text-sm sm:text-base">{user.email}</Table.Cell>
                  <Table.Cell className="px-4 py-4 text-sm sm:text-base">
                    {user.isAdmin ? (
                      <span className="text-green-600 dark:text-green-300 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-300 font-semibold">No</span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    <Button
                      color="failure"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                      className="flex items-center mx-auto text-sm sm:text-base"
                    >
                      <HiTrash className="mr-1 sm:mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}