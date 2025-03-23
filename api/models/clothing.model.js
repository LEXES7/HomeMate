import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  brand: { type: String, required: true },
  quantity: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Clothing = mongoose.model('Clothing', clothingSchema);

export default Clothing;