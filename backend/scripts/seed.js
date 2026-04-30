require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Training = require('../models/Training');
const Course = require('../models/Course');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Notification = require('../models/Notification');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Training.deleteMany({}),
      Course.deleteMany({}),
      Test.deleteMany({}),
      Question.deleteMany({}),
      Result.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('123456', 12);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@test.com', password: hashedPassword, role: 'admin', level: 'Expert', school: 'Studies Academy' },
      { name: 'Sarah Johnson', email: 'teacher@test.com', password: hashedPassword, role: 'teacher', level: 'Expert', school: 'Studies Academy', bio: 'Experienced educator with 10+ years in online learning.' },
      { name: 'Michael Chen', email: 'teacher2@test.com', password: hashedPassword, role: 'teacher', level: 'Advanced', school: 'Tech Institute' },
      { name: 'Alice Smith', email: 'student@test.com', password: hashedPassword, role: 'student', level: 'Intermediate', school: 'Studies Academy' },
      { name: 'Bob Williams', email: 'student2@test.com', password: hashedPassword, role: 'student', level: 'Beginner', school: 'City College' },
      { name: 'Emma Davis', email: 'student3@test.com', password: hashedPassword, role: 'student', level: 'Advanced', school: 'Studies Academy' },
      { name: 'James Wilson', email: 'student4@test.com', password: hashedPassword, role: 'student', level: 'Intermediate', school: 'Tech Institute' },
      { name: 'Olivia Brown', email: 'student5@test.com', password: hashedPassword, role: 'student', level: 'Beginner', school: 'City College' },
    ]);

    const [admin, teacher1, teacher2, student1, student2, student3, student4, student5] = users;
    console.log('Created users');

    // Create trainings
    const trainings = await Training.insertMany([
      {
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
        category: 'Technology',
        level: 'Beginner',
        duration: 120,
        createdBy: teacher1._id,
        isPublished: true,
        tags: ['HTML', 'CSS', 'JavaScript'],
        enrolledCount: 45,
        steps: [
          { title: 'HTML Basics', description: 'Learn HTML structure and tags', content: 'HTML is the backbone of web pages...', order: 1, duration: 30 },
          { title: 'CSS Styling', description: 'Style your pages with CSS', content: 'CSS controls the visual presentation...', order: 2, duration: 40 },
          { title: 'JavaScript Fundamentals', description: 'Add interactivity with JS', content: 'JavaScript makes pages dynamic...', order: 3, duration: 50 },
        ],
        ratings: [
          { user: student1._id, rating: 5, comment: 'Excellent course!' },
          { user: student2._id, rating: 4, comment: 'Very helpful' },
        ],
      },
      {
        title: 'Data Science with Python',
        description: 'Master data analysis, visualization, and machine learning with Python.',
        category: 'Data Science',
        level: 'Intermediate',
        duration: 180,
        createdBy: teacher2._id,
        isPublished: true,
        tags: ['Python', 'Pandas', 'NumPy', 'ML'],
        enrolledCount: 32,
        steps: [
          { title: 'Python Basics', description: 'Python fundamentals for data science', content: 'Python is the most popular language for data science...', order: 1, duration: 45 },
          { title: 'Data Analysis with Pandas', description: 'Analyze data using Pandas', content: 'Pandas provides powerful data structures...', order: 2, duration: 60 },
          { title: 'Data Visualization', description: 'Create charts and graphs', content: 'Matplotlib and Seaborn for visualization...', order: 3, duration: 45 },
          { title: 'Machine Learning Intro', description: 'Introduction to ML concepts', content: 'Scikit-learn makes ML accessible...', order: 4, duration: 30 },
        ],
        ratings: [
          { user: student3._id, rating: 5, comment: 'Amazing content!' },
          { user: student4._id, rating: 4, comment: 'Well structured' },
        ],
      },
      {
        title: 'Digital Marketing Mastery',
        description: 'Learn SEO, social media marketing, and content strategy.',
        category: 'Marketing',
        level: 'Beginner',
        duration: 90,
        createdBy: teacher1._id,
        isPublished: true,
        tags: ['SEO', 'Social Media', 'Content'],
        enrolledCount: 28,
        steps: [
          { title: 'SEO Fundamentals', description: 'Search engine optimization basics', content: 'SEO helps your content rank higher...', order: 1, duration: 30 },
          { title: 'Social Media Strategy', description: 'Build your social presence', content: 'Social media is key to modern marketing...', order: 2, duration: 30 },
          { title: 'Content Marketing', description: 'Create compelling content', content: 'Content is king in digital marketing...', order: 3, duration: 30 },
        ],
        ratings: [{ user: student5._id, rating: 4, comment: 'Practical and useful' }],
      },
      {
        title: 'Leadership & Management',
        description: 'Develop essential leadership skills for the modern workplace.',
        category: 'Business',
        level: 'Advanced',
        duration: 150,
        createdBy: admin._id,
        isPublished: true,
        tags: ['Leadership', 'Management', 'Communication'],
        enrolledCount: 19,
        steps: [
          { title: 'Leadership Styles', description: 'Different approaches to leadership', content: 'Understanding your leadership style...', order: 1, duration: 50 },
          { title: 'Team Management', description: 'Managing teams effectively', content: 'Building high-performing teams...', order: 2, duration: 50 },
          { title: 'Communication Skills', description: 'Effective communication strategies', content: 'Clear communication drives success...', order: 3, duration: 50 },
        ],
        ratings: [],
      },
    ]);
    console.log('Created trainings');

    // Create courses
    const courses = await Course.insertMany([
      {
        title: 'Full Stack Web Development',
        description: 'Complete course covering frontend and backend development.',
        subject: 'Computer Science',
        level: 'Intermediate',
        teacher: teacher1._id,
        students: [student1._id, student2._id, student3._id],
        isPublished: true,
        duration: 240,
        tags: ['React', 'Node.js', 'MongoDB'],
      },
      {
        title: 'Advanced Mathematics',
        description: 'Calculus, linear algebra, and statistics for engineers.',
        subject: 'Mathematics',
        level: 'Advanced',
        teacher: teacher2._id,
        students: [student1._id, student4._id],
        isPublished: true,
        duration: 180,
        tags: ['Calculus', 'Algebra', 'Statistics'],
      },
      {
        title: 'English Communication',
        description: 'Improve your written and spoken English skills.',
        subject: 'Language',
        level: 'Beginner',
        teacher: teacher1._id,
        students: [student2._id, student5._id],
        isPublished: true,
        duration: 120,
        tags: ['Grammar', 'Writing', 'Speaking'],
      },
      {
        title: 'Introduction to Physics',
        description: 'Fundamental concepts of classical and modern physics.',
        subject: 'Science',
        level: 'Intermediate',
        teacher: teacher2._id,
        students: [student3._id, student4._id, student5._id],
        isPublished: true,
        duration: 160,
        tags: ['Mechanics', 'Thermodynamics', 'Optics'],
      },
    ]);
    console.log('Created courses');

    // Create tests
    const tests = await Test.insertMany([
      {
        title: 'Web Development Basics Quiz',
        description: 'Test your knowledge of HTML, CSS, and JavaScript fundamentals.',
        course: courses[0]._id,
        createdBy: teacher1._id,
        difficulty: 'Easy',
        duration: 20,
        passingScore: 60,
        isPublished: true,
        maxAttempts: 3,
        totalPoints: 5,
      },
      {
        title: 'Mathematics Mid-Term',
        description: 'Comprehensive test covering calculus and linear algebra.',
        course: courses[1]._id,
        createdBy: teacher2._id,
        difficulty: 'Hard',
        duration: 60,
        passingScore: 70,
        isPublished: true,
        maxAttempts: 2,
        totalPoints: 5,
      },
      {
        title: 'English Grammar Test',
        description: 'Test your understanding of English grammar rules.',
        course: courses[2]._id,
        createdBy: teacher1._id,
        difficulty: 'Medium',
        duration: 30,
        passingScore: 65,
        isPublished: true,
        maxAttempts: 3,
        totalPoints: 5,
      },
      {
        title: 'Physics Fundamentals',
        description: 'Basic physics concepts and problem solving.',
        course: courses[3]._id,
        createdBy: teacher2._id,
        difficulty: 'Medium',
        duration: 45,
        passingScore: 60,
        isPublished: true,
        maxAttempts: 3,
        totalPoints: 5,
      },
    ]);
    console.log('Created tests');

    // Create questions
    const questions = await Question.insertMany([
      // Web Dev test questions
      {
        text: 'What does HTML stand for?',
        type: 'multiple-choice',
        options: [
          { text: 'HyperText Markup Language', isCorrect: true },
          { text: 'High Tech Modern Language', isCorrect: false },
          { text: 'HyperText Modern Links', isCorrect: false },
          { text: 'Home Tool Markup Language', isCorrect: false },
        ],
        points: 1,
        difficulty: 'Easy',
        test: tests[0]._id,
        createdBy: teacher1._id,
      },
      {
        text: 'Which CSS property is used to change text color?',
        type: 'multiple-choice',
        options: [
          { text: 'color', isCorrect: true },
          { text: 'text-color', isCorrect: false },
          { text: 'font-color', isCorrect: false },
          { text: 'text-style', isCorrect: false },
        ],
        points: 1,
        difficulty: 'Easy',
        test: tests[0]._id,
        createdBy: teacher1._id,
      },
      {
        text: 'JavaScript is a compiled language.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true },
        ],
        points: 1,
        difficulty: 'Easy',
        test: tests[0]._id,
        createdBy: teacher1._id,
      },
      // Math test questions
      {
        text: 'What is the derivative of x²?',
        type: 'multiple-choice',
        options: [
          { text: '2x', isCorrect: true },
          { text: 'x', isCorrect: false },
          { text: '2', isCorrect: false },
          { text: 'x²', isCorrect: false },
        ],
        points: 1,
        difficulty: 'Medium',
        test: tests[1]._id,
        createdBy: teacher2._id,
      },
      {
        text: 'The determinant of an identity matrix is 1.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        points: 1,
        difficulty: 'Medium',
        test: tests[1]._id,
        createdBy: teacher2._id,
      },
      // English test questions
      {
        text: 'Which sentence is grammatically correct?',
        type: 'multiple-choice',
        options: [
          { text: 'She goes to school every day.', isCorrect: true },
          { text: 'She go to school every day.', isCorrect: false },
          { text: 'She going to school every day.', isCorrect: false },
          { text: 'She goed to school every day.', isCorrect: false },
        ],
        points: 1,
        difficulty: 'Easy',
        test: tests[2]._id,
        createdBy: teacher1._id,
      },
      // Physics test questions
      {
        text: 'What is the SI unit of force?',
        type: 'multiple-choice',
        options: [
          { text: 'Newton', isCorrect: true },
          { text: 'Joule', isCorrect: false },
          { text: 'Watt', isCorrect: false },
          { text: 'Pascal', isCorrect: false },
        ],
        points: 1,
        difficulty: 'Easy',
        test: tests[3]._id,
        createdBy: teacher2._id,
      },
    ]);

    // Update tests with question IDs
    await Test.findByIdAndUpdate(tests[0]._id, { questions: [questions[0]._id, questions[1]._id, questions[2]._id] });
    await Test.findByIdAndUpdate(tests[1]._id, { questions: [questions[3]._id, questions[4]._id] });
    await Test.findByIdAndUpdate(tests[2]._id, { questions: [questions[5]._id] });
    await Test.findByIdAndUpdate(tests[3]._id, { questions: [questions[6]._id] });

    // Update courses with test IDs
    await Course.findByIdAndUpdate(courses[0]._id, { tests: [tests[0]._id] });
    await Course.findByIdAndUpdate(courses[1]._id, { tests: [tests[1]._id] });
    await Course.findByIdAndUpdate(courses[2]._id, { tests: [tests[2]._id] });
    await Course.findByIdAndUpdate(courses[3]._id, { tests: [tests[3]._id] });
    console.log('Created questions');

    // Create sample results
    await Result.insertMany([
      {
        student: student1._id,
        test: tests[0]._id,
        course: courses[0]._id,
        score: 3,
        totalPoints: 3,
        percentage: 100,
        passed: true,
        timeTaken: 600,
        attemptNumber: 1,
        answers: [
          { question: questions[0]._id, selectedOption: 'HyperText Markup Language', isCorrect: true, pointsEarned: 1 },
          { question: questions[1]._id, selectedOption: 'color', isCorrect: true, pointsEarned: 1 },
          { question: questions[2]._id, selectedOption: 'False', isCorrect: true, pointsEarned: 1 },
        ],
      },
      {
        student: student2._id,
        test: tests[0]._id,
        course: courses[0]._id,
        score: 2,
        totalPoints: 3,
        percentage: 67,
        passed: true,
        timeTaken: 900,
        attemptNumber: 1,
        answers: [
          { question: questions[0]._id, selectedOption: 'HyperText Markup Language', isCorrect: true, pointsEarned: 1 },
          { question: questions[1]._id, selectedOption: 'text-color', isCorrect: false, pointsEarned: 0 },
          { question: questions[2]._id, selectedOption: 'False', isCorrect: true, pointsEarned: 1 },
        ],
      },
      {
        student: student3._id,
        test: tests[1]._id,
        course: courses[1]._id,
        score: 1,
        totalPoints: 2,
        percentage: 50,
        passed: false,
        timeTaken: 1800,
        attemptNumber: 1,
        answers: [
          { question: questions[3]._id, selectedOption: '2x', isCorrect: true, pointsEarned: 1 },
          { question: questions[4]._id, selectedOption: 'False', isCorrect: false, pointsEarned: 0 },
        ],
      },
      {
        student: student4._id,
        test: tests[2]._id,
        course: courses[2]._id,
        score: 1,
        totalPoints: 1,
        percentage: 100,
        passed: true,
        timeTaken: 300,
        attemptNumber: 1,
        answers: [
          { question: questions[5]._id, selectedOption: 'She goes to school every day.', isCorrect: true, pointsEarned: 1 },
        ],
      },
      {
        student: student5._id,
        test: tests[3]._id,
        course: courses[3]._id,
        score: 0,
        totalPoints: 1,
        percentage: 0,
        passed: false,
        timeTaken: 450,
        attemptNumber: 1,
        answers: [
          { question: questions[6]._id, selectedOption: 'Joule', isCorrect: false, pointsEarned: 0 },
        ],
      },
    ]);
    console.log('Created results');

    // Create notifications
    await Notification.insertMany([
      { recipient: student1._id, title: 'Welcome to Studies!', message: 'Your account has been created successfully.', type: 'success', category: 'system', isRead: false },
      { recipient: student1._id, title: 'New Training Available', message: 'Introduction to Web Development is now available.', type: 'info', category: 'training', isRead: false },
      { recipient: student2._id, title: 'Test Completed', message: 'You scored 67% on Web Development Basics Quiz.', type: 'info', category: 'result', isRead: true },
      { recipient: student3._id, title: 'Test Failed', message: 'You scored 50% on Mathematics Mid-Term. Keep practicing!', type: 'warning', category: 'result', isRead: false },
      { recipient: admin._id, title: 'New Student Registered', message: 'Olivia Brown has joined the platform.', type: 'info', category: 'system', isRead: false },
    ]);
    console.log('Created notifications');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('  Admin:   admin@test.com / 123456');
    console.log('  Teacher: teacher@test.com / 123456');
    console.log('  Student: student@test.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
