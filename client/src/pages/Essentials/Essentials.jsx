import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, TextInput, Label, Select, Badge } from "flowbite-react";
import { HiPlus, HiOutlinePencil, HiOutlineTrash, HiSearch, HiBell, HiExclamationCircle, HiDocumentReport } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";

const Essentials = () => {
  const [essentials, setEssentials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentEssential, setCurrentEssential] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    noOfItems: "",
    expiryDate: "",
    currentPrice: "",
    type: "Food",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({
    itemName: "",
    noOfItems: "",
    expiryDate: "",
    currentPrice: "",
    description: "",
  });

  const fetchEssentials = async () => {
    try {
      const res = await axios.get("/api/essentials");
      setEssentials(res.data);
    } catch (error) {
      console.error("Error fetching essentials:", error);
      toast.error("Failed to fetch essentials.");
    }
  };

  useEffect(() => {
    fetchEssentials();
  }, []);

  const handleAdd = () => {
    setCurrentEssential(null);
    setFormData({
      itemName: "",
      noOfItems: "",
      expiryDate: "",
      currentPrice: "",
      type: "Food",
      description: "",
    });
    setFormErrors({
      itemName: "",
      noOfItems: "",
      expiryDate: "",
      currentPrice: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (essential) => {
    setCurrentEssential(essential);
    setFormData({
      itemName: essential.itemName,
      noOfItems: essential.noOfItems,
      expiryDate: essential.expiryDate.split("T")[0],
      currentPrice: essential.currentPrice,
      type: essential.type,
      description: essential.description || "",
    });
    setFormErrors({
      itemName: "",
      noOfItems: "",
      expiryDate: "",
      currentPrice: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`/api/essentials/${id}`);
        fetchEssentials();
        toast.success("Essential deleted successfully!");
      } catch (error) {
        console.error("Error deleting essential:", error);
        toast.error("Failed to delete essential.");
      }
    }
  };

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = "";
    let updatedValue = value;

    switch (name) {
      case "noOfItems":
        // Only allow positive integers
        if (!/^\d*$/.test(value)) {
          error = "Only numbers are allowed";
          updatedValue = formData.noOfItems; // Keep old valid value
        } else if (parseInt(value) <= 0 && value !== "") {
          error = "Quantity must be greater than 0";
        }
        break;
      
      case "expiryDate":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        
        if (selectedDate < today) {
          error = "Expiry date cannot be in the past";
        }
        break;
      
      case "currentPrice":
        // Allow only positive numbers with up to 2 decimal places
        if (!/^\d*\.?\d{0,2}$/.test(value)) {
          error = "Invalid price format";
          updatedValue = formData.currentPrice; // Keep old valid value
        } else if (parseFloat(value) <= 0 && value !== "") {
          error = "Price must be greater than 0";
        }
        break;
      
      case "description":
        const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
        if (wordCount > 200) {
          error = "Description cannot exceed 200 words";
        }
        break;
    }

    setFormData({ ...formData, [name]: updatedValue });
    setFormErrors({ ...formErrors, [name]: error });
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate item name
    if (!formData.itemName.trim()) {
      errors.itemName = "Item name is required";
      isValid = false;
    }

    // Validate number of items
    if (!formData.noOfItems) {
      errors.noOfItems = "Number of items is required";
      isValid = false;
    } else if (parseInt(formData.noOfItems) <= 0) {
      errors.noOfItems = "Number of items must be greater than 0";
      isValid = false;
    }

    // Validate expiry date
    if (!formData.expiryDate) {
      errors.expiryDate = "Expiry date is required";
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.expiryDate);
      if (selectedDate < today) {
        errors.expiryDate = "Expiry date cannot be in the past";
        isValid = false;
      }
    }

    // Validate price
    if (!formData.currentPrice) {
      errors.currentPrice = "Current price is required";
      isValid = false;
    } else if (parseFloat(formData.currentPrice) <= 0) {
      errors.currentPrice = "Current price must be greater than 0";
      isValid = false;
    }

    // Validate description
    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    } else {
      const wordCount = formData.description.trim().split(/\s+/).length;
      if (wordCount > 200) {
        errors.description = "Description cannot exceed 200 words";
        isValid = false;
      }
    }

    setFormErrors(errors);
    
    if (!isValid) {
      toast.error("Please fix all form errors before submitting.");
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (currentEssential) {
        await axios.put(`/api/essentials/${currentEssential._id}`, formData);
        toast.success("Essential updated successfully!");
      } else {
        const response = await axios.post("/api/essentials", formData);
        if (response.status === 201 || response.status === 200) {
          toast.success("Essential added successfully!");
        } else {
          throw new Error("Unexpected response status");
        }
      }
      setIsModalOpen(false);
      fetchEssentials();
    } catch (error) {
      console.error("Error saving essential:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to save essential. Please try again.");
    }
  };

  const filteredEssentials = essentials.filter((essential) =>
    essential.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Counter Calculations
  const totalEssentials = essentials.length;
  const expiredEssentials = essentials.filter(
    (essential) => new Date(essential.expiryDate) < new Date()
  );
  const foodEssentials = essentials.filter((essential) => essential.type === "Food").length;
  const medicineEssentials = essentials.filter((essential) => essential.type === "Medicine").length;
  const cleaningEssentials = essentials.filter((essential) => essential.type === "Cleaning Supplies").length;
  const otherEssentials = essentials.filter((essential) => essential.type === "Other").length;

  // Get today's date for min attribute in date input
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    
    return `${year}-${month}-${day}`;
  };

  // Function to generate a report
  const handleGenerateReport = () => {
    const doc = new jsPDF();

    // Set custom font
    doc.setFont('helvetica', 'normal');

    // Header Section: Title and Branding
    doc.setFillColor(65, 105, 225); // Royal blue background
    doc.rect(0, 0, 210, 40, 'F'); // Full-width header
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont('helvetica', 'bold');
    doc.text('Essentials Inventory Report', 20, 25);

    // Subheader: Generated Date
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, 20, 35);

    // Summary Section: Totals
    doc.setFontSize(16);
    doc.setTextColor(65, 105, 225); // Royal blue text
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 55);

    // Summary Cards (Boxed Layout)
    const summaryData = [
      { label: 'Total Items', value: totalEssentials },
      { label: 'Expired Items', value: expiredEssentials.length },
      { label: 'Food Items', value: foodEssentials },
      { label: 'Medicine Items', value: medicineEssentials },
      { label: 'Cleaning Supplies', value: cleaningEssentials },
      { label: 'Other Items', value: otherEssentials },
    ];

    summaryData.forEach((item, index) => {
      const x = 20 + (index % 2) * 90; // Two columns
      const y = 65 + Math.floor(index / 2) * 30; // Three rows
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

    // Inventory Details: Table
    doc.setFontSize(16);
    doc.setTextColor(65, 105, 225);
    doc.setFont('helvetica', 'bold');
    doc.text('Inventory Details', 20, 165);

    // Use autoTable for a styled table
    let finalY = 175; // Default startY
    autoTable(doc, {
      startY: 175,
      head: [['Item Name', 'Type', 'Price (LKR)', 'Expiry Date', 'Quantity', 'Status']],
      body: essentials.map((essential) => [
        essential.itemName,
        essential.type,
        essential.currentPrice.toFixed(2),
        moment(essential.expiryDate).format('DD/MM/YYYY'),
        essential.noOfItems,
        new Date(essential.expiryDate) < new Date() ? 'Expired' : 'Active'
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
        textColor: [33, 33, 33], // Dark gray text
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [65, 105, 225], // Royal blue header
        textColor: [255, 255, 255], // White text
        fontSize: 11,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light gray for alternate rows
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Item Name
        1: { cellWidth: 30 }, // Type
        2: { cellWidth: 25 }, // Price
        3: { cellWidth: 30 }, // Exp. Date
        4: { cellWidth: 20 }, // Quantity
        5: { cellWidth: 25 }, // Status
      },
      margin: { top: 175, left: 20, right: 20 },
      didDrawPage: (data) => {
        finalY = data.cursor.y; // Capture the final Y position of the table
      },
    });

    // Name and Signature Section
    const nameY = finalY + 20; // 20mm below the table
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33); // Dark gray text
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared by:', 20, nameY);
    doc.setFont('helvetica', 'normal');
    doc.text('HomeMate Administrator', 60, nameY);

    const signatureY = nameY + 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Signature:', 130, signatureY);
    doc.setDrawColor(100, 100, 100); // Gray line
    doc.line(150, signatureY + 2, 190, signatureY + 2);

    // Footer: Page Number and Branding
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray text
      doc.text(`Page ${i} of ${pageCount}`, 180, 290, { align: 'right' });
      doc.text('Generated by HomeMate Essentials Manager', 20, 290);
    }

    // Save the PDF
    doc.save(`Essentials_Report_${moment().format('YYYYMMDD_HHmm')}.pdf`);
    
    // Notify the user that report was generated
    toast.success("Report generated successfully!");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300">
      <ToastContainer theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Essentials Management</h1>
          {expiredEssentials.length > 0 && (
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              <HiBell className="w-6 h-6" />
              <Badge color="failure" className="absolute -top-1 -right-1">{expiredEssentials.length}</Badge>
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <TextInput
            type="text"
            placeholder="Search essentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={HiSearch}
            className="w-full sm:w-64 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
          <Button
            color="info"
            onClick={handleGenerateReport}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <HiDocumentReport className="mr-2" />
            Generate Report
          </Button>
          <Button
            color="success"
            onClick={handleAdd}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <HiPlus className="mr-2" />
            Add Essential
          </Button>
        </div>
      </div>

      {/* Stats counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-300">Total Essentials</h3>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">{totalEssentials}</p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-300">Expired Items</h3>
          <p className="text-3xl font-bold text-red-700 dark:text-red-200">{expiredEssentials.length}</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-green-600 dark:text-green-300">Food Items</h3>
          <p className="text-3xl font-bold text-green-700 dark:text-green-200">{foodEssentials}</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-300">Medicine</h3>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-200">{medicineEssentials}</p>
        </div>
      </div>

      {/* Essentials list */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-800 dark:text-gray-200">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">Item Name</th>
              <th scope="col" className="px-6 py-3">Quantity</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Expiry Date</th>
              <th scope="col" className="px-6 py-3">Price (LKR)</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEssentials.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  No essentials found.
                </td>
              </tr>
            ) : (
              filteredEssentials.map((essential) => (
                <tr key={essential._id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4 font-medium">{essential.itemName}</td>
                  <td className="px-6 py-4">{essential.noOfItems}</td>
                  <td className="px-6 py-4">
                    <Badge color={
                      essential.type === "Food" ? "success" :
                      essential.type === "Medicine" ? "purple" :
                      essential.type === "Cleaning Supplies" ? "blue" : "gray"
                    }>
                      {essential.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {new Date(essential.expiryDate) < new Date() ? (
                        <Badge color="failure" className="mr-2">Expired</Badge>
                      ) : null}
                      {new Date(essential.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">{essential.currentPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(essential)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(essential._id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} className="dark:bg-gray-800">
        <Modal.Header className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
          {currentEssential ? "Edit Essential" : "Add Essential"}
        </Modal.Header>
        <Modal.Body className="bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="itemName" value="Item Name" className="text-gray-900 dark:text-white" />
              <TextInput
                id="itemName"
                name="itemName"
                type="text"
                placeholder="Enter item name"
                value={formData.itemName}
                onChange={handleInputChange}
                color={formErrors.itemName ? "failure" : undefined}
                helperText={formErrors.itemName && (
                  <span className="text-red-500 flex items-center gap-1">
                    <HiExclamationCircle /> {formErrors.itemName}
                  </span>
                )}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="noOfItems" value="Number of Items" className="text-gray-900 dark:text-white" />
              <TextInput
                id="noOfItems"
                name="noOfItems"
                type="text"
                inputMode="numeric"
                placeholder="Enter number of items"
                value={formData.noOfItems}
                onChange={handleInputChange}
                color={formErrors.noOfItems ? "failure" : undefined}
                helperText={formErrors.noOfItems && (
                  <span className="text-red-500 flex items-center gap-1">
                    <HiExclamationCircle /> {formErrors.noOfItems}
                  </span>
                )}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="expiryDate" value="Expiry Date" className="text-gray-900 dark:text-white" />
              <TextInput
                id="expiryDate"
                name="expiryDate"
                type="date"
                min={getTodayDateString()}
                value={formData.expiryDate}
                onChange={handleInputChange}
                color={formErrors.expiryDate ? "failure" : undefined}
                helperText={formErrors.expiryDate && (
                  <span className="text-red-500 flex items-center gap-1">
                    <HiExclamationCircle /> {formErrors.expiryDate}
                  </span>
                )}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="currentPrice" value="Current Price (LKR)" className="text-gray-900 dark:text-white" />
              <TextInput
                id="currentPrice"
                name="currentPrice"
                type="text"
                inputMode="decimal"
                placeholder="Enter price"
                value={formData.currentPrice}
                onChange={handleInputChange}
                color={formErrors.currentPrice ? "failure" : undefined}
                helperText={formErrors.currentPrice && (
                  <span className="text-red-500 flex items-center gap-1">
                    <HiExclamationCircle /> {formErrors.currentPrice}
                  </span>
                )}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="type" value="Type" className="text-gray-900 dark:text-white" />
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              >
                <option value="Food">Food</option>
                <option value="Medicine">Medicine</option>
                <option value="Cleaning Supplies">Cleaning Supplies</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" value="Description" className="text-gray-900 dark:text-white" />
              <TextInput
                id="description"
                name="description"
                type="text"
                placeholder="Enter description (max 200 words)"
                value={formData.description}
                onChange={handleInputChange}
                color={formErrors.description ? "failure" : undefined}
                helperText={formErrors.description && (
                  <span className="text-red-500 flex items-center gap-1">
                    <HiExclamationCircle /> {formErrors.description}
                  </span>
                )}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Word count: {formData.description.trim() ? formData.description.trim().split(/\s+/).length : 0}/200
              </div>
            </div>

            <Button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {currentEssential ? "Update" : "Add"} Essential
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Notifications Modal */}
      <Modal show={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} className="dark:bg-gray-800">
        <Modal.Header className="bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
          Expired Essentials ({expiredEssentials.length})
        </Modal.Header>
        <Modal.Body className="bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              The following items have expired and should be replaced:
            </p>
            <ul className="space-y-3">
              {expiredEssentials.map((essential) => (
                <li
                  key={essential._id}
                  className="flex justify-between items-center bg-red-50 dark:bg-red-900/30 p-3 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{essential.itemName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Expired on {new Date(essential.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge color="failure">Expired</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Essentials;