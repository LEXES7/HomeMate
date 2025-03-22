import Clothing from '../models/clothing.model.js';

export const getClothings = async (req, res) => {
  try {
    const clothings = await Clothing.find({ userId: req.user.id });
    res.json(clothings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addClothing = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('User ID from token:', req.user.id);
  const clothing = new Clothing({ ...req.body, userId: req.user.id });
  try {
    const newClothing = await clothing.save();
    res.status(201).json(newClothing);
  } catch (error) {
    console.error('Add clothing error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateClothing = async (req, res) => {
  try {
    const clothing = await Clothing.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!clothing) return res.status(404).json({ message: 'Clothing item not found' });
    res.json(clothing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteClothing = async (req, res) => {
  try {
    const clothing = await Clothing.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!clothing) return res.status(404).json({ message: 'Clothing item not found' });
    res.json({ message: 'Clothing item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};