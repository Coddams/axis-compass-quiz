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

  const completionRate = ((analytics.totalCompletedQuizzes / (analytics.totalCompletedQuizzes + analytics.totalIncompletedQuizzes)) * 100).toFixed(1);

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
        </TabsList>

        <TabsContent value="users">
          <UserAnalyticsTable />
        </TabsContent>

        <TabsContent value="questions">
          <QuizStatistics />
        </TabsContent>

        <TabsContent value="ideologies">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ideology Distribution</h3>
            <div className="space-y-4">
              {analytics.ideologyDistribution.map((ideology) => (
                <div key={ideology.ideologyId} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{ideology.ideologyName}</h4>
                    <Badge variant="outline">{ideology.count} users ({ideology.percentage.toFixed(1)}%)</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Economic:</span>
                      <span className="ml-1 font-mono">{ideology.averageVector.economic.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Social:</span>
                      <span className="ml-1 font-mono">{ideology.averageVector.social.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Foreign:</span>
                      <span className="ml-1 font-mono">{ideology.averageVector.foreign.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="figures">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Historical Figure Popularity</h3>
            <div className="space-y-4">
              {analytics.figurePopularity.map((figure, index) => (
                <div key={figure.figureId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                    <div>
                      <h4 className="font-medium">{figure.figureName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {figure.matchCount} total matches • {figure.topMatchCount} top matches
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{(figure.averageSimilarity * 100).toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Avg. Similarity</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;