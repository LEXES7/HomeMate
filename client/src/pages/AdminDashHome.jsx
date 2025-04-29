import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'flowbite-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export default function AdminDashHome() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [nonAdminCount, setNonAdminCount] = useState(0);
  const [username, setUsername] = useState('Admin');
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    fetchUserCounts();
    setGreetingBasedOnTime();
    fetchUsername();
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserCounts = async () => {
    try {
      const response = await axios.get('/api/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const users = response.data;
      const admins = users.filter((user) => user.isAdmin).length;
      const nonAdmins = users.length - admins;

      setTotalUsers(users.length);
      setAdminCount(admins);
      setNonAdminCount(nonAdmins);
    } catch (error) {
      console.error('Error fetching user counts:', error);
    }
  };

  const fetchUsername = async () => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsername(response.data.username || 'Admin');
    } catch (error) {
      console.error('Error fetching username:', error);
      setUsername('Admin');
    }
  };

  const setGreetingBasedOnTime = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  };

  const updateTime = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCurrentTime(formattedTime);
  };

  // Pie chart data
  const chartData = {
    labels: ['Admins', 'Non-Admins'],
    datasets: [
      {
        label: 'User Roles',
        data: [adminCount, nonAdminCount],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderColor: ['#2563eb', '#059669'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Greeting Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
            {greeting}, {username}!
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Welcome to the Admin Dashboard.
          </p>
        </div>
        <p className="mt-2 sm:mt-0 text-lg sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-md">
          {currentTime}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-100 dark:bg-blue-900 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-300">U</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold">Total Users</h3>
              <p className="text-lg sm:text-xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-100 dark:bg-green-900 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
              <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-300">A</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold">Admins</h3>
              <p className="text-lg sm:text-xl font-bold">{adminCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-100 dark:bg-yellow-900 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-200 dark:bg-yellow-800 rounded-full">
              <span className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-300">N</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold">Non-Admins</h3>
              <p className="text-lg sm:text-xl font-bold">{nonAdminCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pie Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">User Roles Overview</h2>
        <div className="h-64 sm:h-96">
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Admin Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin?tab=users">
        <Card className="bg-red-100 dark:bg-red-900 shadow-md hover:shadow-lg transition-shadow duration-300">
           
            <h3 className="text-sm sm:text-base font-semibold">Manage Users</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View, edit, or delete user accounts.
            </p>
          </Card>
          </Link>
          <Card className="bg-gray-100 dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-sm sm:text-base font-semibold">View Logs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access system logs for monitoring activities.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}