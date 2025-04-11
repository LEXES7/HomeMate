import Pantry from '../models/pantry.model.js';

export const getPantryItems = async (req, res) => {
  try {
    const pantryItems = await Pantry.find({ userId: req.user.id });
    res.json(pantryItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addPantryItem = async (req, res) => {
  const { title, content, price, expireDate, quantity } = req.body;
  
  const pantryItem = new Pantry({
    userId: req.user.id,
    title,
    content,
    price,
   
    expireDate,
    quantity
  });

  try {
    const newPantryItem = await pantryItem.save();
    res.status(201).json(newPantryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePantryItem = async (req, res) => {
  try {
    const pantryItem = await Pantry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!pantryItem) return res.status(404).json({ message: 'Pantry item not found' });
    res.json(pantryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePantryItem = async (req, res) => {
  try {
    const pantryItem = await Pantry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!pantryItem) return res.status(404).json({ message: 'Pantry item not found' });
    res.json({ message: 'Pantry item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};