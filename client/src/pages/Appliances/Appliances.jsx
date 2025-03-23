import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Tooltip, Table, Modal as FlowbiteModal, Select } from 'flowbite-react';
import axios from 'axios';
import moment from 'moment';
import { HiOutlineBell, HiOutlinePlus, HiPencil, HiTrash } from 'react-icons/hi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DatePicker, message } from 'antd';

axios.defaults.baseURL = 'http://localhost:8000'; // Backend URL
axios.defaults.withCredentials = true; // Enable cookies

// Define appliance type options
const applianceTypes = [
  'Kitchen Items',
  'Bedroom Items',
  'Living Room Items',
  'Laundry Items',
  'Furniture',
  'Garage Items',
  'Tools',
  'Others',
];

export default function Appliances() {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentAppliance, setCurrentAppliance] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    warrantyExpiry: null,
    maintenanceSchedule: null,
    value: '',
    pastMaintenance: [],
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/appliances', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAppliances(response.data);
    } catch (error) {
      console.error('Fetch appliances error:', error);
      message.error(error.response?.data?.message || 'Failed to fetch appliances');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    console.log('Opening modal for adding new appliance');
    setCurrentAppliance(null);
    setFormData({
      name: '',
      type: '',
      warrantyExpiry: null,
      maintenanceSchedule: null,
      value: '',
      pastMaintenance: [],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (appliance) => {
    console.log('Editing appliance:', appliance);
    setCurrentAppliance(appliance);
    setFormData({
      name: appliance.name,
      type: appliance.type,
      warrantyExpiry: moment(appliance.warrantyExpiry),
      maintenanceSchedule: moment(appliance.maintenanceSchedule),
      value: appliance.value.toString(),
      pastMaintenance: appliance.pastMaintenance?.map((date) => moment(date)) || [],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/appliances/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      message.success('Appliance deleted successfully.');
      fetchAppliances();
    } catch (error) {
      console.error('Delete appliance error:', error);
      message.error(error.response?.data?.message || 'Failed to delete appliance');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (field, date) => {
    console.log(`Date changed: ${field} = ${date ? date.format('YYYY-MM-DD') : 'null'}`);
    setFormData((prev) => ({ ...prev, [field]: date }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePastMaintenanceChange = (dates) => {
    console.log('Past maintenance changed:', dates ? dates.map((d) => d.format('YYYY-MM-DD')) : '[]');
    setFormData((prev) => ({ ...prev, pastMaintenance: dates || [] }));
  };

  // Disable past dates for warrantyExpiry
  const disablePastDates = (current) => {
    return current && current < moment().startOf('day');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.type) errors.type = 'Type is required';
    if (!formData.warrantyExpiry) {
      errors.warrantyExpiry = 'Warranty expiry is required';
    } else if (formData.warrantyExpiry.isBefore(moment(), 'day')) {
      errors.warrantyExpiry = 'Warranty expiry cannot be in the past';
    }
    if (!formData.maintenanceSchedule) {
      errors.maintenanceSchedule = 'Maintenance schedule is required';
    } else if (formData.maintenanceSchedule.isBefore(moment(), 'day')) {
      errors.maintenanceSchedule = 'Maintenance schedule cannot be in the past';
    }
    if (!formData.value || formData.value === '') {
      errors.value = 'Value is required';
    } else {
      const numValue = Number(formData.value);
      if (isNaN(numValue)) {
        errors.value = 'Value must be a number';
      } else if (numValue <= 0) {
        errors.value = 'Value must be greater than 0';
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      message.error('Please fix the errors in the form.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        warrantyExpiry: formData.warrantyExpiry.format('YYYY-MM-DD'),
        maintenanceSchedule: formData.maintenanceSchedule.format('YYYY-MM-DD'),
        value: Number(formData.value),
        pastMaintenance: formData.pastMaintenance.map((date) => date.format('YYYY-MM-DD')),
      };
      console.log('Sending payload to backend:', payload);

      if (currentAppliance) {
        await axios.put(`/api/appliances/${currentAppliance._id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        message.success('Appliance updated successfully.');
      } else {
        const response = await axios.post('/api/appliances', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Add response:', response.data);
        message.success('Appliance added successfully.');
      }

      fetchAppliances();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submit appliance error:', error.response ? error.response.data : error);
      message.error(error.response?.data?.message || 'Failed to save appliance');
    }
  };

  const generatePDF = () => {
    if (appliances.length === 0) {
      message.warning('No appliances available to generate a report.');
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('HomeMate - Appliance Report', 14, 20);
      doc.setFontSize(11);
      const today = new Date();
      doc.text(`Generated on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 14, 30);
      doc.setFontSize(12);
      doc.text(`Total Appliances: ${appliances.length}`, 14, 40);

      const tableColumn = ['Name', 'Type', 'Warranty Expiry', 'Maintenance Schedule', 'Value (LKR)', 'Past Maintenance'];
      const tableRows = appliances.map((appliance) => [
        appliance.name || 'N/A',
        appliance.type || 'N/A',
        appliance.warrantyExpiry ? moment(appliance.warrantyExpiry).format('YYYY-MM-DD') : 'N/A',
        appliance.maintenanceSchedule ? moment(appliance.maintenanceSchedule).format('YYYY-MM-DD') : 'N/A',
        appliance.value ? `LKR ${parseFloat(appliance.value).toFixed(2)}` : 'N/A',
        appliance.pastMaintenance.length > 0
          ? appliance.pastMaintenance.map((date) => moment(date).format('YYYY-MM-DD')).join(', ')
          : 'No records',
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });

      doc.save('appliance_report.pdf');
      message.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF report. Please try again.');
    }
  };

  const totalAppliances = appliances.length;
  const upcomingMaintenance = appliances.filter((appliance) =>
    moment(appliance.maintenanceSchedule).isAfter(moment())
  ).length;
  const importantMaintenance = appliances.filter((appliance) =>
    moment(appliance.maintenanceSchedule).isSameOrBefore(moment())
  ).length;
  const notifications = appliances.filter(
    (appliance) =>
      moment(appliance.warrantyExpiry).isSameOrBefore(moment()) ||
      moment(appliance.maintenanceSchedule).isSameOrBefore(moment())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appliance Management</h1>
        <Button color="blue" onClick={handleAdd}>
          <HiOutlinePlus className="mr-2 h-5 w-5" /> Add Appliance
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <h5 className="text-lg font-bold">Total Appliances</h5>
              <p className="text-2xl font-semibold">{totalAppliances}</p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold">Upcoming Maintenance</h5>
              <p className="text-2xl font-semibold">{upcomingMaintenance}</p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold">Important Maintenance</h5>
              <p className="text-2xl font-semibold">{importantMaintenance}</p>
            </Card>
            <Card onClick={() => setIsNotificationModalOpen(true)} className="cursor-pointer">
              <h5 className="text-lg font-bold">Notifications</h5>
              <Tooltip content="You have important notifications">
                <Badge color="info" icon={HiOutlineBell}>
                  {notifications.length}
                </Badge>
              </Tooltip>
            </Card>
          </div>

          <div className="flex justify-end mb-4">
            <Button color="gray" onClick={generatePDF}>
              Export as PDF
            </Button>
          </div>

          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Warranty Expiry</Table.HeadCell>
              <Table.HeadCell>Maintenance Schedule</Table.HeadCell>
              <Table.HeadCell>Value (LKR)</Table.HeadCell>
              <Table.HeadCell>Past Maintenance</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {appliances.map((appliance) => (
                <Table.Row key={appliance._id} className="bg-white">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                    {appliance.name}
                  </Table.Cell>
                  <Table.Cell>{appliance.type}</Table.Cell>
                  <Table.Cell>{moment(appliance.warrantyExpiry).format('YYYY-MM-DD')}</Table.Cell>
                  <Table.Cell>{moment(appliance.maintenanceSchedule).format('YYYY-MM-DD')}</Table.Cell>
                  <Table.Cell>LKR {appliance.value.toFixed(2)}</Table.Cell>
                  <Table.Cell>
                    {appliance.pastMaintenance.length > 0
                      ? appliance.pastMaintenance.map((date) => moment(date).format('YYYY-MM-DD')).join(', ')
                      : 'No records'}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button size="xs" color="blue" onClick={() => handleEdit(appliance)}>
                        <HiPencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button size="xs" color="red" onClick={() => handleDelete(appliance._id)}>
                        <HiTrash className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      )}

      {/* Notifications Modal */}
      <FlowbiteModal show={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)}>
        <FlowbiteModal.Header>Notifications</FlowbiteModal.Header>
        <FlowbiteModal.Body>
          {notifications.length > 0 ? (
            <ul className="list-disc pl-5">
              {notifications.map((notification, index) => (
                <li key={index} className="mb-2">
                  <strong>{notification.name}</strong> ({notification.type}) -{' '}
                  {moment(notification.warrantyExpiry).isSameOrBefore(moment())
                    ? `Warranty expired on ${moment(notification.warrantyExpiry).format('YYYY-MM-DD')}`
                    : `Maintenance due on ${moment(notification.maintenanceSchedule).format('YYYY-MM-DD')}`}
                </li>
              ))}
            </ul>
          ) : (
            <p>No notifications available.</p>
          )}
        </FlowbiteModal.Body>
        <FlowbiteModal.Footer>
          <Button color="gray" onClick={() => setIsNotificationModalOpen(false)}>
            Close
          </Button>
        </FlowbiteModal.Footer>
      </FlowbiteModal>

      {/* Add/Edit Modal */}
      <FlowbiteModal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <FlowbiteModal.Header>{currentAppliance ? 'Edit Appliance' : 'Add Appliance'}</FlowbiteModal.Header>
        <FlowbiteModal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${formErrors.name ? 'border-red-500' : ''}`}
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${formErrors.type ? 'border-red-500' : ''}`}
              >
                <option value="">Select a type</option>
                {applianceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warranty Expiry</label>
              <DatePicker
                value={formData.warrantyExpiry}
                onChange={(date) => handleDateChange('warrantyExpiry', date)}
                format="YYYY-MM-DD"
                disabledDate={disablePastDates} 
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${formErrors.warrantyExpiry ? 'border-red-500' : ''}`}
              />
              {formErrors.warrantyExpiry && <p className="text-red-500 text-sm mt-1">{formErrors.warrantyExpiry}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maintenance Schedule</label>
              <DatePicker
                value={formData.maintenanceSchedule}
                onChange={(date) => handleDateChange('maintenanceSchedule', date)}
                format="YYYY-MM-DD"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${formErrors.maintenanceSchedule ? 'border-red-500' : ''}`}
              />
              {formErrors.maintenanceSchedule && <p className="text-red-500 text-sm mt-1">{formErrors.maintenanceSchedule}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Value (LKR)</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                step="0.01"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${formErrors.value ? 'border-red-500' : ''}`}
              />
              {formErrors.value && <p className="text-red-500 text-sm mt-1">{formErrors.value}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Past Maintenance Dates</label>
              <DatePicker.RangePicker
                value={formData.pastMaintenance}
                onChange={handlePastMaintenanceChange}
                format="YYYY-MM-DD"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button color="gray" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" color="blue">
                {currentAppliance ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </FlowbiteModal.Body>
      </FlowbiteModal>
    </div>
  );
}