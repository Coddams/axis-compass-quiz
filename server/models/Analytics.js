// server/models/Analytics.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuestionEventSchema = new Schema({
  questionId: String,
  selectedAnswer: Schema.Types.Mixed,
  timeSpent: Number,
  timestamp: { type: Date, default: Date.now },
});

const QuizResultSchema = new Schema({
  score: Number,
  resultData: Schema.Types.Mixed,
  completedAt: Date,
  feedbackGiven: {
    rating: Number,
    comment: String,
    timestamp: Date
  }
});

const UserAnalyticsSchema = new Schema({
  sessionId: { type: String, index: true },
  userId: String,
  userName: String,
  startTime: Date,
  endTime: Date,
  completed: { type: Boolean, default: false }, // CRITICAL: Ensure default value
  currentQuestionIndex: Number,
  totalQuestions: Number,
  timeSpent: Number,
  ipAddress: String,
  userAgent: String,
  referrer: String,
  deviceInfo: Schema.Types.Mixed,
  questionEvents: [QuestionEventSchema],
  quizResult: QuizResultSchema,
}, { timestamps: true });

module.exports = mongoose.model('UserAnalytics', UserAnalyticsSchema);
