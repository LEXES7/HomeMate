import React, { useState, useEffect } from 'react';
import { Button, Card, Label, TextInput, Modal, Table } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      await axios.get('/api/user/test');
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

  const calculateTotals = () => {
    const totals = pantryItems.reduce(
      (acc, item) => {
        if (item.content === 'Decorations') acc.decorations += item.quantity;
        if (item.content === 'Music') acc.music += item.quantity;
        if (item.content === 'Games') acc.games += item.quantity;
        if (item.content === 'Beverages') acc.beverages += item.quantity;
        return acc;
      },
      { decorations: 0, music: 0, games: 0, beverages: 0 }
    );
    return totals;
  };

  const totals = calculateTotals();

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

  const handleDisplayDetails = () => {
    navigate('/dashboard?tab=pantry-details'); // Navigate to PantryDisplay page
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


// Inside your Pantry component
const handleGenerateReport = () => {
  const doc = new jsPDF();

  // Set custom font
  doc.setFont('helvetica', 'normal');

  // Header Section: Title and Branding
  doc.setFillColor(33, 150, 243); // Blue background
  doc.rect(0, 0, 210, 40, 'F'); // Full-width header
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255); // White text
  doc.setFont('helvetica', 'bold');
  doc.text('Pantry Inventory Report', 20, 25);

  // Subheader: Generated Date
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, 20, 35);

  // Summary Section: Totals
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243); // Blue text
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 20, 55);

  // Summary Cards (Boxed Layout)
  const summaryData = [
    { label: 'Decorations', value: totals.decorations },
    { label: 'Music Items', value: totals.music },
    { label: 'Games', value: totals.games },
    { label: 'Beverages', value: totals.beverages },
  ];

  summaryData.forEach((item, index) => {
    const x = 20 + (index % 2) * 90; // Two columns
    const y = 65 + Math.floor(index / 2) * 30; // Two rows
    doc.setFillColor(245, 245, 245); // Light gray background
    doc.rect(x, y, 80, 25, 'F'); // Card background
    doc.setDrawColor(200, 200, 200); // Border color
    doc.rect(x, y, 80, 25); // Card border
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, x + 5, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${item.value}`, x + 5, y + 20);
  });

  // Inventory Details: Table (with added space)
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Details', 20, 135);

  // Use autoTable for a styled table
  let finalY = 145; // Default startY
  autoTable(doc, {
    startY: 145,
    head: [['Item', 'Category', 'Price ($)', 'Ex.Date', 'Quant']],
    body: pantryItems.map((item) => [
      item.title,
      item.content,
      item.price.toFixed(2),
      moment(item.expireDate).format('DD/MM/YYYY'),
      item.quantity,
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [33, 33, 33], // Dark gray text
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [33, 150, 243], // Blue header
      textColor: [255, 255, 255], // White text
      fontSize: 11,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240], // Light gray for alternate rows
    },
    columnStyles: {
      0: { cellWidth: 50 }, // Item
      1: { cellWidth: 40 }, // Category
      2: { cellWidth: 30 }, // Price
      3: { cellWidth: 40 }, // Exp. Date
      4: { cellWidth: 20 }, // Quantity
    },
    margin: { top: 145, left: 20, right: 20 },
    didDrawPage: (data) => {
      finalY = data.cursor.y; // Capture the final Y position of the table
    },
  });
// Name and Signature Section
const nameY = finalY + 10; // 10mm below the table
doc.setFontSize(12);
doc.setTextColor(33, 33, 33); // Dark gray text
doc.setFont('helvetica', 'bold');
doc.text('', 20, nameY);
doc.setFont('helvetica', 'normal');
doc.text('', 60, nameY); // Placeholder name

const signatureY = nameY + 10;
doc.setFont('helvetica', 'bold');
doc.text('Signature:', 130, signatureY); // Moved to right side
doc.setDrawColor(100, 100, 100); // Gray line
doc.line(150, signatureY + 2, 190, signatureY + 2);

  // Footer: Page Number and Branding
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gray text
    doc.text(`Page ${i} of ${pageCount}`, 180, 290, { align: 'right' });
    doc.text('Generated by Pantry Manager', 20, 290);
  }

  // Save the PDF
  doc.save(`Pantry_Report_${moment().format('YYYYMMDD_HHmm')}.pdf`);
};








  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pantry & Grocery Management</h1>
        <div className="flex space-x-4">
          <Button
            onClick={handleGenerateReport}
            className="bg-green-500 text-white hover:bg-green-600 shadow-md"
          >
            Generate Report
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-blue-500 text-white hover:bg-blue-600 shadow-md"
          >
            <HiPlus className="mr-2 h-5 w-5" />
            Add Pantry Item
          </Button>
          <Button
            onClick={handleDisplayDetails}
            className="bg-purple-500 text-white hover:bg-purple-600 shadow-md"
          >
            Display Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
          <h2 className="text-lg font-bold">fruits</h2>
          <p>Total: {totals.decorations}</p>
        </Card>
        <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
          <h2 className="text-lg font-bold">vegetables</h2>
          <p>Total: {totals.music}</p>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
          <h2 className="text-lg font-bold">snacks</h2>
          <p>Total: {totals.games}</p>
        </Card>
        <Card className="bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
          <h2 className="text-lg font-bold">Beverage Items</h2>
          <p>Total: {totals.beverages}</p>
        </Card>
      </div>
      <br />

      <Card className="shadow-lg">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : pantryItems.length === 0 ? (
          <p className="text-gray-600">No pantry items available. Add some!</p>
        ) : (
          <Table hoverable className="w-full">
            <Table.Head>
              <Table.HeadCell>Item Name</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Price($)</Table.HeadCell>
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
              <Label htmlFor="title" value="Item Name" />
              <TextInput
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z\s]*$/.test(value)) {
                    handleChange(e);
                  } else {
                    setErrors({ ...errors, title: 'Only letters and spaces are allowed' });
                  }
                }}
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="content" value="Category" />
              <select
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                <option value="Decorations">Decorations</option>
                <option value="Music">Music</option>
                <option value="Games">Games</option>
                <option value="Beverages">Beverages</option>
              </select>
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price" value="Price(LKS)" />
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, price: Math.max(0, Number(formData.price) - 1) })}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  -
                </button>
                <div className="relative w-full">
                  <TextInput
                    id="price"
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="0"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, price: Number(formData.price) + 1 })}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  +
                </button>
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <Label htmlFor="expireDate" value="Expiration Date" />
              <TextInput
                id="expireDate"
                type="date"
                name="expireDate"
                value={formData.expireDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
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