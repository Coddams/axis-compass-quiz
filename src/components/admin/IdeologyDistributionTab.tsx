import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Users, Target, Gauge } from 'lucide-react';

// TypeScript Interfaces
interface IdeologyDistribution {
  ideologyId: string;
  ideologyName: string;
  count: number;
  percentage: number;
  averageVector: {
    economic: number;
    social: number;
    foreign: number;
  };
  description?: string;
}

interface Analytics {
  ideologyDistribution: IdeologyDistribution[];
  totalCompletedQuizzes: number;
}

interface Props {
  analytics?: Analytics;
}

interface ClusteringInsight {
  title: string;
  description: string;
  ideologies?: string[];
}

// Mock data - replace with props from parent
const mockAnalytics: Analytics = {
  ideologyDistribution: [
    { 
      ideologyId: 'liberal', 
      ideologyName: 'Liberal', 
      count: 234, 
      percentage: 22.4, 
      averageVector: { economic: -1.2, social: 1.1, foreign: 0.3 },
      description: 'Supports social progressivism and economic intervention'
    },
    { 
      ideologyId: 'conservative', 
      ideologyName: 'Conservative', 
      count: 198, 
      percentage: 19.0, 
      averageVector: { economic: 1.1, social: -0.8, foreign: 0.8 },
      description: 'Supports traditional values and free markets'
    },
    { 
      ideologyId: 'libertarian', 
      ideologyName: 'Libertarian', 
      count: 156, 
      percentage: 15.0, 
      averageVector: { economic: 1.3, social: 1.2, foreign: -0.5 },
      description: 'Supports individual liberty and minimal government'
    },
    { 
      ideologyId: 'centrist', 
      ideologyName: 'Centrist', 
      count: 289, 
      percentage: 27.7, 
      averageVector: { economic: 0.1, social: 0.0, foreign: 0.2 },
      description: 'Balanced approach across all dimensions'
    },
    { 
      ideologyId: 'socialist', 
      ideologyName: 'Socialist', 
      count: 166, 
      percentage: 15.9, 
      averageVector: { economic: -1.5, social: 0.9, foreign: -0.3 },
      description: 'Supports collective ownership and social equality'
    }
  ],
  totalCompletedQuizzes: 1043
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa', '#f472b6'];

const IdeologyDistributionTab = ({ analytics = mockAnalytics }: Props) => {
  if (!analytics.ideologyDistribution || analytics.ideologyDistribution.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <p>No completed quizzes with ideology data yet.</p>
          <p className="text-sm mt-2">Ideology distribution will appear after users complete the quiz.</p>
        </div>
      </Card>
    );
  }

  // Calculate insights
  const topIdeology = [...analytics.ideologyDistribution].sort((a, b) => b.count - a.count)[0];
  const polarizationScore = calculatePolarization(analytics.ideologyDistribution);
  const diversityScore = calculateDiversity(analytics.ideologyDistribution);
  
  // Prepare data for different chart types
  const radarData = prepareRadarData(analytics.ideologyDistribution);
  const scatterData = prepareScatterData(analytics.ideologyDistribution);

  return (
    <div className="space-y-6">
      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Most Common</div>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold">{topIdeology.ideologyName}</div>
          <div className="text-sm text-muted-foreground">{topIdeology.percentage.toFixed(1)}% of users</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Polarization</div>
            <Gauge className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-xl font-bold">{polarizationScore}</div>
          <div className="text-sm text-muted-foreground">{getPolarizationLabel(polarizationScore)}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Diversity</div>
            <Users className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-xl font-bold">{diversityScore.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Distribution spread</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Mapped</div>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold">{analytics.totalCompletedQuizzes}</div>
          <div className="text-sm text-muted-foreground">Completed quizzes</div>
        </Card>
      </div>

      {/* Rest of your component code stays the same... */}
      {/* I'm showing just the changed parts */}
    </div>
  );
};

// Helper Components with proper types
interface AxisIndicatorProps {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}

const AxisIndicator = ({ label, value, leftLabel, rightLabel }: AxisIndicatorProps) => (
  <div className="text-xs">
    <div className="font-medium mb-1">{label}</div>
    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
    <div className="relative h-2 bg-muted rounded-full">
      <div 
        className="absolute top-0 h-2 rounded-full bg-primary"
        style={{ 
          left: value < 0 ? `${50 + (value / 2) * 50}%` : '50%',
          right: value > 0 ? `${50 - (value / 2) * 50}%` : '50%'
        }}
      />
      <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-border -ml-[1px]" />
    </div>
    <div className="text-center font-mono mt-1">{value.toFixed(2)}</div>
  </div>
);

const CustomScatterTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm">Users: {data.count}</p>
        <p className="text-sm">Economic: {data.economic.toFixed(2)}</p>
        <p className="text-sm">Social: {data.social.toFixed(2)}</p>
        <p className="text-sm">Foreign: {data.foreign.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

// Helper Functions with proper types
function calculatePolarization(ideologies: IdeologyDistribution[]): number {
  const vectors = ideologies.map(i => i.averageVector);
  const avgDistance = vectors.reduce((sum, v) => {
    const magnitude = Math.sqrt(v.economic ** 2 + v.social ** 2 + v.foreign ** 2);
    return sum + magnitude;
  }, 0) / vectors.length;
  return Math.round(Math.min(100, (avgDistance / 2) * 100));
}

function calculateDiversity(ideologies: IdeologyDistribution[]): number {
  const total = ideologies.reduce((sum, i) => sum + i.count, 0);
  const entropy = ideologies.reduce((sum, i) => {
    const p = i.count / total;
    return sum - (p * Math.log2(p));
  }, 0);
  const maxEntropy = Math.log2(ideologies.length);
  return (entropy / maxEntropy) * 100;
}

function calculateAxisPolarization(ideologies: IdeologyDistribution[], axis: 'economic' | 'social' | 'foreign'): number {
  const values = ideologies.map(i => Math.abs(i.averageVector[axis]));
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return (avg / 2) * 100;
}

function getPolarizationLabel(score: number): string {
  if (score < 30) return 'Low polarization';
  if (score < 60) return 'Moderate polarization';
  return 'High polarization';
}

function getPolarizationDescription(score: number): string {
  if (score < 30) return 'Users cluster toward moderate positions with little ideological distance.';
  if (score < 60) return 'Users show moderate spread across the ideological spectrum.';
  return 'Users are highly polarized with strong positions on multiple axes.';
}

function getAxisLabels(axis: string): { left: string; right: string } {
  const labels: Record<string, { left: string; right: string }> = {
    economic: { left: 'Left/Socialist', right: 'Right/Capitalist' },
    social: { left: 'Conservative', right: 'Liberal/Progressive' },
    foreign: { left: 'Isolationist', right: 'Interventionist' }
  };
  return labels[axis];
}

function prepareRadarData(ideologies: IdeologyDistribution[]): any[] {
  return [
    {
      axis: 'Economic',
      ...ideologies.reduce((acc, i) => ({ ...acc, [i.ideologyId]: i.averageVector.economic }), {})
    },
    {
      axis: 'Social',
      ...ideologies.reduce((acc, i) => ({ ...acc, [i.ideologyId]: i.averageVector.social }), {})
    },
    {
      axis: 'Foreign',
      ...ideologies.reduce((acc, i) => ({ ...acc, [i.ideologyId]: i.averageVector.foreign }), {})
    }
  ];
}

function prepareScatterData(ideologies: IdeologyDistribution[]): any[] {
  return ideologies.map(i => ({
    name: i.ideologyName,
    economic: i.averageVector.economic,
    social: i.averageVector.social,
    foreign: i.averageVector.foreign,
    count: i.count
  }));
}

function getClusteringInsights(ideologies: IdeologyDistribution[]): ClusteringInsight[] {
  const insights: ClusteringInsight[] = [];
  
  // Find centrist cluster
  const centrists = ideologies.filter(i => 
    Math.abs(i.averageVector.economic) < 0.5 &&
    Math.abs(i.averageVector.social) < 0.5
  );
  if (centrists.length > 0) {
    insights.push({
      title: 'Centrist Cluster',
      description: `${centrists.length} ideolog${centrists.length > 1 ? 'ies' : 'y'} cluster near the center, representing ${centrists.reduce((sum, i) => sum + i.count, 0)} users seeking balanced positions.`,
      ideologies: centrists.map(i => i.ideologyName)
    });
  }
  
  // Find economic extremes
  const economicLeft = ideologies.filter(i => i.averageVector.economic < -0.8);
  const economicRight = ideologies.filter(i => i.averageVector.economic > 0.8);
  if (economicLeft.length > 0 && economicRight.length > 0) {
    insights.push({
      title: 'Economic Divide',
      description: 'Clear economic polarization with distinct left and right clusters.',
      ideologies: [...economicLeft, ...economicRight].map(i => i.ideologyName)
    });
  }
  
  // Find social progressives - FIXED VARIABLE NAME
  const sociallyLiberal = ideologies.filter(i => i.averageVector.social > 0.8);
  if (sociallyLiberal.length > 0) {
    insights.push({
      title: 'Progressive Bloc',
      description: `Strong progressive cluster representing ${sociallyLiberal.reduce((sum, i) => sum + i.count, 0)} users.`,
      ideologies: sociallyLiberal.map(i => i.ideologyName)
    });
  }
  
  return insights;
}

export default IdeologyDistributionTab;