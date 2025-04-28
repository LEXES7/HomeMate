import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'flowbite-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

axios.defaults.baseURL = 'http://localhost:8000'; // Backend URL
axios.defaults.withCredentials = true; // Enable cookies

export default function DashHome() {
  const [totalAppliances, setTotalAppliances] = useState(0);
  const [totalEssentials, setTotalEssentials] = useState(0);
  const [totalClothing, setTotalClothing] = useState(0);
  const [username, setUsername] = useState('User'); // Default username fallback
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchTotalAppliances();
    fetchTotalEssentials();
    fetchTotalClothing();
    setGreetingBasedOnTime();
    fetchUsername(); // Fetch the username from the backend
  }, []);

  const fetchTotalAppliances = async () => {
    try {
      const response = await axios.get('/api/appliances', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTotalAppliances(response.data.length); // Count total appliances
    } catch (error) {
      console.error('Error fetching total appliances:', error);
    }
  };

  const fetchTotalEssentials = async () => {
    try {
      const response = await axios.get('/api/essentials', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTotalEssentials(response.data.length); // Count total essential items
    } catch (error) {
      console.error('Error fetching total essentials:', error);
    }
  };

  const fetchTotalClothing = async () => {
    try {
      const response = await axios.get('/api/clothing', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTotalClothing(response.data.length); // Count total clothing items
    } catch (error) {
      console.error('Error fetching total clothing:', error);
    }
  };

  const fetchUsername = async () => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsername(response.data.username || 'User'); // Set username from backend response
    } catch (error) {
      console.error('Error fetching username:', error);
      setUsername('User'); // Fallback to default username
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

  // Data for the bar chart
  const chartData = {
    labels: ['Appliances', 'Essentials', 'Clothing'],
    datasets: [
      {
        label: 'Total Items',
        data: [totalAppliances, totalEssentials, totalClothing],
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'], // Colors for each bar
        borderColor: ['#2563eb', '#059669', '#7c3aed'], // Border colors
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow resizing
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280', // Gray color for x-axis labels
        },
      },
      y: {
        ticks: {
          color: '#6b7280', // Gray color for y-axis labels
        },
      },
    },
  };

  return (
    <div className="p-6">
      {/* Greeting Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {greeting}, {username}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Here's an overview of your items.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-100 dark:bg-blue-900 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">A</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Total Appliances</h3>
              <p className="text-xl sm:text-2xl font-bold">{totalAppliances}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-100 dark:bg-green-900 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
              <span className="text-2xl font-bold text-green-600 dark:text-green-300">E</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Total Essentials</h3>
              <p className="text-xl sm:text-2xl font-bold">{totalEssentials}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-100 dark:bg-purple-900 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-full">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">C</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Total Clothing</h3>
              <p className="text-xl sm:text-2xl font-bold">{totalClothing}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Items Overview</h2>
        <div className="h-64"> {/* Adjust height for a smaller chart */}
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}