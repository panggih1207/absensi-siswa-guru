const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },
  duration: { type: Number, default: 0 }, // in minutes
  order: { type: Number, default: 0 },
});

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedSteps: [{ type: Number }],
  percentage: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
});

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    thumbnail: { type: String, default: '' },
    duration: { type: Number, default: 0 }, // total in minutes
    steps: [stepSchema],
    ratings: [ratingSchema],
    progress: [progressSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
    tags: [{ type: String }],
    enrolledCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual for average rating
trainingSchema.virtual('averageRating').get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

trainingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Training', trainingSchema);
