import { useState } from 'react';
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
import { UserAnalytics, QuestionAnalytics, QuizResultAnalytics } from '@/types/analytics';
import { Search, Eye, Smartphone, Monitor, CheckCircle, XCircle, Clock } from 'lucide-react';

// Mock data - replace with your MongoDB data
const mockUsers: (UserAnalytics & { 
  questionAnswers?: QuestionAnalytics[]; 
  result?: QuizResultAnalytics 
})[] = [
  {
    id: 'user_1',
    sessionId: 'session_1',
    userName: 'John Smith',
    startTime: new Date('2024-01-15T10:30:00'),
    endTime: new Date('2024-01-15T10:45:00'),
    completed: true,
    currentQuestionIndex: 20,
    totalQuestions: 20,
    timeSpent: 900,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    referrer: 'https://google.com',
    deviceInfo: {
      isMobile: false,
      screenWidth: 1920,
      screenHeight: 1080,
      browser: 'Chrome',
      os: 'Windows'
    },
    result: {
      userId: 'user_1',
      sessionId: 'session_1',
      finalVector: { economic: -1.2, social: 0.8, foreign: 0.3 },
      matchedIdeology: {
        id: 'liberal',
        name: 'Liberal',
        description: 'Progressive social values with mixed economic views',
        confidence: 0.85
      },
      topFigureMatches: [
        { id: 'lincoln', name: 'Abraham Lincoln', similarity: 0.78, vector: [-1.1, 0.9, 0.2] },
        { id: 'roosevelt', name: 'Franklin D. Roosevelt', similarity: 0.72, vector: [-1.3, 0.7, 0.4] }
      ],
      completionTime: 900,
      timestamp: new Date('2024-01-15T10:45:00'),
      shareAttempted: true,
      feedbackGiven: {
        rating: 5,
        comment: 'Very insightful quiz!',
        timestamp: new Date('2024-01-15T10:46:00')
      }
    }
  },
  // Add more mock users...
];

const UserAnalyticsTable = () => {
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

  const filteredUsers = users.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">User Analytics</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Badge variant="outline">
            {filteredUsers.length} users
          </Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Ideology</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.userName}</div>
                    <div className="text-sm text-muted-foreground">{user.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.deviceInfo.isMobile ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {user.deviceInfo.browser} • {user.deviceInfo.os}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.completed ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Incomplete ({user.currentQuestionIndex}/{user.totalQuestions})
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(user.timeSpent)}
                  </div>
                </TableCell>
                <TableCell>
                  {user.result ? (
                    <Badge variant="outline">
                      {user.result.matchedIdeology.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(user.startTime)}
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>User Details: {user.userName}</DialogTitle>
                        <DialogDescription>
                          Comprehensive analytics for user session {user.sessionId}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedUser && (
                        <div className="space-y-6">
                          {/* Session Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Session Information</h4>
                              <div className="text-sm space-y-1">
                                <div><strong>User ID:</strong> {selectedUser.id}</div>
                                <div><strong>Session ID:</strong> {selectedUser.sessionId}</div>
                                <div><strong>Started:</strong> {formatDate(selectedUser.startTime)}</div>
                                {selectedUser.endTime && (
                                  <div><strong>Completed:</strong> {formatDate(selectedUser.endTime)}</div>
                                )}
                                <div><strong>Total Time:</strong> {formatDuration(selectedUser.timeSpent)}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium">Device & Browser</h4>
                              <div className="text-sm space-y-1">
                                <div><strong>Device:</strong> {selectedUser.deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</div>
                                <div><strong>Screen:</strong> {selectedUser.deviceInfo.screenWidth}x{selectedUser.deviceInfo.screenHeight}</div>
                                <div><strong>Browser:</strong> {selectedUser.deviceInfo.browser}</div>
                                <div><strong>OS:</strong> {selectedUser.deviceInfo.os}</div>
                                {selectedUser.referrer && (
                                  <div><strong>Referrer:</strong> {selectedUser.referrer}</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quiz Results */}
                          {selectedUser.result && (
                            <div className="space-y-4">
                              <h4 className="font-medium">Quiz Results</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-border rounded-lg">
                                  <h5 className="font-medium mb-2">Political Vector</h5>
                                  <div className="space-y-1 text-sm">
                                    <div>Economic: <span className="font-mono">{selectedUser.result.finalVector.economic.toFixed(2)}</span></div>
                                    <div>Social: <span className="font-mono">{selectedUser.result.finalVector.social.toFixed(2)}</span></div>  
                                    <div>Foreign: <span className="font-mono">{selectedUser.result.finalVector.foreign.toFixed(2)}</span></div>
                                  </div>
                                </div>
                                
                                <div className="p-4 border border-border rounded-lg">
                                  <h5 className="font-medium mb-2">Matched Ideology</h5>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>{selectedUser.result.matchedIdeology.name}</strong></div>
                                    <div className="text-muted-foreground">{selectedUser.result.matchedIdeology.description}</div>
                                    <div>Confidence: {(selectedUser.result.matchedIdeology.confidence * 100).toFixed(1)}%</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-4 border border-border rounded-lg">
                                <h5 className="font-medium mb-2">Top Figure Matches</h5>
                                <div className="space-y-2">
                                  {selectedUser.result.topFigureMatches.map((figure, index) => (
                                    <div key={figure.id} className="flex items-center justify-between text-sm">
                                      <span>#{index + 1} {figure.name}</span>
                                      <span>{(figure.similarity * 100).toFixed(1)}% similarity</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Feedback */}
                          {selectedUser.result?.feedbackGiven && (
                            <div className="space-y-2">
                              <h4 className="font-medium">User Feedback</h4>
                              <div className="p-4 border border-border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <span key={i} className={i < selectedUser.result!.feedbackGiven!.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(selectedUser.result.feedbackGiven.timestamp)}
                                  </span>
                                </div>
                                {selectedUser.result.feedbackGiven.comment && (
                                  <p className="text-sm">{selectedUser.result.feedbackGiven.comment}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default UserAnalyticsTable;