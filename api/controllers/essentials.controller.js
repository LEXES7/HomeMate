import Essential from '../models/essential.model.js';

export const getEssentials = async (req, res) => {
  try {
    const essentials = await Essential.find({ userId: req.user.id });
    res.json(essentials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addEssential = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('User ID from token:', req.user.id);
  const essential = new Essential({ ...req.body, userId: req.user.id });
  try {
    const newEssential = await essential.save();
    res.status(201).json(newEssential);
  } catch (error) {
    console.error('Add essential error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateEssential = async (req, res) => {
  try {
    const essential = await Essential.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!essential) return res.status(404).json({ message: 'Essential item not found' });
    res.json(essential);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEssential = async (req, res) => {
  try {
    const essential = await Essential.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!essential) return res.status(404).json({ message: 'Essential item not found' });
    res.json({ message: 'Essential item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};