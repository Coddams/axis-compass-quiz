// src/hooks/useAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  UserAnalytics, 
  QuestionAnalytics, 
  QuizResultAnalytics,
  AdminAnalytics,
  AnalyticsFilters
} from '@/types/analytics';
import { CanonQuestion } from '@/data/quizData';

/**
 * Base API path. In dev the Vite proxy will forward '/api' to your backend.
 * In production set VITE_API_BASE to 'https://your-server.example.com/api/analytics'
 */
const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api/analytics';

/**
 * Admin key used to call admin-only endpoints.
 * WARNING: Do NOT set this in a public production build. This is intended for local/dev convenience.
 * Prefer calling admin endpoints from a protected server-side app or using proper auth (JWT/OAuth).
 */
const ADMIN_KEY = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)
  || (import.meta.env.VITE_API_KEY_ADMIN as string | undefined)
  || null;

/** Build headers helper. includeAdmin=true adds Authorization/x-api-key headers (only when ADMIN_KEY set) */
function buildHeaders(includeAdmin = false, isJson = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (includeAdmin && ADMIN_KEY) {
    // include both common header styles; server accepts x-api-key or Authorization Bearer
    headers['x-api-key'] = ADMIN_KEY;
    headers['Authorization'] = `Bearer ${ADMIN_KEY}`;
  }
  return headers;
}

/**
 * Helper: POST (upsert) a full session to backend
 */
