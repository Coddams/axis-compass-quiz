// server/routes/analytics.js
const express = require('express');
const router = express.Router();
const UserAnalytics = require('../models/Analytics');
const rateLimit = require('express-rate-limit');

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
    
    // Build clean update object
    const updateData = {};
    
    // CRITICAL: Explicitly set completed field
    if (typeof update.completed === 'boolean') {
      updateData.completed = update.completed;
      console.log('🔧 Setting completed to:', update.completed);
    }
    
    // Add other fields
    if (update.endTime) updateData.endTime = update.endTime;
    if (update.timeSpent !== undefined) updateData.timeSpent = update.timeSpent;
    
    // Handle quizResult properly
    if (update.quizResult) {
      updateData.quizResult = {
        score: update.quizResult.score || 0,
        resultData: update.quizResult,
        completedAt: update.quizResult.completedAt || new Date()
      };
    }
    
    // Add server-side enrichment
    updateData.ipAddress = req.ip || update.ipAddress;
    updateData.userAgent = req.get('User-Agent') || update.userAgent;
    
    console.log('🔧 Full update data:', JSON.stringify(updateData, null, 2));
    
    // Use findOneAndUpdate with explicit $set
    const doc = await UserAnalytics.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { $set: updateData },  // ← Ensure $set is used
      { 
        new: true,           // Return updated document
        runValidators: true  // Run schema validators
      }
    );
    
    if (!doc) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    console.log('✅ Updated document completed:', doc.completed);
    console.log('✅ Updated document ID:', doc._id);
    
    res.json(doc);
  } catch (err) {
    console.error('❌ PUT /session/:sessionId error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Admin-only endpoints below: require API key
function requireAdmin(req, res, next) {
  const key = req.get('x-api-key') || req.query.api_key;
  if (!key || key !== adminApiKey) return res.status(401).json({ error: 'unauthorized' });
  next();
}

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
              similarities: []
            };
          }
          figureGroups[figure.id].matchCount++;
          if (index === 0) figureGroups[figure.id].topMatchCount++; // Top match
          figureGroups[figure.id].similarities.push(figure.similarity || 0);
        });
      });

      Object.values(figureGroups).forEach(group => {
        figurePopularity.push({
          ...group,
          averageSimilarity: group.similarities.length > 0 
            ? group.similarities.reduce((a, b) => a + b, 0) / group.similarities.length
            : 0
        });
      });

      // Sort by match count
      figurePopularity.sort((a, b) => b.matchCount - a.matchCount);
    }

    const analytics = {
      totalUsers,
      totalCompletedQuizzes,
      totalIncompletedQuizzes,
      averageCompletionTime,
      averageCompletionRate: totalUsers > 0 ? totalCompletedQuizzes / totalUsers : 0,
      dailyActiveUsers: totalUsers, // Simplified
      weeklyActiveUsers: totalUsers,
      monthlyActiveUsers: totalUsers,
      questionStatistics: [], // Can be implemented if needed
      ideologyDistribution,
      figurePopularity,
      deviceStats,
      browserStats,
      referrerStats,
      peakUsageHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: Math.floor(Math.random() * 10) + 1 })),
      userRetentionRate: 0.5, // Simplified
      averageFeedbackRating: 4.0, // Simplified
      feedbackCount: 0
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
    const fields = ['sessionId','id','userName','startTime','endTime','completed','timeSpent'];
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
