import React, { useState, useEffect } from 'react';
import { Button as AntdButton, Modal as AntdModal, Form, Input, DatePicker, message } from 'antd';
import { Modal as FlowbiteModal, TextInput, Card, Button as FlowbiteButton } from 'flowbite-react';
import { HiSearch } from 'react-icons/hi';
import axios from 'axios';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

axios.defaults.baseURL = 'http://localhost:8000'; // Backend URL
axios.defaults.withCredentials = true; // Enable cookies

export default function Essentials() {
  const [essentials, setEssentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Add/Edit modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // Search modal
  const [currentEssential, setCurrentEssential] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState(''); // Search input state

  useEffect(() => {
    fetchEssentials();
  }, []);

  const fetchEssentials = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/essentials');
      setEssentials(response.data || []);
    } catch (error) {
      console.error('Fetch essentials error:', error);
      message.error(error.response?.data?.message || 'Failed to fetch essentials');
      setEssentials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentEssential(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (essential) => {
    setCurrentEssential(essential);
    form.setFieldsValue({
      ...essential,
      expiryDate: moment(essential.expiryDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/essentials/${id}`);
      message.success('Essential item deleted successfully.');
      fetchEssentials();
    } catch (error) {
      console.error('Delete essential error:', error);
      message.error(error.response?.data?.message || 'Failed to delete essential item');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        expiryDate: values.expiryDate.format('YYYY-MM-DD'),
      };

      if (currentEssential) {
        await axios.put(`/api/essentials/${currentEssential._id}`, payload);
        message.success('Essential item updated successfully.');
      } else {
        await axios.post('/api/essentials', payload);
        message.success('Essential item added successfully.');
      }

      fetchEssentials();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Submit essential error:', error);
      message.error(error.response?.data?.message || 'Failed to save essential item');
    }
  };

  // Filter essentials based on search query
  const searchedEssentials = essentials.filter((essential) =>
    essential.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    essential.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate PDF report
  const generatePDF = () => {
    if (essentials.length === 0) {
      message.warning('No essentials available to generate a report.');
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('HomeMate - Essentials Report', 14, 20);
      doc.setFontSize(11);
      const today = new Date();
      doc.text(`Generated on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 14, 30);
      doc.setFontSize(12);
      doc.text(`Total Essentials: ${essentials.length}`, 14, 40);

      const tableColumn = ['Item Name', 'No. of Items', 'Expiry Date', 'Description', 'Current Price (LKR)'];
      const tableRows = essentials.map((essential) => [
        essential.itemName || 'N/A',
        essential.noOfItems || 'N/A',
        essential.expiryDate ? moment(essential.expiryDate).format('YYYY-MM-DD') : 'N/A',
        essential.description || 'N/A',
        essential.currentPrice ? `LKR ${parseFloat(essential.currentPrice).toFixed(2)}` : 'N/A',
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });

      doc.save('essentials_report.pdf');
      message.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF report. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Essentials</h1>
        <div className="flex space-x-2">
          <AntdButton
            type="primary"
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            Add New
          </AntdButton>
          <AntdButton
            type="default"
            onClick={() => setIsSearchModalOpen(true)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            <HiSearch className="h-5 w-5" />
          </AntdButton>
          <FlowbiteButton
            color="gray"
            onClick={generatePDF}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            Export as PDF
          </FlowbiteButton>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : essentials.length === 0 ? (
        <p className="text-gray-600">No essentials available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {essentials.map((essential) => (
            <div
              key={essential._id}
              className="border border-gray-200 rounded-lg p-4 shadow-md bg-white"
            >
              <h2 className="text-xl font-bold text-gray-800">{essential.itemName}</h2>
              <p className="text-gray-600">No. of Items: {essential.noOfItems}</p>
              <p className="text-gray-600">
                Expiry Date: {moment(essential.expiryDate).format('YYYY-MM-DD')}
              </p>
              <p className="text-gray-600">Description: {essential.description}</p>
              <p className="text-gray-600">Current Price: LKR {essential.currentPrice.toFixed(2)}</p>
              <div className="flex justify-between mt-4">
                <AntdButton
                  type="link"
                  onClick={() => handleEdit(essential)}
                  className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                  Edit
                </AntdButton>
                <AntdButton
                  type="link"
                  danger
                  onClick={() => handleDelete(essential._id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete
                </AntdButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal (Ant Design) */}
      <AntdModal
        title={
          <span className="text-2xl font-bold text-gray-900">
            {currentEssential ? 'Edit Essential' : 'Add Essential'}
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="rounded-lg"
        bodyStyle={{ padding: '1.5rem' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            name="itemName"
            label={<span className="text-sm font-medium text-gray-700">Item Name</span>}
            rules={[{ required: true, message: 'Please enter the item name' }]}
          >
            <Input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </Form.Item>

          <Form.Item
            name="noOfItems"
            label={<span className="text-sm font-medium text-gray-700">Number of Items</span>}
            rules={[
              { required: true, message: 'Please enter the number of items' },
              {
                validator(_, value) {
                  const numValue = Number(value);
                  if (!value || (!isNaN(numValue) && numValue >= 1)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Number of items must be at least 1'));
                },
              },
            ]}
          >
            <Input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label={<span className="text-sm font-medium text-gray-700">Expiry Date</span>}
            rules={[{ required: true, message: 'Please select the expiry date' }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-sm font-medium text-gray-700">Description</span>}
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </Form.Item>

          <Form.Item
            name="currentPrice"
            label={<span className="text-sm font-medium text-gray-700">Current Price (LKR)</span>}
            rules={[
              { required: true, message: 'Please enter the current price' },
              {
                validator(_, value) {
                  if (!value || !isNaN(Number(value))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Current price must be a number'));
                },
              },
            ]}
          >
            <Input
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </Form.Item>

          <Form.Item>
            <AntdButton
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md w-full"
            >
              {currentEssential ? 'Update' : 'Add'}
            </AntdButton>
          </Form.Item>
        </Form>
      </AntdModal>

      {/* Search Modal (Flowbite) */}
      <FlowbiteModal show={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)}>
        <FlowbiteModal.Header>Search Essentials</FlowbiteModal.Header>
        <FlowbiteModal.Body>
          <TextInput
            type="text"
            placeholder="Search by item name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          {searchedEssentials.length > 0 ? (
            <div className="space-y-4">
              {searchedEssentials.map((essential) => (
                <Card key={essential._id} className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{essential.itemName}</h3>
                  <p className="text-gray-600"><strong>No. of Items:</strong> {essential.noOfItems}</p>
                  <p className="text-gray-600"><strong>Expiry Date:</strong> {moment(essential.expiryDate).format('YYYY-MM-DD')}</p>
                  <p className="text-gray-600"><strong>Description:</strong> {essential.description}</p>
                  <p className="text-gray-600"><strong>Current Price:</strong> LKR {essential.currentPrice.toFixed(2)}</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No essentials found matching "{searchQuery}"</p>
          )}
        </FlowbiteModal.Body>
        <FlowbiteModal.Footer>
          <FlowbiteButton
            color="gray"
            onClick={() => setIsSearchModalOpen(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            Close
          </FlowbiteButton>
        </FlowbiteModal.Footer>
      </FlowbiteModal>
    </div>
  );
}