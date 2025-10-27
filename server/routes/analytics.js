// server/routes/analytics.js
const express = require('express');
const router = express.Router();
const UserAnalytics = require('../models/Analytics');
const rateLimit = require('express-rate-limit');

const requireAdmin = require('../middleware/requireAdmin');


const adminApiKey = process.env.API_KEY_ADMIN || 'CHANGE_ME';

// basic rate limiter for all analytics endpoints
const limiter = rateLimit({ windowMs: 30 * 1000, max: 60 });
router.use(limiter);

// Upsert session
router.post('/session', async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    // Build clean update object
    const updateData = {
      sessionId: payload.sessionId,
      userId: payload.userId,
      userName: payload.userName,
      startTime: payload.startTime,
      currentQuestionIndex: payload.currentQuestionIndex || 0,
      totalQuestions: payload.totalQuestions || 0,
      timeSpent: payload.timeSpent || 0,
    };

    // CRITICAL: Explicitly handle completed
    if (typeof payload.completed === 'boolean') {
      updateData.completed = payload.completed;
    } else {
      updateData.completed = false; // Explicit default
    }

    // Add optional fields
    if (payload.endTime) updateData.endTime = payload.endTime;
    if (payload.deviceInfo) updateData.deviceInfo = payload.deviceInfo;
    if (payload.referrer) updateData.referrer = payload.referrer;

    // Server-sourced fields (override client)
    updateData.ipAddress = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    updateData.userAgent = req.get('User-Agent') || payload.userAgent || 'unknown';

    // Handle question events (append mode)
    if (payload.questionEvents && Array.isArray(payload.questionEvents)) {
      const existingDoc = await UserAnalytics.findOne({ sessionId: payload.sessionId });
      if (existingDoc && existingDoc.questionEvents) {
        updateData.questionEvents = [...existingDoc.questionEvents, ...payload.questionEvents];
      } else {
        updateData.questionEvents = payload.questionEvents;
      }
    }

    // Handle quiz result
    if (payload.quizResult) {
      updateData.quizResult = {
        score: payload.quizResult.score || 0,
        resultData: payload.quizResult,
        completedAt: payload.quizResult.completedAt || new Date()
      };
    }

    console.log('💾 Upserting session with completed:', updateData.completed);

    const doc = await UserAnalytics.findOneAndUpdate(
      { sessionId: payload.sessionId },
      { $set: updateData },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    console.log('💾 Saved document completed:', doc.completed);
    console.log('💾 Saved document ID:', doc._id);

    res.json(doc);
  } catch (err) {
    console.error('❌ POST /session error:', err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
});

// Update session partially
router.put('/session/:sessionId', async (req, res) => {
  try {
    const update = req.body || {};
    const updateData = {};

    if (typeof update.completed === 'boolean') {
      updateData.completed = update.completed;
      console.log('🔧 Setting completed to:', update.completed);
    }

    if (update.endTime) updateData.endTime = update.endTime;
    if (update.timeSpent !== undefined) updateData.timeSpent = update.timeSpent;

    // Handle quizResult properly - MERGE instead of replace
    if (update.quizResult) {
      // If only feedback is being sent, use $set with dot notation
      if (update.quizResult.feedbackGiven && Object.keys(update.quizResult).length === 1) {
        updateData['quizResult.feedbackGiven'] = update.quizResult.feedbackGiven;
      } else {
        // Full quiz result update
        updateData.quizResult = {
          score: update.quizResult.score || 0,
          resultData: update.quizResult,
          completedAt: update.quizResult.completedAt || new Date()
        };
      }
    }

    updateData.ipAddress = req.ip || update.ipAddress;
    updateData.userAgent = req.get('User-Agent') || update.userAgent;

    console.log('🔧 Full update data:', JSON.stringify(updateData, null, 2));

    const doc = await UserAnalytics.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log('✅ Updated document:', doc._id);
    res.json(doc);
  } catch (err) {
    console.error('❌ PUT /session/:sessionId error:', err);
    res.status(500).json({ error: 'server error' });
  }
});


// Get raw sessions for detailed analysis (admin only)
router.get('/sessions', requireAdmin, async (req, res) => {
  try {
    console.log('Fetching raw sessions for question analytics');

    const query = {};

    // Optional filters
    if (req.query.completed === 'true') {
      query.completed = true;
    }

    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      const sessions = await UserAnalytics.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      console.log(`Returning ${sessions.length} sessions`);
      return res.json(sessions);
    }

    // Default: return all sessions
    const sessions = await UserAnalytics.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Returning ${sessions.length} total sessions`);
    res.json(sessions);
  } catch (err) {
    console.error('GET /sessions error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Fetch all user sessions (admin)
router.get('/sessions', requireAdmin, async (req, res) => {
  try {
    const q = {};
    if (req.query.completed) q.completed = req.query.completed === 'true';
    const docs = await UserAnalytics.find(q).sort({ createdAt: -1 }).limit(1000);
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Fetch sessions with aggregated analytics data
router.get('/', requireAdmin, async (req, res) => {
  try {
    const q = {};
    if (req.query.completed) q.completed = req.query.completed === 'true';
    const docs = await UserAnalytics.find(q).sort({ createdAt: -1 }).limit(1000);

    // Calculate aggregated analytics
    const totalUsers = docs.length;
    const completedSessions = docs.filter(s => s.completed === true);
    const totalCompletedQuizzes = completedSessions.length;
    const totalIncompletedQuizzes = totalUsers - totalCompletedQuizzes;

    // Calculate average completion time from completed sessions
    const completionTimes = completedSessions
      .map(s => s.timeSpent || 0)
      .filter(time => time > 0);
    const averageCompletionTime = completionTimes.length > 0
      ? Math.floor(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;

    // Device stats
    const deviceStats = docs.reduce((acc, s) => {
      if (s.deviceInfo?.isMobile) {
        acc.mobile = (acc.mobile || 0) + 1;
      } else {
        acc.desktop = (acc.desktop || 0) + 1;
      }
      return acc;
    }, { mobile: 0, desktop: 0 });

    // Browser stats
    const browserStats = docs.reduce((acc, s) => {
      const browser = s.deviceInfo?.browser || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    // Referrer stats
    const referrerStats = docs.reduce((acc, s) => {
      const source = s.referrer ?
        (s.referrer.includes('google') ? 'Google' :
          s.referrer.includes('facebook') || s.referrer.includes('twitter') ? 'Social Media' : 'Other')
        : 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Ideology distribution (calculate from quiz results)
    const ideologyDistribution = [];
    const figurePopularity = [];

    // Declare these OUTSIDE the if block
    let figurePopularityByMatches = [];
    let figurePopularityBySimilarity = [];

    // Calculate from completed quizzes with results
    const completedWithResults = completedSessions.filter(s => s.quizResult?.resultData?.matchedIdeology);

    if (completedWithResults.length > 0) {
      // Group by ideology
      const ideologyGroups = completedWithResults.reduce((acc, session) => {
        const ideology = session.quizResult.resultData.matchedIdeology;
        if (!acc[ideology.id]) {
          acc[ideology.id] = {
            ideologyId: ideology.id,
            ideologyName: ideology.name,
            count: 0,
            vectors: []
          };
        }
        acc[ideology.id].count++;
        if (session.quizResult.resultData.finalVector) {
          acc[ideology.id].vectors.push(session.quizResult.resultData.finalVector);
        }
        return acc;
      }, {});

      // Convert to array with percentages and average vectors
      Object.values(ideologyGroups).forEach(group => {
        const avgVector = group.vectors.length > 0 ? {
          economic: group.vectors.reduce((sum, v) => sum + v.economic, 0) / group.vectors.length,
          social: group.vectors.reduce((sum, v) => sum + v.social, 0) / group.vectors.length,
          foreign: group.vectors.reduce((sum, v) => sum + v.foreign, 0) / group.vectors.length
        } : { economic: 0, social: 0, foreign: 0 };

        ideologyDistribution.push({
          ...group,
          percentage: (group.count / totalCompletedQuizzes) * 100,
          averageVector: avgVector
        });
      });

      // Calculate figure popularity
      const figureGroups = {};
      completedWithResults.forEach(session => {
        const figures = session.quizResult.resultData.topFigureMatches || [];
        figures.forEach((figure, index) => {
          if (!figureGroups[figure.id]) {
            figureGroups[figure.id] = {
              figureId: figure.id,
              figureName: figure.name,
              matchCount: 0,
              topMatchCount: 0,
              positionCounts: { first: 0, second: 0, third: 0 },
              similarities: []
            };
          }
          figureGroups[figure.id].matchCount++;

          // Track position
          if (index === 0) {
            figureGroups[figure.id].topMatchCount++;
            figureGroups[figure.id].positionCounts.first++;
          } else if (index === 1) {
            figureGroups[figure.id].positionCounts.second++;
          } else if (index === 2) {
            figureGroups[figure.id].positionCounts.third++;
          }

          figureGroups[figure.id].similarities.push(figure.similarity || 0);
        });
      });

      // Calculate averages and create figure popularity lists
      Object.values(figureGroups).forEach(group => {
        const avgSimilarity = group.similarities.length > 0
          ? group.similarities.reduce((a, b) => a + b, 0) / group.similarities.length
          : 0;

        const figureData = {
          figureId: group.figureId,
          figureName: group.figureName,
          matchCount: group.matchCount,
          topMatchCount: group.topMatchCount,
          positionCounts: group.positionCounts,
          averageSimilarity: avgSimilarity,
          matchPercentage: (group.matchCount / (completedWithResults.length * 3)) * 100
        };

        figurePopularityByMatches.push({ ...figureData });
        figurePopularityBySimilarity.push({ ...figureData });
        figurePopularity.push(figureData); // For backward compatibility
      });

      // Sort by match count (most frequent)
      figurePopularityByMatches.sort((a, b) => b.matchCount - a.matchCount);

      // Sort by average similarity (highest scores)
      figurePopularityBySimilarity.sort((a, b) => b.averageSimilarity - a.averageSimilarity);

      console.log('📊 Figure popularity calculated:', {
        totalFigures: Object.keys(figureGroups).length,
        topByMatches: figurePopularityByMatches[0]?.figureName,
        topBySimilarity: figurePopularityBySimilarity[0]?.figureName
      });
    }

    // Calculate feedback stats
    const feedbackSessions = completedSessions.filter(s => {
      const hasFeedback = s.quizResult?.feedbackGiven?.rating > 0;
      if (hasFeedback) {
        console.log(`Session ${s.sessionId}: has feedback rating ${s.quizResult.feedbackGiven.rating}`);
      }
      return hasFeedback;
    });

    const averageFeedbackRating = feedbackSessions.length > 0
      ? feedbackSessions.reduce((acc, s) => acc + s.quizResult.feedbackGiven.rating, 0) / feedbackSessions.length
      : 0;

    const feedbackCount = feedbackSessions.length;

    console.log(`📊 Feedback stats: ${feedbackCount} responses, avg rating: ${averageFeedbackRating.toFixed(2)}`);

    const analytics = {
      totalUsers,
      totalCompletedQuizzes,
      totalIncompletedQuizzes,
      averageCompletionTime,
      averageCompletionRate: totalUsers > 0 ? totalCompletedQuizzes / totalUsers : 0,
      dailyActiveUsers: totalUsers,
      weeklyActiveUsers: totalUsers,
      monthlyActiveUsers: totalUsers,
      questionStatistics: [],
      ideologyDistribution,
      figurePopularity, // Backward compatible (sorted by matches)
      figurePopularityByMatches, // Most matched figures
      figurePopularityBySimilarity, // Highest similarity scores
      deviceStats,
      browserStats,
      referrerStats,
      peakUsageHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: Math.floor(Math.random() * 10) + 1 })),
      userRetentionRate: 0.5,
      averageFeedbackRating,
      feedbackCount
    };
    
    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});


// Export CSV (admin)
router.post('/export', requireAdmin, async (req, res) => {
  try {
    const docs = await UserAnalytics.find({}).lean();
    const fields = ['sessionId', 'id', 'userName', 'startTime', 'endTime', 'completed', 'timeSpent'];
    const { Parser } = require('json2csv');
    const parser = new Parser({ fields });
    const csv = parser.parse(docs);
    res.header('Content-Type', 'text/csv');
    res.attachment('analytics-export.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
