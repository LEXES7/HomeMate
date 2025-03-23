import React, { useState, useEffect } from 'react';
import { Button, Card, Label, TextInput, Modal, Table } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export default function Pantry() {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    price: '',
    expireDate: '',
    quantity: '',
  });
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    price: '',
    expireDate: '',
    quantity: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    setLoading(true);
    try {
      // Check authentication status
      await axios.get('/api/user/test'); // Adjust to your auth check endpoint
      await fetchPantryItems();
    } catch (error) {
      console.error('Auth check failed:', error.response?.data);
      if (error.response?.status === 401) {
        alert('You are not authorized. Redirecting to login page...');
        navigate('/login');
      } else {
        alert('Failed to initialize pantry. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPantryItems = async () => {
    try {
      console.log('Fetching pantry items...');
      const response = await axios.get('/api/pantry', { withCredentials: true });
      console.log('Pantry items fetched:', response.data);
      setPantryItems(response.data || []);
    } catch (error) {
      console.error('Fetch pantry items error:', error.response?.data);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to fetch pantry items');
      }
      setPantryItems([]);
    }
  };

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ title: '', content: '', price: '', expireDate: '', quantity: '' });
    setErrors({ title: '', content: '', price: '', expireDate: '', quantity: '' });
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      price: item.price,
      expireDate: moment(item.expireDate).format('YYYY-MM-DD'),
      quantity: item.quantity,
    });
    setErrors({ title: '', content: '', price: '', expireDate: '', quantity: '' });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/pantry/${id}`, { withCredentials: true });
      alert('Pantry item deleted successfully!');
      fetchPantryItems();
    } catch (error) {
      console.error('Delete error:', error.response?.data);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to delete pantry item');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      content: '',
      price: '',
      expireDate: '',
      quantity: '',
    };
    let isValid = true;

    if (!formData.title) {
      newErrors.title = 'Please enter a title';
      isValid = false;
    }

    if (!formData.content) {
      newErrors.content = 'Please enter content';
      isValid = false;
    }

    const priceNum = Number(formData.price);
    if (!formData.price) {
      newErrors.price = 'Please enter the price';
      isValid = false;
    } else if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Price must be a positive number';
      isValid = false;
    }

    if (!formData.expireDate) {
      newErrors.expireDate = 'Please select an expiration date';
      isValid = false;
    }

    const quantityNum = Number(formData.quantity);
    if (!formData.quantity) {
      newErrors.quantity = 'Please enter the quantity';
      isValid = false;
    } else if (isNaN(quantityNum) || quantityNum < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
      isValid = false;
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
      console.log('Submitting payload:', payload);

      let response;
      if (currentItem) {
        response = await axios.put(`/api/pantry/${currentItem._id}`, payload, {
          withCredentials: true,
        });
        console.log('Update response:', response.data);
        alert('Pantry item updated successfully!');
      } else {
        response = await axios.post('/api/pantry', payload, {
          withCredentials: true,
        });
        console.log('Add response:', response.data);
        alert('Pantry item added successfully!');
      }

      fetchPantryItems();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Submit error:', error.response?.data);
      if (error.response?.status === 401) {
        alert('You are not authorized. Redirecting to login page...');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to save pantry item');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pantry</h1>
        <Button
          onClick={handleAdd}
          className="bg-blue-500 text-white hover:bg-blue-600 shadow-md"
        >
          <HiPlus className="mr-2 h-5 w-5" />
          Add Pantry Item
        </Button>
      </div>

      <Card className="shadow-lg">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : pantryItems.length === 0 ? (
          <p className="text-gray-600">No pantry items available. Add some!</p>
        ) : (
          <Table hoverable className="w-full">
            <Table.Head>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>Content</Table.HeadCell>
              <Table.HeadCell>Price ($)</Table.HeadCell>
              <Table.HeadCell>Expiration Date</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {pantryItems.map((item) => (
                <Table.Row key={item._id} className="bg-white">
                  <Table.Cell>{item.title}</Table.Cell>
                  <Table.Cell>{item.content}</Table.Cell>
                  <Table.Cell>{item.price.toFixed(2)}</Table.Cell>
                  <Table.Cell>
                    {moment(item.expireDate).format('DD/MM/YYYY')}
                  </Table.Cell>
                  <Table.Cell>{item.quantity}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        color="warning"
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white"
                      >
                        <HiPencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        color="failure"
                        onClick={() => handleDelete(item._id)}
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
        <Modal.Header>{currentItem ? 'Edit Pantry Item' : 'Add Pantry Item'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" value="Title" />
              <TextInput
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="content" value="Content" />
              <TextInput
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price" value="Price ($)" />
              <TextInput
                id="price"
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expireDate" value="Expiration Date" />
              <TextInput
                id="expireDate"
                type="date"
                name="expireDate"
                value={formData.expireDate}
                onChange={handleChange}
                required
              />
              {errors.expireDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expireDate}</p>
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

            <Button type="submit" color="success" className="w-full">
              {currentItem ? 'Update' : 'Add'}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}