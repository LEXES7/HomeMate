import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { Card, Badge, Tooltip, Table } from 'flowbite-react';
import { HiOutlineBell, HiOutlineCalendar, HiOutlinePlus, HiPencil, HiTrash } from 'react-icons/hi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
        pastMaintenance: values.pastMaintenance || [],
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
      alert('No appliances available to generate a report.');
      return;
    }

    const doc = new jsPDF();
    doc.text('Appliance Report', 14, 10);

    const tableColumn = ['Name', 'Type', 'Warranty Expiry', 'Maintenance Schedule', 'Value'];
    const tableRows = appliances.map((appliance) => [
      appliance.name,
      appliance.type,
      new Date(appliance.warrantyExpiry).toLocaleDateString(),
      new Date(appliance.maintenanceSchedule).toLocaleDateString(),
      appliance.value,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('appliances_report.pdf');
  };

  const totalAppliances = appliances.length;
  const upcomingMaintenance = appliances.filter(appliance => new Date(appliance.maintenanceSchedule) > new Date()).length;
  const importantMaintenance = appliances.filter(appliance => new Date(appliance.maintenanceSchedule) <= new Date()).length;

  const notifications = appliances
    .filter(appliance => new Date(appliance.maintenanceSchedule) <= new Date())
    .map(appliance => ({
      name: appliance.name,
      type: appliance.type,
      maintenanceSchedule: new Date(appliance.maintenanceSchedule).toLocaleDateString(),
    }));

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
          <Tooltip content="You have important maintenance tasks">
            <Badge color="info" icon={HiOutlineBell}>
              {importantMaintenance}
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
        visible={isNotificationModalVisible}
        onCancel={() => setIsNotificationModalVisible(false)}
        footer={null}
      >
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notification, index) => (
              <li key={index} className="mb-2">
                <strong>{notification.name}</strong> ({notification.type}) - Maintenance due on{' '}
                <strong>{notification.maintenanceSchedule}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications available.</p>
        )}
      </Modal>

      <Modal
        title={currentAppliance ? 'Edit Appliance' : 'Add Appliance'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={{
            name: currentAppliance?.name || '',
            type: currentAppliance?.type || '',
            warrantyExpiry: currentAppliance ? moment(currentAppliance.warrantyExpiry) : null,
            maintenanceSchedule: currentAppliance ? moment(currentAppliance.maintenanceSchedule) : null,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Please enter the appliance name' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[
              { required: true, message: 'Please enter the appliance type' },
            ]}
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