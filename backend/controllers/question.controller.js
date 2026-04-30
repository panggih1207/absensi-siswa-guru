const Question = require('../models/Question');
const Test = require('../models/Test');

exports.getQuestions = async (req, res) => {
  try {
    const { testId } = req.query;
    const query = testId ? { test: testId } : {};
    const questions = await Question.find(query).populate('test', 'title');
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });

    // Add question to test
    if (req.body.test) {
      await Test.findByIdAndUpdate(req.body.test, {
        $push: { questions: question._id },
        $inc: { totalPoints: question.points },
      });
    }

    res.status(201).json({ success: true, data: question, message: 'Question created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, data: question, message: 'Question updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    // Remove from test
    if (question.test) {
      await Test.findByIdAndUpdate(question.test, {
        $pull: { questions: question._id },
        $inc: { totalPoints: -question.points },
      });
    }

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
