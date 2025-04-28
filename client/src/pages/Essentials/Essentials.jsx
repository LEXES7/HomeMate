import React, { useState, useEffect } from 'react';
import { Button as AntdButton, Modal as AntdModal, Form, Input, DatePicker, Select, message } from 'antd';
import { Modal as FlowbiteModal, TextInput, Card, Button as FlowbiteButton, Badge } from 'flowbite-react';
import { HiSearch, HiBell } from 'react-icons/hi';
import axios from 'axios';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export default function Essentials() {
  const [essentials, setEssentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Add/Edit modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // Search modal
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // Notifications modal
  const [currentEssential, setCurrentEssential] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');

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

  const searchedEssentials = essentials.filter((essential) =>
    essential.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    essential.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const expiredEssentials = essentials.filter((essential) =>
    moment(essential.expiryDate).isBefore(moment(), 'day')
  );

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

      const tableColumn = ['Item Name', 'No. of Items', 'Expiry Date', 'Description', 'Current Price (LKR)', 'Type'];
      const tableRows = essentials.map((essential) => [
        essential.itemName || 'N/A',
        essential.noOfItems || 'N/A',
        essential.expiryDate ? moment(essential.expiryDate).format('YYYY-MM-DD') : 'N/A',
        essential.description || 'N/A',
        essential.currentPrice ? `LKR ${parseFloat(essential.currentPrice).toFixed(2)} ` : 'N/A',
        essential.type || 'N/A',
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

  // Category counts
  const totalFood = essentials.filter(e => e.type === 'Food').length;
  const totalMedicine = essentials.filter(e => e.type === 'Medicine').length;
  const totalCleaning = essentials.filter(e => e.type === 'Cleaning Supplies').length;
  const totalOthers = essentials.filter(e => !['Food', 'Medicine', 'Cleaning Supplies'].includes(e.type)).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-gray-900">Essentials</h1>
          <div className="relative">
            <HiBell
              onClick={() => setIsNotificationOpen(true)}
              className="h-7 w-7 text-gray-700 cursor-pointer"
            />
            {expiredEssentials.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                {expiredEssentials.length}
              </span>
            )}
          </div>
        </div>
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

      {/* Top Cases */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <h5 className="text-lg font-semibold text-gray-700">Total Food</h5>
          <p className="text-2xl font-bold text-blue-600">{totalFood}</p>
        </Card>
        <Card className="text-center">
          <h5 className="text-lg font-semibold text-gray-700">Total Medicine</h5>
          <p className="text-2xl font-bold text-green-600">{totalMedicine}</p>
        </Card>
        <Card className="text-center">
          <h5 className="text-lg font-semibold text-gray-700">Total Cleaning Supplies</h5>
          <p className="text-2xl font-bold text-yellow-600">{totalCleaning}</p>
        </Card>
        <Card className="text-center">
          <h5 className="text-lg font-semibold text-gray-700">Total Others</h5>
          <p className="text-2xl font-bold text-purple-600">{totalOthers}</p>
        </Card>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : essentials.length === 0 ? (
        <p className="text-gray-600">No essentials available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchedEssentials.map((essential) => (
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
              <p className="text-gray-600">Current Price: LKR {essential.currentPrice?.toFixed(2)}</p>
              <p className="text-gray-600">Type: {essential.type}</p>
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

      {/* Notifications Modal */}
      <FlowbiteModal show={isNotificationOpen} onClose={() => setIsNotificationOpen(false)}>
        <FlowbiteModal.Header>Expired Essentials</FlowbiteModal.Header>
        <FlowbiteModal.Body>
          {expiredEssentials.length === 0 ? (
            <p className="text-gray-600">No expired items!</p>
          ) : (
            <ul className="space-y-2">
              {expiredEssentials.map((essential) => (
                <li key={essential._id} className="text-sm text-gray-800">
                  {essential.itemName} - Expired on {moment(essential.expiryDate).format('YYYY-MM-DD')}
                </li>
              ))}
            </ul>
          )}
        </FlowbiteModal.Body>
      </FlowbiteModal>
    </div>
  );
}
