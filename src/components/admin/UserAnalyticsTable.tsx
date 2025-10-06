import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Eye, RefreshCw, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { UserAnalytics } from '@/types/analytics';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'CHANGE_ME';

const UserAnalyticsTable = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserAnalytics[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/?api_key=${API_KEY}`);
      const data = await response.json();

      // Fetch individual user sessions
      const sessionsResponse = await fetch(`${API_BASE}/sessions?api_key=${API_KEY}`);
      const sessionsData = await sessionsResponse.json();
      setUsers(sessionsData || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.sessionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading user data...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">User Sessions</h3>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Badge variant="outline">
            {filteredUsers.length} sessions
          </Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No user sessions found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.sessionId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.userName || 'Anonymous'}</div>
                      <div className="text-xs text-muted-foreground">{user.sessionId.slice(0, 20)}...</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.completed ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Incomplete
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{user.currentQuestionIndex}/{user.totalQuestions}</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(user.currentQuestionIndex / user.totalQuestions) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">{formatTime(user.timeSpent)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.deviceInfo?.isMobile ? '📱 Mobile' : '🖥️ Desktop'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.startTime)}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Session Details: {user.userName || 'Anonymous'}</DialogTitle>
                          <DialogDescription>
                            Complete session information and quiz progress
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Session Info</h4>
                              <div className="space-y-1 text-sm">
                                <div><span className="text-muted-foreground">Session ID:</span> {user.sessionId}</div>
                                <div><span className="text-muted-foreground">User ID:</span> {user.userId}</div>
                                <div><span className="text-muted-foreground">Started:</span> {formatDate(user.startTime)}</div>
                                {user.endTime && <div><span className="text-muted-foreground">Ended:</span> {formatDate(user.endTime)}</div>}
                                <div><span className="text-muted-foreground">Total Time:</span> {formatTime(user.timeSpent)}</div>
                              </div>
                            </div>
                            {user.quizResult?.feedbackGiven && (
                              <div>
                                <h4 className="font-semibold mb-2">User Feedback</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Rating:</span>
                                    <div className="flex gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${i < user.quizResult.feedbackGiven.rating
                                              ? 'fill-primary text-primary'
                                              : 'text-muted-foreground'
                                            }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="font-medium">
                                      {user.quizResult.feedbackGiven.rating}/5
                                    </span>
                                  </div>
                                  {user.quizResult.feedbackGiven.comment && (
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                      <span className="text-muted-foreground">Comment:</span>
                                      <p className="mt-1">{user.quizResult.feedbackGiven.comment}</p>
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground">
                                    Submitted: {new Date(user.quizResult.feedbackGiven.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold mb-2">Time Analysis</h4>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Avg per Question:</span>{' '}
                                  {user.currentQuestionIndex > 0
                                    ? formatTime(Math.floor(user.timeSpent / user.currentQuestionIndex))
                                    : 'N/A'}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Completion Speed:</span>{' '}
                                  {user.completed && user.timeSpent < 180 ? (
                                    <Badge variant="outline" className="text-xs">Fast</Badge>
                                  ) : user.completed && user.timeSpent > 600 ? (
                                    <Badge variant="outline" className="text-xs">Thorough</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Normal</Badge>
                                  )}
                                </div>
                                {user.questionEvents && user.questionEvents.length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground">Fastest Answer:</span>{' '}
                                    {Math.min(...user.questionEvents.map(e => e.timeSpent))}s
                                  </div>
                                )}
                                {user.questionEvents && user.questionEvents.length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground">Slowest Answer:</span>{' '}
                                    {Math.max(...user.questionEvents.map(e => e.timeSpent))}s
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Context</h4>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-muted-foreground">IP Address:</span>{' '}
                                  {user.ipAddress || 'Unknown'}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Time of Day:</span>{' '}
                                  {new Date(user.startTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Day:</span>{' '}
                                  {new Date(user.startTime).toLocaleDateString([], {
                                    weekday: 'long'
                                  })}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Device Info</h4>
                              <div className="space-y-1 text-sm">
                                <div><span className="text-muted-foreground">Type:</span> {user.deviceInfo?.isMobile ? 'Mobile' : 'Desktop'}</div>
                                <div><span className="text-muted-foreground">Browser:</span> {user.deviceInfo?.browser || 'Unknown'}</div>
                                <div><span className="text-muted-foreground">OS:</span> {user.deviceInfo?.os || 'Unknown'}</div>
                                <div><span className="text-muted-foreground">Screen:</span> {user.deviceInfo?.screenWidth}x{user.deviceInfo?.screenHeight}</div>
                                <div><span className="text-muted-foreground">Referrer:</span> {user.referrer || 'Direct'}</div>
                              </div>
                            </div>
                          </div>

                          {user.quizResult && (
                            <div>
                              <h4 className="font-semibold mb-2">Quiz Results</h4>
                              <div className="space-y-2 text-sm">
                                <div><span className="text-muted-foreground">Score:</span> {user.quizResult.score}</div>
                                <div><span className="text-muted-foreground">Ideology:</span> {user.quizResult.resultData?.matchedIdeology?.name || 'N/A'}</div>
                                <div><span className="text-muted-foreground">Confidence:</span> {((user.quizResult.resultData?.matchedIdeology?.confidence || 0) * 100).toFixed(1)}%</div>
                                {user.quizResult.resultData?.topFigureMatches && (
                                  <div>
                                    <span className="text-muted-foreground">Top Matches:</span>
                                    <ul className="ml-4 mt-1">
                                      {user.quizResult.resultData.topFigureMatches.slice(0, 3).map((fig: any) => (
                                        <li key={fig.id}>{fig.name} ({(fig.similarity * 100).toFixed(1)}%)</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {user.questionEvents && user.questionEvents.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Question History ({user.questionEvents.length} answered)</h4>
                              <div className="max-h-64 overflow-y-auto space-y-2">
                                {user.questionEvents.map((event, idx) => (
                                  <div key={idx} className="p-2 bg-muted/30 rounded text-xs">
                                    <div><span className="font-medium">Q{idx + 1}:</span> {event.questionId}</div>
                                    <div><span className="text-muted-foreground">Time:</span> {event.timeSpent}s</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default UserAnalyticsTable;
