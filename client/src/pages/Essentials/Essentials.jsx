import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, TextInput, Label, Select, Badge } from "flowbite-react";
import { HiPlus, HiOutlinePencil, HiOutlineTrash, HiSearch, HiBell } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

  const validateForm = () => {
    if (!formData.itemName.trim()) {
      toast.error("Item name is required.");
      return false;
    }
    if (!formData.noOfItems || formData.noOfItems <= 0) {
      toast.error("Number of items must be greater than 0.");
      return false;
    }
    if (!formData.expiryDate) {
      toast.error("Expiry date is required.");
      return false;
    }
    if (!formData.currentPrice || formData.currentPrice <= 0) {
      toast.error("Current price must be greater than 0.");
      return false;
    }
    if (!formData.type) {
      toast.error("Type is required.");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required.");
      return false;
    }
    return true;
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

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300">
      <ToastContainer theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'} />

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
            color="success"
            onClick={handleAdd}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <HiPlus className="mr-2" />
            Add Essential
          </Button>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">Total Essentials</h3>
          <p className="text-2xl text-blue-900 dark:text-blue-100">{totalEssentials}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Expired Items</h3>
          <p className="text-2xl text-red-900 dark:text-red-100">{expiredEssentials.length}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-200">Food Items</h3>
          <p className="text-2xl text-green-900 dark:text-green-100">{foodEssentials}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">Medicine Items</h3>
          <p className="text-2xl text-yellow-900 dark:text-yellow-100">{medicineEssentials}</p>
        </div>
      </div>

      {/* Essentials Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-h-[750px] overflow-y-auto p-2">
        {filteredEssentials.length > 0 ? (
          filteredEssentials.map((essential) => (
            <div
              key={essential._id}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{essential.itemName}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Quantity:</strong> {essential.noOfItems}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Expiry:</strong> {essential.expiryDate.split("T")[0]}
                  {new Date(essential.expiryDate) < new Date() && (
                    <Badge color="failure" className="ml-2">Expired</Badge>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Price:</strong> Rs. {essential.currentPrice}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Type:</strong> {essential.type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Description:</strong> {essential.description}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  color="warning"
                  size="xs"
                  onClick={() => handleEdit(essential)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                >
                  <HiOutlinePencil />
                </Button>
                <Button
                  color="failure"
                  size="xs"
                  onClick={() => handleDelete(essential._id)}
                  className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  <HiOutlineTrash />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            No essentials found.
          </p>
        )}
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
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="noOfItems" value="Number of Items" className="text-gray-900 dark:text-white" />
              <TextInput
                id="noOfItems"
                name="noOfItems"
                type="number"
                placeholder="Enter number of items"
                value={formData.noOfItems}
                onChange={(e) => setFormData({ ...formData, noOfItems: e.target.value })}
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
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="currentPrice" value="Current Price (LKR)" className="text-gray-900 dark:text-white" />
              <TextInput
                id="currentPrice"
                name="currentPrice"
                type="number"
                placeholder="Enter price"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                required
                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" value="Description" className="text-gray-900 dark:text-white" />
              <TextInput
                id="description"
                name="description"
                type="text"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required


                className="bg-gray-50 dark:bg-gray-700 dark:text-white"
              >
                <option value="Food">Food</option>
                <option value="Medicine">Medicine</option>
                <option value="Cleaning Supplies">Cleaning Supplies</option>
                <option value="Other">Other</option>
              </Select>
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

      {/* Notification Modal */}
      <Modal show={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} className="dark:bg-gray-800">
        <Modal.Header className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
          Expired Essentials
        </Modal.Header>
        <Modal.Body className="bg-white dark:bg-gray-800">
          {expiredEssentials.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {expiredEssentials.map((essential) => (
                <li
                  key={essential._id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
                >
                  <p className="text-gray-900 dark:text-white">
                    <strong>{essential.itemName}</strong> (Type: {essential.type})
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Expired on: {essential.expiryDate.split("T")[0]}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Quantity: {essential.noOfItems}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">No expired essentials.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-white dark:bg-gray-800">
          <Button
            color="gray"
            onClick={() => setIsNotificationModalOpen(false)}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Essentials;