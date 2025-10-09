export interface UserAnalytics {
  id: string;
  userId: string; // MongoDB document needs both id and userId
  sessionId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  ipAddress?: string;
  userAgent: string; // Required field for analytics
  referrer?: string;
  deviceInfo: {
    isMobile: boolean;
    screenWidth: number;
    screenHeight: number;
    browser: string;
    os: string;
  };
  questionEvents?: Array<{
    questionId: string;
    selectedAnswer: any;
    timeSpent: number;
    timestamp: Date;
    hesitationTime?: number;
    changedAnswer?: boolean;
  }>;
  quizResult?: QuizResultAnalytics;
}

export interface QuestionAnalytics {
  questionId: string;
  userId: string;
  sessionId: string;
  questionText: string;
  selectedAnswerId: string;
  selectedAnswerText: string;
  selectedVector: [number, number, number];
  timeSpentOnQuestion: number; // in seconds
  timestamp: Date;
  hesitationTime?: number; // time before selecting answer
  changedAnswer?: boolean; // if user changed their initial selection
}

export interface QuizResultAnalytics {
  userId: string;
  sessionId: string;
  score?: number;
  resultData?: any;
  finalVector: {
    economic: number;
    social: number;
    foreign: number;
  };
  matchedIdeology: {
    id: string;
    name: string;
    description: string;
    confidence: number; // 0-1
  };
  topFigureMatches: Array<{
    id: string;
    name: string;
    similarity: number;
    vector: [number, number, number];
  }>;
  completionTime: number; // total time in seconds
  timestamp: Date;
  shareAttempted: boolean;
  feedbackGiven?: {
    rating: number;
    comment?: string;
    timestamp: Date;
  };
  completedAt?: Date | string;
}

export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  totalResponses: number;
  answerDistribution: Array<{
    answerId: string;
    answerText: string;
    count: number;
    percentage: number;
  }>;
  averageTimeSpent: number;
  skipRate: number;
  changeAnswerRate: number;
}

export interface IdeologyDistribution {
  ideologyId: string;
  ideologyName: string;
  count: number;
  percentage: number;
  averageVector: {
    economic: number;
    social: number;
    foreign: number;
  };
}

export interface FigurePopularity {
  figureId: string;
  figureName: string;
  matchCount: number;
  topMatchCount: number;
  averageSimilarity: number; // Already a percentage 0-100
  matchPercentage?: number;
  positionCounts?: {
    first: number;
    second: number;
    third: number;
  };
}

export interface AdminAnalytics {
  totalUsers: number;
  totalCompletedQuizzes: number;
  totalIncompletedQuizzes: number;
  averageCompletionTime: number;
  averageCompletionRate: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  questionStatistics: QuestionStatistics[];
  ideologyDistribution: IdeologyDistribution[];
  figurePopularity: FigurePopularity[];
  figurePopularityByMatches?: FigurePopularity[];  
  figurePopularityBySimilarity?: FigurePopularity[];
  deviceStats: {
    mobile: number;
    desktop: number;
  };
  browserStats: Record<string, number>;
  referrerStats: Record<string, number>;
  peakUsageHours: Array<{
    hour: number;
    count: number;
  }>;
  userRetentionRate: number;
  averageFeedbackRating: number;
  feedbackCount: number;
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  completedOnly?: boolean;
  deviceType?: 'mobile' | 'desktop' | 'all';
  ideologyFilter?: string[];
  minCompletionTime?: number;
  maxCompletionTime?: number;
}

export interface ExportData {
  users: UserAnalytics[];
  questions: QuestionAnalytics[];
  results: QuizResultAnalytics[];
  timestamp: Date;
  totalRecords: number;
}