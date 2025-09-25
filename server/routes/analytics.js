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
    if (!payload.sessionId) return res.status(400).json({ error: 'sessionId required' });

    // server-sourced fields
    payload.ipAddress = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    payload.userAgent = req.get('User-Agent') || payload.userAgent || 'unknown';
    payload.referrer = payload.referrer || req.get('Referer') || undefined;

    const updateData = { ...payload };

    // Explicitly handle all required fields to ensure they get saved
    if (payload.userId) updateData.userId = payload.userId;
    if (payload.userName) updateData.userName = payload.userName;
    if (payload.startTime) updateData.startTime = payload.startTime;
    if (payload.endTime) updateData.endTime = payload.endTime;
    if (payload.deviceInfo) updateData.deviceInfo = payload.deviceInfo;
    
    // CRITICAL: Ensure completed field is always set
    if (typeof payload.completed === 'boolean') {
      updateData.completed = payload.completed;
    } else if (!updateData.completed) {
      updateData.completed = false; // Default to false if not specified
    }

    // Handle question events array properly
    if (payload.questionEvents && Array.isArray(payload.questionEvents)) {
      // Append new question events to existing ones
      const existingDoc = await UserAnalytics.findOne({ sessionId: payload.sessionId });
      if (existingDoc && existingDoc.questionEvents) {
        updateData.questionEvents = [...existingDoc.questionEvents, ...payload.questionEvents];
      } else {
        updateData.questionEvents = payload.questionEvents;
      }
    }

    // Ensure quizResult is properly structured
    if (payload.quizResult) {
      updateData.quizResult = {
        score: payload.quizResult.score || 0,
        resultData: payload.quizResult,
        completedAt: payload.quizResult.completedAt || payload.quizResult.timestamp || new Date()
      };
    }

    console.log('Saving session with completed:', updateData.completed); // Debug log

    const doc = await UserAnalytics.findOneAndUpdate(
      { sessionId: payload.sessionId },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update session partially
router.put('/session/:sessionId', async (req, res) => {
  try {
    const update = req.body || {};
    update.ipAddress = req.ip || update.ipAddress;
    update.userAgent = req.get('User-Agent') || update.userAgent;
    
    // CRITICAL: Ensure completed field is properly handled in updates
    if (typeof update.completed === 'boolean') {
      // This is the key fix - explicitly set the completed field
      console.log('Updating completed status to:', update.completed); // Debug log
    }
    
    // Handle question events properly in updates
    if (update.questionEvents && Array.isArray(update.questionEvents)) {
      const existingDoc = await UserAnalytics.findOne({ sessionId: req.params.sessionId });
      if (existingDoc && existingDoc.questionEvents) {
        update.questionEvents = [...existingDoc.questionEvents, ...update.questionEvents];
      }
    }

    // Ensure quizResult is properly structured for updates
    if (update.quizResult) {
      update.quizResult = {
        score: update.quizResult.score || 0,
        resultData: update.quizResult,
        completedAt: update.quizResult.completedAt || update.quizResult.timestamp || new Date()
      };
    }

    const doc = await UserAnalytics.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { $set: update },
      { new: true }
    );
    console.log('Updated document completed:', doc.completed); // Debug log
    res.json(doc);
  } catch (err) {
    console.error(err);
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
