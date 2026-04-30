const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    duration: { type: Number, default: 30 }, // in minutes
    passingScore: { type: Number, default: 60 }, // percentage
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    isPublished: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 3 },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
