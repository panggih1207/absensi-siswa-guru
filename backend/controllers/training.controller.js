const Training = require('../models/Training');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all trainings
exports.getTrainings = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, level, category } = req.query;
    const query = {};
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (level) query.level = level;
    if (category) query.category = category;

    const trainings = await Training.find(query)
      .populate('createdBy', 'name avatar')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Training.countDocuments(query);

    res.json({ success: true, data: trainings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single training
exports.getTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate('createdBy', 'name avatar');
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create training
exports.createTraining = async (req, res) => {
  try {
    const training = await Training.create({ ...req.body, createdBy: req.user._id });

    // Notify all students
    const students = await User.find({ role: 'student' }, '_id');
    const notifications = students.map((s) => ({
      recipient: s._id,
      title: 'New Training Available',
      message: `A new training "${training.title}" has been added.`,
      type: 'info',
      category: 'training',
      relatedId: training._id,
    }));
    if (notifications.length > 0) await Notification.insertMany(notifications);

    res.status(201).json({ success: true, data: training, message: 'Training created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update training
exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    res.json({ success: true, data: training, message: 'Training updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete training
exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    res.json({ success: true, message: 'Training deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rate training
exports.rateTraining = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });

    const existingRating = training.ratings.find((r) => r.user?.toString() === req.user._id.toString());
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
    } else {
      training.ratings.push({ user: req.user._id, rating, comment });
    }

    await training.save();
    res.json({ success: true, data: training, message: 'Rating submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update progress
exports.updateProgress = async (req, res) => {
  try {
    const { completedSteps } = req.body;
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });

    const totalSteps = training.steps.length;
    const percentage = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

    const existingProgress = training.progress.find((p) => p.user?.toString() === req.user._id.toString());
    if (existingProgress) {
      existingProgress.completedSteps = completedSteps;
      existingProgress.percentage = percentage;
      existingProgress.lastAccessed = new Date();
    } else {
      training.progress.push({ user: req.user._id, completedSteps, percentage });
    }

    await training.save();
    res.json({ success: true, data: { percentage }, message: 'Progress updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
