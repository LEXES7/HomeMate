import mongoose from "mongoose";

const pantrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },

  price: { type: Number, required: true },
  expireDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
}, { timestamps: true });

const Pantry = mongoose.model('Pantry', pantrySchema);
export default Pantry;