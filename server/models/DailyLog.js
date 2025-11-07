import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  totalKm: {
    type: Number,
    required: true,
    min: 0,
  },
  fuelCost: {
    type: Number,
    required: true,
    min: 0,
  },
  otherExpenses: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  cashCollected: {
    type: Number,
    required: true,
    min: 0,
  },
  onlineCollected: {
    type: Number,
    required: true,
    min: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  expenseBill: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Calculate total earnings before saving
dailyLogSchema.pre('save', function (next) {
  this.totalEarnings = (this.cashCollected + this.onlineCollected) - (this.fuelCost + this.otherExpenses);
  next();
});

// Index for efficient queries
dailyLogSchema.index({ driverId: 1, date: 1 }, { unique: true });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

export default DailyLog;

