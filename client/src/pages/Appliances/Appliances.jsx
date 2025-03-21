import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, message } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { Card, Badge, Tooltip, Table } from 'flowbite-react';
import { HiOutlineBell, HiOutlineCalendar, HiOutlinePlus, HiPencil, HiTrash } from 'react-icons/hi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Appliances() {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false); // State for notifications modal
  const [currentAppliance, setCurrentAppliance] = useState(null);

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/appliances', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAppliances(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentAppliance(null);
    setIsModalVisible(true);
  };

  const handleEdit = (appliance) => {
    setCurrentAppliance(appliance);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/appliances/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchAppliances();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        type: values.type,
        warrantyExpiry: values.warrantyExpiry.format('YYYY-MM-DD'),
        maintenanceSchedule: values.maintenanceSchedule.format('YYYY-MM-DD'),
        value: values.value || 0,
        pastMaintenance: values.pastMaintenance?.map((date) => date.format('YYYY-MM-DD')) || [],
      };

      if (currentAppliance) {
        await axios.put(`/api/appliances/${currentAppliance._id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await axios.post('/api/appliances', payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      fetchAppliances();
      setIsModalVisible(false);
    } catch (error) {
      setError(error.message);
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

      const tableColumn = ['Name', 'Type', 'Warranty Expiry', 'Maintenance Schedule', 'Value ($)', 'Past Maintenance'];
      const tableRows = appliances.map((appliance) => [
        appliance.name || 'N/A',
        appliance.type || 'N/A',
        appliance.warrantyExpiry ? new Date(appliance.warrantyExpiry).toLocaleDateString() : 'N/A',
        appliance.maintenanceSchedule ? new Date(appliance.maintenanceSchedule).toLocaleDateString() : 'N/A',
        appliance.value ? `RS${parseFloat(appliance.value).toFixed(2)}` : 'N/A',
        appliance.pastMaintenance.length > 0
          ? appliance.pastMaintenance.map((date) => new Date(date).toLocaleDateString()).join(', ')
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
  const upcomingMaintenance = appliances.filter(appliance => new Date(appliance.maintenanceSchedule) > new Date()).length;
  const importantMaintenance = appliances.filter(appliance => new Date(appliance.maintenanceSchedule) <= new Date()).length;

  // Notifications for expired warranties or missed maintenance
  const notifications = appliances.filter(
    (appliance) =>
      new Date(appliance.warrantyExpiry) <= new Date() || new Date(appliance.maintenanceSchedule) <= new Date()
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appliance Management</h1>
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
        <Card onClick={() => setIsNotificationModalVisible(true)} className="cursor-pointer">
          <h5 className="text-lg font-bold">Notifications</h5>
          <Tooltip content="You have important notifications">
            <Badge color="info" icon={HiOutlineBell}>
              {notifications.length}
            </Badge>
          </Tooltip>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Button
          type="primary"
          icon={<HiOutlinePlus />}
          onClick={handleAdd}
        >
          Add Appliance
        </Button>
        <Button type="default" onClick={generatePDF}>
          Export as PDF
        </Button>
      </div>
      <Table hoverable={true} className="mb-6">
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Type</Table.HeadCell>
          <Table.HeadCell>Warranty Expiry</Table.HeadCell>
          <Table.HeadCell>Maintenance Schedule</Table.HeadCell>
          <Table.HeadCell>Value (RS)</Table.HeadCell>
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
              <Table.Cell>{new Date(appliance.warrantyExpiry).toLocaleDateString()}</Table.Cell>
              <Table.Cell>{new Date(appliance.maintenanceSchedule).toLocaleDateString()}</Table.Cell>
              <Table.Cell>RS.{appliance.value.toFixed(2)}</Table.Cell>
              <Table.Cell>
                {appliance.pastMaintenance.length > 0
                  ? appliance.pastMaintenance.map((date, index) => (
                      <span key={index} className="block">
                        {new Date(date).toLocaleDateString()}
                      </span>
                    ))
                  : 'No records'}
              </Table.Cell>
              <Table.Cell>
                <div className="flex space-x-2">
                  <Button
                    size="xs"
                    color="info"
                    onClick={() => handleEdit(appliance)}
                    icon={<HiPencil />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => handleDelete(appliance._id)}
                    icon={<HiTrash />}
                  >
                    Delete
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {/* Notifications Modal */}
      <Modal
        title="Notifications"
        open={isNotificationModalVisible}
        onCancel={() => setIsNotificationModalVisible(false)}
        footer={null}
      >
        {notifications.length > 0 ? (
          <ul className="list-disc pl-5">
            {notifications.map((notification, index) => (
              <li key={index} className="mb-2">
                <strong>{notification.name}</strong> ({notification.type}) -{' '}
                {new Date(notification.warrantyExpiry) <= new Date()
                  ? `Warranty expired on ${new Date(notification.warrantyExpiry).toLocaleDateString()}`
                  : `Maintenance due on ${new Date(notification.maintenanceSchedule).toLocaleDateString()}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications available.</p>
        )}
      </Modal>

      <Modal
        title={currentAppliance ? 'Edit Appliance' : 'Add Appliance'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={{
            name: currentAppliance?.name || '',
            type: currentAppliance?.type || '',
            warrantyExpiry: currentAppliance ? moment(currentAppliance.warrantyExpiry) : null,
            maintenanceSchedule: currentAppliance ? moment(currentAppliance.maintenanceSchedule) : null,
            value: currentAppliance?.value || 0,
            pastMaintenance: currentAppliance?.pastMaintenance?.map((date) => moment(date)) || [],
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the appliance name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please enter the appliance type' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="warrantyExpiry"
            label="Warranty Expiry"
            rules={[
              { required: true, message: 'Please select the warranty expiry date' },
              {
                validator: (_, value) =>
                  value && value.isBefore(moment(), 'day')
                    ? Promise.reject(new Error('Warranty expiry cannot be in the past'))
                    : Promise.resolve(),
              },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="maintenanceSchedule"
            label="Maintenance Schedule"
            rules={[
              { required: true, message: 'Please select the maintenance schedule date' },
              {
                validator: (_, value) =>
                  value && value.isBefore(moment(), 'day')
                    ? Promise.reject(new Error('Maintenance schedule cannot be in the past'))
                    : Promise.resolve(),
              },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="value"
            label="Value (LKR)"
          >
            <Input type="number" step="0.01" />
          </Form.Item>

          <Form.Item
            name="pastMaintenance"
            label="Past Maintenance Dates"
          >
            <DatePicker.RangePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {currentAppliance ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}