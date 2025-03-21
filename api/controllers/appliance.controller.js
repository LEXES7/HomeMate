import Appliance from '../models/appliance.model.js';

export const getAppliances = async (req, res) => {
  try {
    const appliances = await Appliance.find({ userId: req.user.id }); 
    res.json(appliances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAppliance = async (req, res) => {
  const appliance = new Appliance({ ...req.body, userId: req.user.id }); 
  try {
    const newAppliance = await appliance.save();
    res.status(201).json(newAppliance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAppliance = async (req, res) => {
  try {
    const appliance = await Appliance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // Ensure the appliance belongs to the user
      req.body,
      { new: true }
    );
    if (!appliance) return res.status(404).json({ message: 'Appliance not found' });
    res.json(appliance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAppliance = async (req, res) => {
  try {
    const appliance = await Appliance.findOneAndDelete({ _id: req.params.id, userId: req.user.id }); 
    if (!appliance) return res.status(404).json({ message: 'Appliance not found' });
    res.json({ message: 'Appliance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};