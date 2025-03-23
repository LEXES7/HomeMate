import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Label, Select, TextInput, Table, Modal } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash, HiCalendar, HiDocumentDownload, HiX, HiSearch } from 'react-icons/hi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Apply autoTable to jsPDF
jsPDF.API.autoTable = autoTable;

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export default function Clothing() {
  const [clothingList, setClothingList] = useState([]);
  const [filteredClothingList, setFilteredClothingList] = useState([]);
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
  const [filters, setFilters] = useState({
    itemName: '',
    brand: '',
    purchaseDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

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
      setFilteredClothingList(response.data);
      console.log('Fetched clothingList:', response.data);
    } catch (error) {
      console.error('Fetch clothing error:', error.response || error.message);
      if (error.response?.status === 401) {
        alert('You are not authorized. Redirecting to login page...');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to fetch clothing items');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate total quantity for each item type
  const totalQuantities = clothingItems.reduce((acc, item) => {
    const total = clothingList
      .filter((clothing) => clothing.itemName === item)
      .reduce((sum, clothing) => sum + Number(clothing.quantity), 0);
    acc[item] = total;
    return acc;
  }, { 'T-Shirt': 0, 'Shirts': 0, 'Shoes': 0, 'Jackets': 0 });

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
    let filtered = [...clothingList];

    if (filters.itemName) {
      filtered = filtered.filter((clothing) => clothing.itemName === filters.itemName);
    }

    if (filters.brand) {
      filtered = filtered.filter((clothing) => clothing.brand === filters.brand);
    }

    if (filters.purchaseDate) {
      filtered = filtered.filter((clothing) => {
        const clothingDate = new Date(clothing.purchaseDate).toISOString().split('T')[0];
        return clothingDate === filters.purchaseDate;
      });
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((clothing) =>
        Object.values(clothing).some((value) =>
          value?.toString().toLowerCase().includes(lowerQuery)
        )
      );
    }

    setFilteredClothingList(filtered);
  };

  const clearFilters = () => {
    const resetFilters = {
      itemName: '',
      brand: '',
      purchaseDate: '',
    };
    setFilters(resetFilters);
    setSearchQuery('');
    setFilteredClothingList(clothingList);
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
      console.error('Delete clothing error:', error.response || error.message);
      if (error.response?.status === 401) {
        alert('You are not authorized. Redirecting to login page...');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to delete clothing item');
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
      itemName: '',
      brand: '',
      quantity: '',
      purchaseDate: '',
    };
    let isValid = true;

    if (!formData.itemName) {
      newErrors.itemName = 'Please select a clothing type';
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
      console.error('Submit clothing error:', error.response || error.message);
      if (error.response?.status === 401) {
        alert('You are not authorized. Redirecting to login page...');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to save clothing item');
      }
    }
  };

  const generateReport = () => {
    try {
      console.log('Starting report generation...');
      console.log('filteredClothingList:', filteredClothingList);

      if (!filteredClothingList || filteredClothingList.length === 0) {
        alert('No clothing items to generate a report for.');
        return;
      }

      const doc = new jsPDF();
      console.log('jsPDF instance created:', doc);

      doc.setFontSize(18);
      doc.text('Clothing Inventory Report', 14, 20);
      console.log('Title added');

      doc.setFontSize(12);
      doc.text(`Total Clothing Items: ${filteredClothingList.length}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 38);
      console.log('Summary added');

      const tableData = filteredClothingList.map((clothing, index) => {
        if (!clothing.itemName || !clothing.brand || !clothing.quantity || !clothing.purchaseDate) {
          console.warn(`Invalid clothing item at index ${index}:`, clothing);
          return [
            index + 1,
            clothing.itemName || 'N/A',
            clothing.brand || 'N/A',
            clothing.quantity || 'N/A',
            clothing.purchaseDate ? new Date(clothing.purchaseDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            }) : 'N/A',
          ];
        }
        return [
          index + 1,
          clothing.itemName,
          clothing.brand,
          clothing.quantity,
          new Date(clothing.purchaseDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          }),
        ];
      });
      console.log('Table data prepared:', tableData);

      autoTable(doc, {
        startY: 50,
        head: [['#', 'Item Name', 'Brand', 'Quantity', 'Purchase Date']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 10 },
      });
      console.log('Table added to PDF');

      try {
        doc.save('clothing-report.pdf');
      } catch (saveError) {
        console.warn('Direct save failed, trying Blob method:', saveError);
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'clothing-report.pdf';
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

  const totalClothingItems = filteredClothingList.length;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Search Bar Section */}
      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-lg flex items-center gap-2">
          <TextInput
            id="search"
            type="text"
            placeholder="Search clothing items..."
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

      {/* Total Clothing Items, Buttons, and Calendar */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <Card className="bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg transform transition duration-300 hover:scale-105">
              <h2 className="text-lg font-bold">TOTAL CLOTHING ITEMS</h2>
              <p className="text-4xl font-semibold">{totalClothingItems}</p>
            </Card>
            <div className="flex space-x-2">
              <Button
                onClick={handleAdd}
                className="bg-pink-200 text-pink-800 hover:bg-pink-300 shadow-md"
              >
                <HiPlus className="mr-2 h-5 w-5" />
                Add clothing
              </Button>
              <Button
                onClick={() => {
                  console.log('Generate Report button clicked');
                  generateReport();
                }}
                className="bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                disabled={filteredClothingList.length === 0}
              >
                <HiDocumentDownload className="mr-2 h-5 w-5" />
                Generate Report
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
                      day === 22 ? 'bg-blue-500 text-white rounded-full' : 'text-gray-800'
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
            <h2 className="text-lg font-bold">T-SHIRT QUANTITY</h2>
            <p className="text-4xl font-semibold">{totalQuantities['T-Shirt']}</p>
          </Card>
          <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-lg font-bold">SHIRTS QUANTITY</h2>
            <p className="text-4xl font-semibold">{totalQuantities['Shirts']}</p>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-lg font-bold">SHOES QUANTITY</h2>
            <p className="text-4xl font-semibold">{totalQuantities['Shoes']}</p>
          </Card>
          <Card className="bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-lg font-bold">JACKETS QUANTITY</h2>
            <p className="text-4xl font-semibold">{totalQuantities['Jackets']}</p>
          </Card>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="shadow-lg mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="filterItemName" value="Filter by Item Name" />
            <Select
              id="filterItemName"
              name="itemName"
              value={filters.itemName}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {clothingItems.map((item) => (
                <option key={item} value={item}>
                  {item}
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
            <Label htmlFor="filterPurchaseDate" value="Filter by Purchase Date" />
            <TextInput
              id="filterPurchaseDate"
              type="date"
              name="purchaseDate"
              value={filters.purchaseDate}
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

      {/* Clothing Table */}
      <Card className="shadow-lg">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : filteredClothingList.length === 0 ? (
          <p className="text-gray-600">No clothing items found. Adjust filters or add some!</p>
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
              {filteredClothingList.map((clothing) => (
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

      {/* Latest Brand Updates Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Latest Brand Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Gucci Update */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800">Gucci Spring/Summer 2025 Collection</h3>
            <p className="text-gray-600 mt-2">
              Gucci recently unveiled its Spring/Summer 2025 collection, featuring a range of shirts in dreamlike settings under the #GucciWhereLightFindsUs campaign. The collection also includes knitwear and other ready-to-wear items, blending the real with the imaginary. Additionally, the Fall 2025 collection focused on tailored shirts for men, paired with double-breasted suits.
            </p>
            <p className="text-sm text-gray-500 mt-3">Published: March 11, 2025 (SS25 Campaign), February 25, 2025 (Fall Collection)</p>
          </Card>

          {/* Nike Update */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800">Nike 2024-2025 NBA Season Gear</h3>
            <p className="text-gray-600 mt-2">
              Nike has launched new shirts and jerseys for the 2024-2025 NBA season, including the Ja Morant Memphis Grizzlies Essential Hardwood Classics T-Shirt and swingman jerseys for teams like the Golden State Warriors and LA Clippers. Perfect for fans looking to support their favorite teams in style.
            </p>
            <p className="text-sm text-gray-500 mt-3">Published: October 18, 2024</p>
          </Card>

          {/* Levi's Update */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800">Levi's x Nike Air Max 95 Collaboration</h3>
            <p className="text-gray-600 mt-2">
              Levi's is collaborating with Nike to release a three-pack of Air Max 95 sneakers in Summer 2025, celebrating the sneaker's 30th anniversary. The collaboration includes a clothing capsule, which may feature casual shirts, continuing Levi's tradition of iconic casual wear.
            </p>
            <p className="text-sm text-gray-500 mt-3">Published: August 5, 2024</p>
          </Card>

          {/* Emirates Update */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800">Emirates Football Shirts</h3>
            <p className="text-gray-600 mt-2">
              Emirates continues to support football fans by offering the latest shirts from sponsored clubs like Arsenal, Real Madrid, and Paris Saint-Germain. Available in youth and adult sizes, these shirts let you cheer on your favorite team in style through the Emirates Official Store.
            </p>
            <p className="text-sm text-gray-500 mt-3">Published: Ongoing</p>
          </Card>
        </div>
      </div>
    </div>
  );
}