async function apiPostSession(session: Partial<UserAnalytics>) {
  try {
    const res = await fetch(`${API_BASE}/session`, {
      method: 'POST',
      headers: buildHeaders(false, true),
      body: JSON.stringify(session),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to save session: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error('apiPostSession error', err);
    throw err;
  }
}

/**
 * Helper: update session by sessionId (PUT)
 */
async function apiUpdateSession(sessionId: string, partial: Partial<UserAnalytics>) {
  try {
    const res = await fetch(`${API_BASE}/session/${encodeURIComponent(sessionId)}`, {
      method: 'PUT',
      headers: buildHeaders(false, true),
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update session: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error('apiUpdateSession error', err);
    throw err;
  }
}

/**
 * Helper: fetch analytics list for admin
 * If server returns 401/403, this returns null (so callers can fallback).
 */
async function apiFetchAnalytics(filters?: AnalyticsFilters): Promise<any[] | AdminAnalytics | null> {
  try {
    const qs = filters ? '?' + new URLSearchParams(filters as any).toString() : '';
    const res = await fetch(`${API_BASE}${qs}`, {
      method: 'GET',
      headers: buildHeaders(true, false),
    });

    if (res.status === 401 || res.status === 403) {
      console.warn('apiFetchAnalytics: unauthorized (401/403). Admin key missing or invalid.');
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch analytics: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error('apiFetchAnalytics error', err);
    throw err;
  }
}

/**
 * Helper: export (server returns CSV). returns csv text or null if unauthorized
 */
async function apiExport(filters?: AnalyticsFilters): Promise<string | null> {
  try {
    const body = filters ? JSON.stringify(filters) : '{}';
    const res = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: buildHeaders(true, true),
      body,
    });

    if (res.status === 401 || res.status === 403) {
      console.warn('apiExport: unauthorized (401/403). Admin key missing or invalid.');
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Export failed: ${res.status} ${text}`);
    }

    // server returns CSV text
    const csv = await res.text();
    return csv;
  } catch (err) {
    console.error('apiExport error', err);
    throw err;
  }
}

// This hook manages analytics tracking - now wired to API
export const useAnalytics = () => {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentSession, setCurrentSession] = useState<UserAnalytics | null>(null);

  // Initialize user session tracking
  const initializeSession = useCallback(async (userName: string) => {
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
    } as unknown as UserAnalytics;

    setCurrentSession(session);

    // Send to backend (upsert). We attempt to persist but do not throw if it fails.
    try {
      const saved = await apiPostSession(session);
      // backend may return the persisted document; merge minimal fields
      setCurrentSession(prev => ({ ...(prev || session), ...(saved || {}) } as UserAnalytics));
    } catch (err) {
      // keep client-side session if backend fails
      console.warn('initializeSession: failed to persist session to backend. Continuing client-side only.');
    }

    console.log('📊 Session initialized:', session);
    return session;
  }, [userId, sessionId]);

  // Track question interaction
  const trackQuestionAnswer = useCallback(async (
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
      selectedAnswerId: selectedAnswer?.id ?? null,
      selectedAnswerText: selectedAnswer?.text ?? null,
      selectedVector: selectedAnswer?.vector ?? null,
      timeSpentOnQuestion,
      timestamp: new Date(),
      hesitationTime,
      changedAnswer
    };

    // Update current session locally
    setCurrentSession(prev => {
      const next: UserAnalytics = {
        ...(prev || ({} as UserAnalytics)),
        sessionId,
        id: userId,
        currentQuestionIndex: questionIndex + 1,
        timeSpent: ((prev && prev.timeSpent) || 0) + timeSpentOnQuestion,
        // manage an array of questionEvents, append this event
        // @ts-ignore - we may be adding fields not present in types; backend schema is flexible
        questionEvents: [ ...(prev && (prev as any).questionEvents ? (prev as any).questionEvents : []), questionAnalytics ]
      } as UserAnalytics;

      // fire off save in background (best-effort)
      (async () => {
        try {
          await apiPostSession(next);
        } catch (err) {
          console.warn('trackQuestionAnswer: failed to persist question event to backend.', err);
        }
      })();

      return next;
    });

    console.log('📊 Question answered:', questionAnalytics);
    return questionAnalytics;
  }, [userId, sessionId]);

  // Track quiz completion
// Replace your existing trackQuizCompletion with this version
const trackQuizCompletion = useCallback(async (
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

  // Update session locally
setCurrentSession(prev => {
  const next: UserAnalytics = {
    ...(prev || ({} as UserAnalytics)),
    completed: true,
    endTime: new Date(),
    timeSpent: totalCompletionTime,
    quizResult: resultAnalytics
  };

  (async () => {
    try {
      await apiUpdateSession(sessionId, {
        completed: true,
        endTime: new Date(),
        timeSpent: totalCompletionTime,
        quizResult: resultAnalytics
      });
    } catch (err) {
      console.warn('trackQuizCompletion: failed to persist completion to backend.', err);
    }
  })();

  return next;
});


  console.log('📊 Quiz completed:', resultAnalytics);
  return resultAnalytics;
}, [userId, sessionId]);


  // Track user feedback
  const trackFeedback = useCallback(async (rating: number, comment?: string) => {
    const feedback = {
      rating,
      comment,
      timestamp: new Date()
    };

    // Append feedback to session if possible, else just log
    setCurrentSession(prev => {
      const next = {
        ...(prev || ({} as UserAnalytics)),
        // @ts-ignore - add feedbacks array
        feedbacks: [ ...(prev && (prev as any).feedbacks ? (prev as any).feedbacks : []), feedback ]
      } as UserAnalytics;

      (async () => {
        try {
          await apiPostSession(next);
        } catch (err) {
          console.warn('trackFeedback: failed to persist feedback to backend.', err);
        }
      })();

      return next;
    });

    console.log('📊 Feedback submitted:', feedback);
    return feedback;
  }, []);

  // Track page views and navigation
  const trackPageView = useCallback(async (page: string) => {
    const pageView = {
      userId,
      sessionId,
      page,
      timestamp: new Date(),
      url: window.location.href
    };

    // append to session pageViews then persist
    setCurrentSession(prev => {
      const next = {
        ...(prev || ({} as UserAnalytics)),
        // @ts-ignore
        pageViews: [ ...(prev && (prev as any).pageViews ? (prev as any).pageViews : []), pageView ]
      } as UserAnalytics;

      (async () => {
        try {
          await apiPostSession(next);
        } catch (err) {
          console.warn('trackPageView: failed to persist page view to backend.', err);
        }
      })();

      return next;
    });

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

  // Mock fallback (used when backend is unavailable or unauthorized)
  const mockData: AdminAnalytics = {
    totalUsers: 1247,
    totalCompletedQuizzes: 1043,
    totalIncompletedQuizzes: 204,
    averageCompletionTime: 342,
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

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try real API (may return AdminAnalytics aggregates OR session array depending on backend)
      const data = await apiFetchAnalytics(filters);

      if (data === null) {
        // unauthorized or blocked — fall back to mock data but keep developer aware
        console.warn('fetchAnalytics: unauthorized or blocked by backend. Using mock analytics fallback.');
        setAnalytics(mockData);
      } else {
        // If backend returns aggregated AdminAnalytics use it directly; otherwise, transform array -> admin summary
        // We attempt a best-effort assignment:
        if ((data as any).totalUsers !== undefined) {
          setAnalytics(data as AdminAnalytics);
        } else if (Array.isArray(data)) {
          // derive some simple aggregates as a convenience (very small, extend as needed)
          const sessions = data as any[];
          const totalUsers = sessions.length;
          const totalCompletedQuizzes = sessions.filter(s => s.completed).length;
          const totalIncompletedQuizzes = totalUsers - totalCompletedQuizzes;
          const avgTime = sessions.reduce((acc, s) => acc + (s.timeSpent || 0), 0) / Math.max(1, totalUsers);
          setAnalytics({
            totalUsers,
            totalCompletedQuizzes,
            totalIncompletedQuizzes,
            averageCompletionTime: Math.round(avgTime),
            averageCompletionRate: totalUsers ? (totalCompletedQuizzes / totalUsers) : 0,
            dailyActiveUsers: totalUsers, weeklyActiveUsers: totalUsers, monthlyActiveUsers: totalUsers,
            questionStatistics: [],
            ideologyDistribution: [],
            figurePopularity: [],
            deviceStats: {},
            browserStats: {},
            referrerStats: {},
            peakUsageHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
            userRetentionRate: 0,
            averageFeedbackRating: 0,
            feedbackCount: 0
          } as AdminAnalytics);
        } else {
          // unknown shape - fallback
          setAnalytics(mockData);
        }
      }
    } catch (err) {
      console.warn('fetchAnalytics: failed to fetch from backend - falling back to mock data.', err);
      setAnalytics(mockData);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportData = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      if (format === 'csv') {
        const csv = await apiExport(filters);
        if (csv === null) {
          // unauthorized - inform caller
          throw new Error('Export unauthorized. Admin key missing or invalid.');
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } else {
        // JSON export: try to fetch sessions
        const sessions = await apiFetchAnalytics(filters);
        const payload = sessions === null ? mockData : sessions; // fallback to mock if unauthorized
        const dataStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      console.log(`📊 Exported data as ${format}.`);
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
