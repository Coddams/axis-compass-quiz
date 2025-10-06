import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QuestionStatistics } from '@/types/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import questionsData from '@/config/questions.json';
import { RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'CHANGE_ME';

// Generate real question stats from database
const generateQuestionStats = (sessions: any[]): QuestionStatistics[] => {
  const questionMap: Record<string, QuestionStatistics> = {};
  
  // Initialize from questions config
  questionsData.forEach((q: any) => {
    questionMap[q.id] = {
      questionId: q.id,
      questionText: q.text,
      totalResponses: 0,
      answerDistribution: q.answers.map((a: any) => ({
        answerId: a.id,
        answerText: a.text,
        count: 0,
        percentage: 0
      })),
      averageTimeSpent: 0,
      skipRate: 0,
      changeAnswerRate: 0
    };
  });

  // Aggregate from sessions
  let totalTimePerQuestion: Record<string, number[]> = {};
  let changedAnswers = 0;
  let totalAnswers = 0;

  sessions.forEach((session: any) => {
    if (session.questionEvents && Array.isArray(session.questionEvents)) {
      session.questionEvents.forEach((event: any) => {
        const qId = event.questionId;
        if (questionMap[qId]) {
          questionMap[qId].totalResponses++;
          
          // Count answer
          const answerIdx = questionMap[qId].answerDistribution.findIndex(
            a => a.answerId === event.selectedAnswer?.id
          );
          if (answerIdx !== -1) {
            questionMap[qId].answerDistribution[answerIdx].count++;
          }

          // Track time
          if (!totalTimePerQuestion[qId]) totalTimePerQuestion[qId] = [];
          totalTimePerQuestion[qId].push(event.timeSpent || 0);

          // Track changes
          if (event.changedAnswer) changedAnswers++;
          totalAnswers++;
        }
      });
    }
  });

  // Calculate percentages and averages
  Object.values(questionMap).forEach(q => {
    if (q.totalResponses > 0) {
      q.answerDistribution.forEach(a => {
        a.percentage = (a.count / q.totalResponses) * 100;
      });

      const times = totalTimePerQuestion[q.questionId] || [];
      q.averageTimeSpent = times.length > 0 
        ? times.reduce((a, b) => a + b, 0) / times.length 
        : 0;
    }
    q.changeAnswerRate = totalAnswers > 0 ? changedAnswers / totalAnswers : 0;
  });

  return Object.values(questionMap).filter(q => q.totalResponses > 0);
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const QuizStatistics = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionStatistics | null>(null);
  const [questionStats, setQuestionStats] = useState<QuestionStatistics[]>([]);
  const [loading, setLoading] = useState(true);

const fetchQuestionStats = async () => {
  setLoading(true);
  try {
    // Use the new /sessions endpoint for raw data
    const response = await fetch(`${API_BASE}/sessions?api_key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const sessions = await response.json();
    
    console.log('Fetched sessions:', sessions.length);
    console.log('Sample session:', sessions[0]);
    
    if (!Array.isArray(sessions)) {
      console.error('Expected array of sessions, got:', typeof sessions);
      setQuestionStats([]);
      return;
    }
    
    const stats = generateQuestionStats(sessions);
    console.log('Generated stats for questions:', stats.length);
    
    setQuestionStats(stats);
  } catch (error) {
    console.error('Failed to fetch question stats:', error);
    setQuestionStats([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchQuestionStats();
  }, []);

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const getEngagementLevel = (timeSpent: number, changeRate: number) => {
    const avgTime = 35; // baseline average
    const avgChangeRate = 0.2; // baseline change rate
    
    if (timeSpent > avgTime * 1.2 && changeRate > avgChangeRate * 1.2) {
      return { level: 'High', color: 'bg-green-500', description: 'Users spend significant time and frequently reconsider' };
    } else if (timeSpent < avgTime * 0.8 && changeRate < avgChangeRate * 0.8) {
      return { level: 'Low', color: 'bg-red-500', description: 'Quick decisions with little reconsideration' };
    } else {
      return { level: 'Medium', color: 'bg-yellow-500', description: 'Average engagement and consideration' };
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading question analytics...
        </div>
      </Card>
    );
  }

  if (questionStats.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <p>No question data available yet.</p>
          <p className="text-sm mt-2">Question analytics will appear after users answer quiz questions.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{questionStats.length}</div>
            <div className="text-sm text-muted-foreground">Questions Answered</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatTime(questionStats.reduce((sum, q) => sum + q.averageTimeSpent, 0) / questionStats.length)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Time per Question</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {questionStats.reduce((sum, q) => sum + q.totalResponses, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Responses</div>
          </div>
        </Card>
      </div>

      {/* Question List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Question Performance (Real Data)</h3>
        <div className="space-y-4">
          {questionStats.map((question, index) => {
            const engagement = getEngagementLevel(question.averageTimeSpent, question.changeAnswerRate);
            const mostPopularAnswer = question.answerDistribution.reduce((prev, current) => 
              prev.percentage > current.percentage ? prev : current
            );
            
            return (
              <div 
                key={question.questionId} 
                className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedQuestion(selectedQuestion?.questionId === question.questionId ? null : question)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Question {index + 1}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{question.questionText}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Responses:</span>
                        <Badge variant="outline">{question.totalResponses.toLocaleString()}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Avg Time:</span>
                        <span className="font-mono">{formatTime(question.averageTimeSpent)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Engagement:</span>
                        <div className={`w-2 h-2 rounded-full ${engagement.color}`} />
                        <span>{engagement.level}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Skip Rate:</span>
                        <span>{(question.skipRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm">
                      <div className="font-medium">Most Popular:</div>
                      <div className="text-muted-foreground text-xs">{mostPopularAnswer.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedQuestion?.questionId === question.questionId && (
                  <div className="mt-4 pt-4 border-t border-border space-y-6">
                    {/* Answer Distribution Bar Chart */}
                    <div>
                      <h5 className="font-medium mb-3">Answer Distribution</h5>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={question.answerDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="answerId" 
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              label={{ value: 'Responses', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              formatter={(value, name) => [value, 'Responses']}
                              labelFormatter={(label) => {
                                const answer = question.answerDistribution.find(a => a.answerId === label);
                                return answer ? answer.answerText : label;
                              }}
                            />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Answer Breakdown */}
                    <div>
                      <h5 className="font-medium mb-3">Detailed Breakdown</h5>
                      <div className="space-y-3">
                        {question.answerDistribution.map((answer, idx) => (
                          <div key={answer.answerId} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">{answer.answerText}</div>
                              <Progress value={answer.percentage} className="h-2" />
                            </div>
                            <div className="ml-4 text-right">
                              <div className="text-sm font-medium">{answer.count}</div>
                              <div className="text-xs text-muted-foreground">{answer.percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div>
                      <h5 className="font-medium mb-3">Answer Distribution (Pie Chart)</h5>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={question.answerDistribution}
                              dataKey="count"
                              nameKey="answerText"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ percentage }) => `${percentage.toFixed(1)}%`}
                            >
                              {question.answerDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Engagement Insights */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h5 className="font-medium mb-2">Engagement Insights</h5>
                      <p className="text-sm text-muted-foreground mb-2">{engagement.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Change Answer Rate:</span>
                          <span className="ml-1 font-medium">{(question.changeAnswerRate * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Skip Rate:</span>
                          <span className="ml-1 font-medium">{(question.skipRate * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default QuizStatistics;