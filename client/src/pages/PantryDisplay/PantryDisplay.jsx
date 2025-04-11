import React, { useState, useEffect } from 'react';
import { Card } from 'flowbite-react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export default function UserDashboard() {
  const [pantryItems, setPantryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/pantry', { withCredentials: true });
      setPantryItems(response.data || []);
      setFilteredItems(response.data || []);
    } catch (error) {
      console.error('Fetch pantry items error:', error.response?.data);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to fetch pantry items');
      }
      setPantryItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = pantryItems.filter((item) =>
      item.title.toLowerCase().includes(query)
    );
    setFilteredItems(filtered);
  };

  const handleSortChange = (e) => {
    const order = e.target.value;
    setSortOrder(order);

    const sorted = [...filteredItems].sort((a, b) => {
      if (order === 'lowToHigh') {
        return a.price - b.price;
      } else if (order === 'highToLow') {
        return b.price - a.price;
      }
      return 0;
    });

    setFilteredItems(sorted);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    if (category === '') {
      setFilteredItems(pantryItems); // Show all items if no category is selected
    } else {
      const filtered = pantryItems.filter((item) => item.content === category);
      setFilteredItems(filtered);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pantry & Grocery Page</h1>
<br></br>
      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        {/* Search Bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for an item..."
          className="w-2/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-1/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          <option value="Decorations">Decorations</option>
          <option value="Music">Music</option>
          <option value="Games">Games</option>
          <option value="Beverages">Beverages</option>
        </select>

        {/* Sorting Dropdown */}
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className="w-1/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sort by Price</option>
          <option value="lowToHigh">Low to High</option>
          <option value="highToLow">High to Low</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-gray-600">No matching items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item._id} className="shadow-lg p-4 bg-white">
              <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
              <p className="text-gray-600">Category: {item.content}</p>
              <p className="text-gray-600">Price: ${item.price.toFixed(2)}</p>
              <p className="text-gray-600">Expiration Date: {moment(item.expireDate).format('DD/MM/YYYY')}</p>
              <p className="text-gray-600">Quantity: {item.quantity}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}