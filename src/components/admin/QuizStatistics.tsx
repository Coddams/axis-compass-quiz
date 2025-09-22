import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QuestionStatistics } from '@/types/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data - replace with your MongoDB data
const mockQuestionStats: QuestionStatistics[] = [
  {
    questionId: 'q1',
    questionText: 'A large corporation is considering moving its headquarters overseas to reduce taxes. What should be the government\'s response?',
    totalResponses: 1247,
    answerDistribution: [
      { answerId: 'a1', answerText: 'Implement tax reforms to keep businesses domestic', count: 456, percentage: 36.6 },
      { answerId: 'a2', answerText: 'Allow the free market to decide', count: 298, percentage: 23.9 },
      { answerId: 'a3', answerText: 'Impose penalties on companies that move overseas', count: 321, percentage: 25.7 },
      { answerId: 'a4', answerText: 'Provide incentives for companies to stay', count: 172, percentage: 13.8 }
    ],
    averageTimeSpent: 34.5,
    skipRate: 0.02,
    changeAnswerRate: 0.18
  },
  {
    questionId: 'q2', 
    questionText: 'The government is debating whether to legalize recreational marijuana. What is your position?',
    totalResponses: 1247,
    answerDistribution: [
      { answerId: 'a1', answerText: 'Full legalization with regulation', count: 534, percentage: 42.8 },
      { answerId: 'a2', answerText: 'Decriminalization only', count: 287, percentage: 23.0 },
      { answerId: 'a3', answerText: 'Keep current restrictions', count: 198, percentage: 15.9 },
      { answerId: 'a4', answerText: 'Increase penalties for drug use', count: 228, percentage: 18.3 }
    ],
    averageTimeSpent: 28.2,
    skipRate: 0.01,
    changeAnswerRate: 0.22
  },
  {
    questionId: 'q3',
    questionText: 'A foreign nation is committing human rights violations. How should your country respond?',
    totalResponses: 1247,
    answerDistribution: [
      { answerId: 'a1', answerText: 'Implement economic sanctions', count: 423, percentage: 33.9 },
      { answerId: 'a2', answerText: 'Use diplomatic pressure only', count: 356, percentage: 28.6 },
      { answerId: 'a3', answerText: 'Military intervention if necessary', count: 198, percentage: 15.9 },
      { answerId: 'a4', answerText: 'Focus on domestic issues first', count: 270, percentage: 21.6 }
    ],
    averageTimeSpent: 41.7,
    skipRate: 0.03,
    changeAnswerRate: 0.25
  }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const QuizStatistics = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionStatistics | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{mockQuestionStats.length}</div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatTime(mockQuestionStats.reduce((sum, q) => sum + q.averageTimeSpent, 0) / mockQuestionStats.length)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Time per Question</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {((mockQuestionStats.reduce((sum, q) => sum + q.changeAnswerRate, 0) / mockQuestionStats.length) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Answer Change Rate</div>
          </div>
        </Card>
      </div>

      {/* Question List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Question Performance</h3>
        <div className="space-y-4">
          {mockQuestionStats.map((question, index) => {
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