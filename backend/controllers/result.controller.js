const Result = require('../models/Result');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Notification = require('../models/Notification');

exports.getResults = async (req, res) => {
  try {
    const { studentId, testId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (testId) query.test = testId;
    // Students can only see their own results
    if (req.user.role === 'student') query.student = req.user._id;

    const results = await Result.find(query)
      .populate('student', 'name avatar')
      .populate('test', 'title difficulty passingScore')
      .populate('course', 'title')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Result.countDocuments(query);
    res.json({ success: true, data: results, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitResult = async (req, res) => {
  try {
    const { testId, answers, timeTaken } = req.body;

    const test = await Test.findById(testId).populate('questions');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    // Check attempt count
    const attemptCount = await Result.countDocuments({ student: req.user._id, test: testId });
    if (attemptCount >= test.maxAttempts) {
      return res.status(400).json({ success: false, message: 'Maximum attempts reached' });
    }

    // Grade answers
    let score = 0;
    const gradedAnswers = answers.map((answer) => {
      const question = test.questions.find((q) => q._id.toString() === answer.questionId);
      if (!question) return { ...answer, isCorrect: false, pointsEarned: 0 };

      let isCorrect = false;
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const correctOption = question.options.find((o) => o.isCorrect);
        isCorrect = correctOption && correctOption.text === answer.selectedOption;
      } else if (question.type === 'short-answer') {
        isCorrect = question.correctAnswer.toLowerCase() === answer.selectedOption.toLowerCase();
      }

      const pointsEarned = isCorrect ? question.points : 0;
      score += pointsEarned;

      return { question: question._id, selectedOption: answer.selectedOption, isCorrect, pointsEarned };
    });

    const totalPoints = test.totalPoints || test.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= test.passingScore;

    const result = await Result.create({
      student: req.user._id,
      test: testId,
      course: test.course,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
      passed,
      timeTaken,
      attemptNumber: attemptCount + 1,
    });

    // Send notification
    await Notification.create({
      recipient: req.user._id,
      title: passed ? 'Test Passed! 🎉' : 'Test Completed',
      message: `You scored ${percentage}% on "${test.title}". ${passed ? 'Congratulations!' : 'Keep practicing!'}`,
      type: passed ? 'success' : 'info',
      category: 'result',
      relatedId: result._id,
    });

    const populatedResult = await Result.findById(result._id)
      .populate('test', 'title passingScore')
      .populate('student', 'name');

    res.status(201).json({ success: true, data: populatedResult, message: 'Test submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'name avatar')
      .populate('test', 'title difficulty passingScore')
      .populate('answers.question');
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
