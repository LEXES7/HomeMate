import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Label, Select, TextInput, Table, Modal } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash, HiCalendar, HiDocumentDownload, HiX, HiSearch } from 'react-icons/hi';
import { FaTshirt } from 'react-icons/fa'; // Import a clothing icon for the Clothing button
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Apply autoTable to jsPDF
jsPDF.API.autoTable = autoTable;

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export default function Medication() {
  const [medicationList, setMedicationList] = useState([]);
  const [filteredMedicationList, setFilteredMedicationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    quantity: '',
    buyingDate: '',
    expiryDate: '',
    dosage: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    brand: '',
    quantity: '',
    buyingDate: '',
    expiryDate: '',
    dosage: '',
  });
  const [filters, setFilters] = useState({
    name: '',
    brand: '',
    expiryDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const medicationTypes = ['Tablets', 'Syrups', 'Inhalers', 'Creams'];
  const brands = ['Pfizer', 'Novartis', 'GSK', 'Bayer'];

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/medication');
      setMedicationList(response.data);
      setFilteredMedicationList(response.data);
      console.log('Fetched medicationList:', response.data);
    } catch (error) {
      console.error('Fetch medication error:', error.response || error.message);
      if (error.response?.status === 401) {
        alert('You are not authorized. Redirecting to login page...');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to fetch medications');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate total quantity for each medication type
  const totalQuantities = medicationTypes.reduce((acc, type) => {
    const total = medicationList
      .filter((med) => med.name === type)
      .reduce((sum, med) => sum + Number(med.quantity), 0);
    acc[type] = total;
    return acc;
  }, { Tablets: 0, Syrups: 0, Inhalers: 0, Creams: 0 });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [name]: value };
      applyFilters(newFilters, searchQuery);
      return newFilters;
    });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(filters, query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    applyFilters(filters, '');
  };

  const applyFilters = (filters, searchQuery) => {
    let filtered = [...medicationList];

    if (filters.name) {
      filtered = filtered.filter((med) => med.name === filters.name);
    }

    if (filters.brand) {
      filtered = filtered.filter((med) => med.brand === filters.brand);
    }

    if (filters.expiryDate) {
      filtered = filtered.filter((med) => {
        const medExpiryDate = new Date(med.expiryDate).toISOString().split('T')[0];
        return medExpiryDate === filters.expiryDate;
      });
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((med) =>
        Object.values(med).some((value) =>
          value?.toString().toLowerCase().includes(lowerQuery)
        )
      );
    }

    setFilteredMedicationList(filtered);
  };

  const clearFilters = () => {
    const resetFilters = {
      name: '',
      brand: '',
      expiryDate: '',
    };
    setFilters(resetFilters);
    setSearchQuery('');
    setFilteredMedicationList(medicationList);
  };

  const handleAdd = () => {
    setCurrentMedication(null);
    setFormData({
      name: '',
      brand: '',
      quantity: '',
      buyingDate: '',
      expiryDate: '',
      dosage: '',
    });
    setErrors({
      name: '',
      brand: '',
      quantity: '',
      buyingDate: '',
      expiryDate: '',
      dosage: '',
    });
    setIsModalVisible(true);
  };

  const handleEdit = (medication) => {
    setCurrentMedication(medication);
    setFormData({
      name: medication.name,
      brand: medication.brand,
      quantity: medication.quantity,
      buyingDate: medication.buyingDate.split('T')[0],
      expiryDate: medication.expiryDate.split('T')[0],
      dosage: medication.dosage,
    });
    setErrors({
      name: '',
      brand: '',
      quantity: '',
      buyingDate: '',
      expiryDate: '',
      dosage: '',
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;
    try {
      await axios.delete(`/api/medication/${id}`);
      alert('Medication deleted successfully!');
      fetchMedications();
    } catch (error) {
      console.error('Delete medication error:', error.response || error.message);
      if (error.response?.status === 401) {
        alert('You are not authorized. Redirecting to login page...');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to delete medication');
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
      name: '',
      brand: '',
      quantity: '',
      buyingDate: '',
      expiryDate: '',
      dosage: '',
    };
    let isValid = true;

    if (!formData.name) {
      newErrors.name = 'Please select a medication type';
      isValid = false;
    }

    if (!formData.brand) {
      newErrors.brand = 'Please select a brand';
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

    if (!formData.buyingDate) {
      newErrors.buyingDate = 'Please select a buying date';
      isValid = false;
    } else {
      const today = new Date();
      const selectedDate = new Date(formData.buyingDate);
      if (selectedDate > today) {
        newErrors.buyingDate = 'Buying date cannot be in the future';
        isValid = false;
      }
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Please select an expiry date';
      isValid = false;
    } else {
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= new Date(formData.buyingDate)) {
        newErrors.expiryDate = 'Expiry date must be after buying date';
        isValid = false;
      }
    }

    if (!formData.dosage) {
      newErrors.dosage = 'Please enter dosage instructions';
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
      if (currentMedication) {
        await axios.put(`/api/medication/${currentMedication._id}`, payload);
        alert('Medication updated successfully!');
      } else {
        await axios.post('/api/medication', payload);
        alert('Medication added successfully!');
      }
      fetchMedications();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Submit medication error:', error.response || error.message);
      if (error.response?.status === 401) {
        alert('You are not authorized. Redirecting to login page...');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to save medication');
      }
    }
  };

  const generateReport = () => {
    try {
      console.log('Starting report generation...');
      console.log('filteredMedicationList:', filteredMedicationList);

      if (!filteredMedicationList || filteredMedicationList.length === 0) {
        alert('No medications to generate a report for.');
        return;
      }

      const doc = new jsPDF();
      console.log('jsPDF instance created:', doc);

      doc.setFontSize(18);
      doc.text('Medication Inventory Report', 14, 20);
      console.log('Title added');

      doc.setFontSize(12);
      doc.text(`Total Medications: ${filteredMedicationList.length}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 38);
      console.log('Summary added');

      const tableData = filteredMedicationList.map((med, index) => [
        index + 1,
        med.name || 'N/A',
        med.brand || 'N/A',
        med.quantity || 'N/A',
        new Date(med.buyingDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        }),
        new Date(med.expiryDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        }),
        med.dosage || 'N/A',
      ]);
      console.log('Table data prepared:', tableData);

      autoTable(doc, {
        startY: 50,
        head: [['#', 'Name', 'Brand', 'Quantity', 'Buying Date', 'Expiry Date', 'Dosage']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] }, // Green color for header
        styles: { fontSize: 10 },
      });
      console.log('Table added to PDF');

      try {
        doc.save('medication-report.pdf');
      } catch (saveError) {
        console.warn('Direct save failed, trying Blob method:', saveError);
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'medication-report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error generating report:', error, error.stack);
      alert(`Failed to generate report: ${error.message} (Check console for details)`);
    }
  };

  // Function to handle navigation to the Clothing page
  const handleClothingNavigation = () => {
    console.log('Clothing button clicked');
    navigate('/Clothing');
  };

  const totalMedications = filteredMedicationList.length;

  // Check if a medication is expired
  const isExpired = (expiryDate) => {
    const today = new Date();
    const expDate = new Date(expiryDate);
    return expDate < today;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Search Bar Section */}
      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-lg flex items-center gap-2">
          <TextInput
            id="search"
            type="text"
            placeholder="Search medications..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
            icon={HiSearch}
          />
          {searchQuery && (
            <Button
              onClick={clearSearch}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              <HiX className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Total Medications, Buttons, and Calendar */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg transform transition duration-300 hover:scale-105">
              <h2 className="text-lg font-bold">TOTAL MEDICATIONS</h2>
              <p className="text-4xl font-semibold">{totalMedications}</p>
            </Card>
            <div className="flex space-x-2">
              <Button
                onClick={handleAdd}
                className="bg-pink-200 text-pink-800 hover:bg-pink-300 shadow-md"
              >
                <HiPlus className="mr-2 h-5 w-5" />
                Add Medication
              </Button>
              <Button
                onClick={() => {
                  console.log('Generate Report button clicked');
                  generateReport();
                }}
                className="bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                disabled={filteredMedicationList.length === 0}
              >
                <HiDocumentDownload className="mr-2 h-5 w-5" />
                Generate Report
              </Button>
              {/* Clothing Button */}
              <Button
                onClick={handleClothingNavigation}
                className="bg-purple-500 text-white hover:bg-purple-600 shadow-md"
              >
                <FaTshirt className="mr-2 h-5 w-5" />
                Clothing
              </Button>
            </div>
          </div>

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
              {Array.from({ length: 35 }, (_, i) => {
                const day = i >= 6 ? i - 5 : null;
                return (
                  <div
                    key={i}
                    className={`p-1 ${
                      day === 24 ? 'bg-blue-500 text-white rounded-full' : 'text-gray-800'
                    } ${!day ? 'text-gray-300' : ''}`}
                  >
                    {day || ''}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Total Quantity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-lg font-bold">TABLETS QUANTITY</h2>
            <p className="text-4xl font-semibold">{totalQuantities['Tablets']}</p>
          </Card>
          <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-lg font-bold">SYRUPS QUANTITY</h2>
            <p className="text-4xl font-semibold">{totalQuantities['Syrups']}</p>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-lg font-bold">INHALERS QUANTITY</h2>
            <p className="text-4xl font-semibold">{totalQuantities['Inhalers']}</p>
          </Card>
          <Card className="bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-lg font-bold">CREAMS QUANTITY</h2>
            <p className="text-4xl font-semibold">{totalQuantities['Creams']}</p>
          </Card>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="shadow-lg mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="filterName" value="Filter by Medication Type" />
            <Select
              id="filterName"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {medicationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="filterBrand" value="Filter by Brand" />
            <Select
              id="filterBrand"
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="filterExpiryDate" value="Filter by Expiry Date" />
            <TextInput
              id="filterExpiryDate"
              type="date"
              name="expiryDate"
              value={filters.expiryDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={clearFilters}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              <HiX className="mr-2 h-5 w-5" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Medication Table */}
      <Card className="shadow-lg">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : filteredMedicationList.length === 0 ? (
          <p className="text-gray-600">No medications found. Adjust filters or add some!</p>
        ) : (
          <Table hoverable className="w-full">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Brand</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Buying Date</Table.HeadCell>
              <Table.HeadCell>Expiry Date</Table.HeadCell>
              <Table.HeadCell>Dosage</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredMedicationList.map((med) => (
                <Table.Row
                  key={med._id}
                  className={`${
                    isExpired(med.expiryDate) ? 'bg-red-100' : 'bg-white'
                  }`}
                >
                  <Table.Cell>{med.name}</Table.Cell>
                  <Table.Cell>{med.brand}</Table.Cell>
                  <Table.Cell>{med.quantity}</Table.Cell>
                  <Table.Cell>
                    {new Date(med.buyingDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(med.expiryDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                    })}
                  </Table.Cell>
                  <Table.Cell>{med.dosage}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        color="warning"
                        onClick={() => handleEdit(med)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white"
                      >
                        <HiPencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        color="failure"
                        onClick={() => handleDelete(med._id)}
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
        <Modal.Header>{currentMedication ? 'Edit Medication' : 'Add Medication'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" value="Medication Type" />
              <Select
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              >
                <option value="">Select Medication Type</option>
                {medicationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
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
              <Label htmlFor="buyingDate" value="Buying Date" />
              <TextInput
                id="buyingDate"
                type="date"
                name="buyingDate"
                value={formData.buyingDate}
                onChange={handleChange}
                required
              />
              {errors.buyingDate && (
                <p className="text-red-500 text-sm mt-1">{errors.buyingDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expiryDate" value="Expiry Date" />
              <TextInput
                id="expiryDate"
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dosage" value="Dosage Instructions" />
              <TextInput
                id="dosage"
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 1 tablet twice daily"
                required
              />
              {errors.dosage && (
                <p className="text-red-500 text-sm mt-1">{errors.dosage}</p>
              )}
            </div>

            <Button type="submit" color="success" className="w-full">
              {currentMedication ? 'Update' : 'Add'}
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Health Articles Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Health & Medication Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Article 1: Best Practices for Using Medicine Daily */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800">Best Practices for Using Medicine Daily</h3>
            <p className="text-gray-600 mt-2">
              To ensure safe and effective use of medications, follow these tips: 
              1. **Set a Schedule**: Take your medications at the same time each day to build a routine. 
              2. **Use Reminders**: Set alarms or use a pill organizer to avoid missing doses. 
              3. **Follow Instructions**: Always adhere to the dosage instructions provided by your doctor or pharmacist. 
              4. **Stay Hydrated**: Drink plenty of water when taking tablets to aid absorption. 
              5. **Consult Your Doctor**: If you experience side effects, consult your healthcare provider immediately.
            </p>
            <p className="text-sm text-gray-500 mt-3">Published: March 24, 2025</p>
          </Card>

          {/* Article 2: How to Store Medications to Avoid Waste */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800">How to Store Medications to Avoid Waste</h3>
            <p className="text-gray-600 mt-2">
              Improper storage can lead to medication waste. Here’s how to store them properly: 
              1. **Keep in a Cool, Dry Place**: Avoid storing medications in bathrooms where humidity can degrade them. 
              2. **Avoid Direct Sunlight**: Store in a dark place to prevent degradation of active ingredients. 
              3. **Check Expiry Dates**: Dispose of expired medications safely—don’t flush them down the toilet; take them to a pharmacy for proper disposal. 
              4. **Keep Out of Reach of Children**: Use child-proof containers and store in a secure location. 
              5. **Label Clearly**: Ensure all medications are labeled to avoid confusion.
            </p>
            <p className="text-sm text-gray-500 mt-3">Published: March 24, 2025</p>
          </Card>

          {/* Article 3: Tips for Managing Medication Schedules */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800">Tips for Managing Medication Schedules</h3>
            <p className="text-gray-600 mt-2">
              Managing multiple medications can be challenging. Try these strategies: 
              1. **Use a Medication Tracker**: Apps or physical trackers can help you log doses. 
              2. **Combine with Daily Habits**: Take medications with meals or before brushing your teeth to make it part of your routine. 
              3. **Inform Family Members**: Let your family know your schedule so they can remind you if needed. 
              4. **Plan for Travel**: Carry medications in your carry-on and keep a list of prescriptions. 
              5. **Review Regularly**: Periodically review your medications with your doctor to ensure they’re still necessary.
            </p>
            <p className="text-sm text-gray-500 mt-3">Published: March 24, 2025</p>
          </Card>
        </div>
      </div>
    </div>
  );
}