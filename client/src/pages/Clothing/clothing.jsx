import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Label, Select, TextInput, Table, Modal } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash, HiCalendar } from 'react-icons/hi';

axios.defaults.baseURL = 'http://localhost:8000'; 
axios.defaults.withCredentials = true; // Enable cookies for auth

export default function Clothing() {
  const [clothingList, setClothingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentClothing, setCurrentClothing] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    brand: '',
    quantity: '',
    purchaseDate: '',
  });
  const [errors, setErrors] = useState({
    itemName: '',
    brand: '',
    quantity: '',
    purchaseDate: '',
  });

  const clothingItems = ['T-Shirt', 'Shirts', 'Shoes', 'Jackets'];
  const brands = ['Levs', 'Emirates', 'Nike', 'Gucci'];

  useEffect(() => {
    fetchClothing();
  }, []);

  const fetchClothing = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/clothing');
      setClothingList(response.data);
    } catch (error) {
      console.error('Fetch clothing error:', error);
      alert(error.response?.data?.message || 'Failed to fetch clothing items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentClothing(null);
    setFormData({ itemName: '', brand: '', quantity: '', purchaseDate: '' });
    setErrors({ itemName: '', brand: '', quantity: '', purchaseDate: '' });
    setIsModalVisible(true);
  };

  const handleEdit = (clothing) => {
    setCurrentClothing(clothing);
    setFormData({
      itemName: clothing.itemName,
      brand: clothing.brand,
      quantity: clothing.quantity,
      purchaseDate: clothing.purchaseDate.split('T')[0],
    });
    setErrors({ itemName: '', brand: '', quantity: '', purchaseDate: '' });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/clothing/${id}`);
      alert('Clothing item deleted successfully!');
      fetchClothing();
    } catch (error) {
      console.error('Delete clothing error:', error);
      alert(error.response?.data?.message || 'Failed to delete clothing item');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for the field being edited
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {
      itemName: '',
      brand: '',
      quantity: '',
      purchaseDate: '',
    };
    let isValid = true;

    // Validate itemName
    if (!formData.itemName) {
      newErrors.itemName = 'Please select a clothing type';
      isValid = false;
    }

    // Validate brand
    if (!formData.brand) {
      newErrors.brand = 'Please select a brand';
      isValid = false;
    }

    // Validate quantity
    const quantityNum = Number(formData.quantity);
    if (!formData.quantity) {
      newErrors.quantity = 'Please enter the quantity';
      isValid = false;
    } else if (isNaN(quantityNum) || quantityNum < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
      isValid = false;
    }

    // Validate purchaseDate
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Please select a purchase date';
      isValid = false;
    } else {
      const today = new Date();
      const selectedDate = new Date(formData.purchaseDate);
      if (selectedDate > today) {
        newErrors.purchaseDate = 'Purchase date cannot be in the future';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = { ...formData };
      if (currentClothing) {
        await axios.put(`/api/clothing/${currentClothing._id}`, payload);
        alert('Clothing item updated successfully!');
      } else {
        await axios.post('/api/clothing', payload);
        alert('Clothing item added successfully!');
      }
      fetchClothing();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Submit clothing error:', error);
      alert(error.response?.data?.message || 'Failed to save clothing item');
    }
  };

  // Calculate total clothing items
  const totalClothingItems = clothingList.length;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top Section: Total Clothing and Calendar */}
      <div className="flex justify-between items-start mb-6">
        {/* Total Clothing Card */}
        <div className="flex items-center space-x-4">
          <Card className="bg-red-500 text-white shadow-lg">
            <h2 className="text-lg font-bold">TOTAL CLOTHING ITEMS</h2>
            <p className="text-4xl font-semibold">{totalClothingItems}</p>
          </Card>
          <Button
            onClick={handleAdd}
            className="bg-pink-200 text-pink-800 hover:bg-pink-300 shadow-md"
          >
            <HiPlus className="mr-2 h-5 w-5" />
            Add clothing
          </Button>
        </div>

        {/* Calendar */}
        <Card className="shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">March 2025</h3>
            <HiCalendar className="h-6 w-6 text-gray-600" />
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            <div className="font-semibold text-gray-600">Su</div>
            <div className="font-semibold text-gray-600">Mo</div>
            <div className="font-semibold text-gray-600">Tu</div>
            <div className="font-semibold text-gray-600">We</div>
            <div className="font-semibold text-gray-600">Th</div>
            <div className="font-semibold text-gray-600">Fr</div>
            <div className="font-semibold text-gray-600">Sa</div>
            {/* Static calendar for March 2025 */}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i >= 6 ? i - 5 : null; // Start from March 1 (Saturday)
              return (
                <div
                  key={i}
                  className={`p-1 ${
                    day === 4 ? 'bg-blue-500 text-white rounded-full' : 'text-gray-800'
                  } ${!day ? 'text-gray-300' : ''}`}
                >
                  {day || ''}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Clothing Table */}
      <Card className="shadow-lg">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : clothingList.length === 0 ? (
          <p className="text-gray-600">No clothing items found. Add some!</p>
        ) : (
          <Table hoverable className="w-full">
            <Table.Head>
              <Table.HeadCell>Item Name</Table.HeadCell>
              <Table.HeadCell>Brand</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Purchase Date</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {clothingList.map((clothing) => (
                <Table.Row key={clothing._id} className="bg-white">
                  <Table.Cell>{clothing.itemName}</Table.Cell>
                  <Table.Cell>{clothing.brand}</Table.Cell>
                  <Table.Cell>{clothing.quantity}</Table.Cell>
                  <Table.Cell>
                    {new Date(clothing.purchaseDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        color="warning"
                        onClick={() => handleEdit(clothing)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white"
                      >
                        <HiPencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        color="failure"
                        onClick={() => handleDelete(clothing._id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <HiTrash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      <Modal show={isModalVisible} onClose={() => setIsModalVisible(false)} size="md">
        <Modal.Header>{currentClothing ? 'Edit Clothing Item' : 'Add Clothing Item'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="itemName" value="Clothing Type" />
              <Select
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
              >
                <option value="">Select Clothing Type</option>
                {clothingItems.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              {errors.itemName && (
                <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="brand" value="Brand" />
              <Select
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Select>
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity" value="Quantity" />
              <TextInput
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <Label htmlFor="purchaseDate" value="Purchase Date" />
              <TextInput
                id="purchaseDate"
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                required
              />
              {errors.purchaseDate && (
                <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>
              )}
            </div>

            <Button type="submit" color="success" className="w-full">
              {currentClothing ? 'Update' : 'Add'}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}