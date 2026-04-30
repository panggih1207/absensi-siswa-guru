const Test = require('../models/Test');
const Question = require('../models/Question');

exports.getTests = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, difficulty, course } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;
    if (course) query.course = course;

    const tests = await Test.find(query)
      .populate('createdBy', 'name')
      .populate('course', 'title')
      .populate('questions')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Test.countDocuments(query);
    res.json({ success: true, data: tests, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('course', 'title')
      .populate('questions');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTest = async (req, res) => {
  try {
    const test = await Test.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: test, message: 'Test created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, data: test, message: 'Test updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    // Also delete associated questions
    await Question.deleteMany({ test: req.params.id });
    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
