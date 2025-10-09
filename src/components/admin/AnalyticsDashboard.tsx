import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useAdminAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsFilters } from '@/types/analytics';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Smartphone,
  Monitor,
  Globe,
  Star
} from 'lucide-react';
import UserAnalyticsTable from './UserAnalyticsTable';
import QuizStatistics from './QuizStatistics';
import IdeologyDistributionTab from './IdeologyDistributionTab';
import FigurePopularityTab from './FigurePopularityTab';


const AnalyticsDashboard = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    }
  });

  const { analytics, loading, error, refetch, exportData } = useAdminAnalytics(filters);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportData(format);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading analytics: {error}</div>
      </div>
    );
  }

  if (!analytics) return null;

  const completionRate = analytics.totalUsers > 0
    ? ((analytics.totalCompletedQuizzes / analytics.totalUsers) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <DatePickerWithRange
            date={filters.dateRange}
            onDateChange={(range) => setFilters({ ...filters, dateRange: range })}
          />

          <Select
            value={filters.deviceType || 'all'}
            onValueChange={(value) => setFilters({
              ...filters,
              deviceType: value === 'all' ? undefined : value as 'mobile' | 'desktop'
            })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refetch} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => handleExport('json')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
              <p className="text-2xl font-bold">{Math.floor(analytics.averageCompletionTime / 60)}m {analytics.averageCompletionTime % 60}s</p>
            </div>
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Feedback Rating</p>
              <p className="text-2xl font-bold">{analytics.averageFeedbackRating.toFixed(1)}/5</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Device & Browser Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Device Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(analytics.deviceStats.mobile / analytics.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-sm">{analytics.deviceStats.mobile}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Desktop
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full"
                    style={{ width: `${(analytics.deviceStats.desktop / analytics.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-sm">{analytics.deviceStats.desktop}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Traffic Sources
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.referrerStats).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span>{source}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${(count / analytics.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Data</TabsTrigger>
          <TabsTrigger value="questions">Question Analytics</TabsTrigger>
          <TabsTrigger value="ideologies">Ideology Distribution</TabsTrigger>
          <TabsTrigger value="figures">Figure Popularity</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger> {/* ← ADD THIS */}
        </TabsList>

        <TabsContent value="users">
          <UserAnalyticsTable />
        </TabsContent>

        <TabsContent value="questions">
          <QuizStatistics />
        </TabsContent>

        <TabsContent value="ideologies">
          <IdeologyDistributionTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Feedback</h3>

            {analytics.feedbackCount > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {analytics.averageFeedbackRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Average Rating</div>
                      <div className="flex justify-center mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(analytics.averageFeedbackRating)
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{analytics.feedbackCount}</div>
                      <div className="text-sm text-muted-foreground">Total Responses</div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {((analytics.feedbackCount / analytics.totalCompletedQuizzes) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Response Rate</div>
                    </div>
                  </Card>
                </div>

                {/* Note about detailed feedback */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Individual feedback comments are stored in the database.
                    To view detailed comments, check the User Data tab and click "Details" on any completed session with feedback.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No feedback submissions yet.</p>
                <p className="text-sm mt-2">Feedback will appear after users rate their experience.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="figures">
          {analytics.figurePopularityByMatches && analytics.figurePopularityBySimilarity ? (
            <FigurePopularityTab
              byMatches={analytics.figurePopularityByMatches}
              bySimilarity={analytics.figurePopularityBySimilarity}
            />
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Historical Figure Popularity</h3>
              <div className="text-center py-8 text-muted-foreground">
                <p>No figure matching data available yet.</p>
                <p className="text-sm mt-2">Figure popularity will appear after users complete the quiz.</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;