import { useState, useEffect, useCallback } from 'react';
import { 
  UserAnalytics, 
  QuestionAnalytics, 
  QuizResultAnalytics,
  AdminAnalytics,
  AnalyticsFilters
} from '@/types/analytics';
import { CanonQuestion } from '@/data/quizData';

// This hook manages analytics tracking - replace with your MongoDB connection
export const useAnalytics = () => {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentSession, setCurrentSession] = useState<UserAnalytics | null>(null);

  // Initialize user session tracking
  const initializeSession = useCallback((userName: string) => {
    const deviceInfo = {
      isMobile: window.innerWidth < 768,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
      os: navigator.platform
    };

    const session: UserAnalytics = {
      id: userId,
      sessionId,
      userName,
      startTime: new Date(),
      completed: false,
      currentQuestionIndex: 0,
      totalQuestions: 0,
      timeSpent: 0,
      ipAddress: undefined, // Will be set by backend
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      deviceInfo
    };

    setCurrentSession(session);
    
    // TODO: Send to MongoDB via your API
    console.log('📊 Session initialized:', session);
    
    return session;
  }, [userId, sessionId]);

  // Track question interaction
  const trackQuestionAnswer = useCallback((
    question: CanonQuestion,
    questionIndex: number,
    selectedAnswer: any,
    timeSpentOnQuestion: number,
    hesitationTime?: number,
    changedAnswer?: boolean
  ) => {
    const questionAnalytics: QuestionAnalytics = {
      questionId: question.id,
      userId,
      sessionId,
      questionText: question.text,
      selectedAnswerId: selectedAnswer.id,
      selectedAnswerText: selectedAnswer.text,
      selectedVector: selectedAnswer.vector,
      timeSpentOnQuestion,
      timestamp: new Date(),
      hesitationTime,
      changedAnswer
    };

    // Update current session
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        currentQuestionIndex: questionIndex + 1,
        timeSpent: currentSession.timeSpent + timeSpentOnQuestion
      });
    }

    // TODO: Send to MongoDB via your API
    console.log('📊 Question answered:', questionAnalytics);
    
    return questionAnalytics;
  }, [userId, sessionId, currentSession]);

  // Track quiz completion
  const trackQuizCompletion = useCallback((
    finalResult: any,
    totalCompletionTime: number,
    shareAttempted: boolean = false
  ) => {
    const resultAnalytics: QuizResultAnalytics = {
      userId,
      sessionId,
      finalVector: finalResult.vector,
      matchedIdeology: {
        id: finalResult.ideology?.id || '',
        name: finalResult.ideology?.name || '',
        description: finalResult.ideology?.description || '',
        confidence: finalResult.confidence || 0.8
      },
      topFigureMatches: finalResult.topFigures || [],
      completionTime: totalCompletionTime,
      timestamp: new Date(),
      shareAttempted
    };

    // Update session as completed
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        completed: true,
        endTime: new Date(),
        timeSpent: totalCompletionTime
      });
    }

    // TODO: Send to MongoDB via your API
    console.log('📊 Quiz completed:', resultAnalytics);
    
    return resultAnalytics;
  }, [userId, sessionId, currentSession]);

  // Track user feedback
  const trackFeedback = useCallback((rating: number, comment?: string) => {
    const feedback = {
      rating,
      comment,
      timestamp: new Date()
    };

    // TODO: Send to MongoDB via your API
    console.log('📊 Feedback submitted:', feedback);
    
    return feedback;
  }, []);

  // Track page views and navigation
  const trackPageView = useCallback((page: string) => {
    const pageView = {
      userId,
      sessionId,
      page,
      timestamp: new Date(),
      url: window.location.href
    };

    // TODO: Send to MongoDB via your API
    console.log('📊 Page view:', pageView);
    
    return pageView;
  }, [userId, sessionId]);

  return {
    sessionId,
    userId,
    currentSession,
    initializeSession,
    trackQuestionAnswer,
    trackQuizCompletion,
    trackFeedback,
    trackPageView
  };
};

// Hook for admin analytics data
export const useAdminAnalytics = (filters?: AnalyticsFilters) => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with your MongoDB API call
      // const response = await fetch('/api/admin/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters)
      // });
      // const data = await response.json();
      
      // Mock data for now - replace with actual MongoDB data
      const mockData: AdminAnalytics = {
        totalUsers: 1247,
        totalCompletedQuizzes: 1043,
        totalIncompletedQuizzes: 204,
        averageCompletionTime: 342, // seconds
        averageCompletionRate: 0.836,
        dailyActiveUsers: 89,
        weeklyActiveUsers: 312,
        monthlyActiveUsers: 1247,
        questionStatistics: [],
        ideologyDistribution: [
          { ideologyId: '1', ideologyName: 'Liberal', count: 234, percentage: 22.4, averageVector: { economic: -1.2, social: 1.1, foreign: 0.3 } },
          { ideologyId: '2', ideologyName: 'Conservative', count: 198, percentage: 19.0, averageVector: { economic: 1.1, social: -0.8, foreign: 0.8 } },
          { ideologyId: '3', ideologyName: 'Libertarian', count: 156, percentage: 15.0, averageVector: { economic: 1.3, social: 1.2, foreign: -0.5 } }
        ],
        figurePopularity: [
          { figureId: '1', figureName: 'Abraham Lincoln', matchCount: 89, averageSimilarity: 0.78, topMatchCount: 23 },
          { figureId: '2', figureName: 'Thomas Jefferson', matchCount: 76, averageSimilarity: 0.72, topMatchCount: 19 }
        ],
        deviceStats: { mobile: 723, desktop: 524 },
        browserStats: { 'Chrome': 678, 'Firefox': 234, 'Safari': 189, 'Other': 146 },
        referrerStats: { 'Direct': 456, 'Google': 321, 'Social Media': 287, 'Other': 183 },
        peakUsageHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: Math.floor(Math.random() * 100) + 10 })),
        userRetentionRate: 0.23,
        averageFeedbackRating: 4.2,
        feedbackCount: 234
      };
      
      setAnalytics(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportData = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      // TODO: Replace with your MongoDB API call
      // const response = await fetch('/api/admin/export', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ format, filters })
      // });
      
      console.log(`📊 Exporting data in ${format} format with filters:`, filters);
      
      // Mock export - replace with actual implementation
      const mockExportData = {
        users: [],
        questions: [],
        results: [],
        timestamp: new Date(),
        totalRecords: analytics?.totalUsers || 0
      };
      
      const dataStr = format === 'json' 
        ? JSON.stringify(mockExportData, null, 2)
        : 'CSV export not implemented'; // TODO: Add CSV conversion
      
      const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Export failed:', err);
      throw err;
    }
  }, [analytics, filters]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    exportData
  };
};