import mongoose from 'mongoose';

const applianceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  warrantyExpiry: { type: Date, required: true },
  maintenanceSchedule: { type: Date, required: true },
  value: { type: Number, required: true },
  pastMaintenance: { type: [Date], default: [] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
}, { timestamps: true });

const Appliance = mongoose.model('Appliance', applianceSchema);

export default Appliance;