const User = require('../models/User');
const Training = require('../models/Training');
const Course = require('../models/Course');
const Test = require('../models/Test');
const Result = require('../models/Result');

exports.getStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalTests,
      totalTrainings,
      totalResults,
      passedResults,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Course.countDocuments(),
      Test.countDocuments(),
      Training.countDocuments(),
      Result.countDocuments(),
      Result.countDocuments({ passed: true }),
    ]);

    const passRate = totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0;

    // Tests by difficulty
    const testsByDifficulty = await Test.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    // Students by level
    const studentsByLevel = await User.aggregate([
      { $match: { role: 'student', level: { $ne: '' } } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);

    // Recent results for chart (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentResults = await Result.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          students: totalStudents,
          teachers: totalTeachers,
          courses: totalCourses,
          tests: totalTests,
          trainings: totalTrainings,
          results: totalResults,
          passRate,
        },
        charts: {
          testsByDifficulty: testsByDifficulty.map((t) => ({ name: t._id || 'Unknown', value: t.count })),
          studentsByLevel: studentsByLevel.map((s) => ({ name: s._id || 'Unknown', value: s.count })),
          recentResults,
          passRateChart: [
            { name: 'Passed', value: passedResults },
            { name: 'Failed', value: totalResults - passedResults },
          ],
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Result.aggregate([
      {
        $group: {
          _id: '$student',
          totalTests: { $sum: 1 },
          totalScore: { $sum: '$percentage' },
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
          avgScore: { $avg: '$percentage' },
        },
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $project: {
          name: '$student.name',
          avatar: '$student.avatar',
          totalTests: 1,
          passed: 1,
          avgScore: { $round: ['$avgScore', 1] },
        },
      },
    ]);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
