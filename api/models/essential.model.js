import mongoose from 'mongoose';

const essentialSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  noOfItems: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  description: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  type: { type: String, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Essential = mongoose.model('Essential', essentialSchema);

export default Essential;