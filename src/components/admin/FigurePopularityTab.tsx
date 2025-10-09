import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Award, Users } from 'lucide-react';

interface FigurePopularity {
  figureId: string;
  figureName: string;
  matchCount: number;
  topMatchCount: number;
  averageSimilarity: number;
  matchPercentage?: number;
  positionCounts?: {
    first: number;
    second: number;
    third: number;
  };
}

interface FigurePopularityTabProps {
  byMatches: FigurePopularity[];
  bySimilarity: FigurePopularity[];
}

const FigurePopularityTab = ({ byMatches, bySimilarity }: FigurePopularityTabProps) => {
  const [view, setView] = useState<'matches' | 'similarity'>('matches');

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getMedalIcon = (index: number) => {
    if (index < 3) return <Trophy className={`w-6 h-6 ${getMedalColor(index)}`} />;
    return <span className="text-xl font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const renderFigureCard = (figure: FigurePopularity, index: number, type: 'matches' | 'similarity') => (
    <Card key={figure.figureId} className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-12 flex flex-col items-center justify-center">
          {getMedalIcon(index)}
        </div>

        {/* Figure Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-lg mb-2">{figure.figureName}</h4>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Total Matches</div>
              <div className="font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" />
                {figure.matchCount}
              </div>
            </div>
            
            <div>
              <div className="text-muted-foreground text-xs">Avg. Similarity</div>
              <div className="font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {figure.averageSimilarity.toFixed(1)}%
              </div>
            </div>

            {figure.positionCounts && (
              <>
                <div>
                  <div className="text-muted-foreground text-xs">#1 Matches</div>
                  <div className="font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3 text-yellow-500" />
                    {figure.positionCounts.first}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground text-xs">Match Rate</div>
                  <div className="font-semibold">
                    {figure.matchPercentage?.toFixed(1) || '0.0'}%
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Position Breakdown */}
          {figure.positionCounts && (
            <div className="mt-3 flex gap-2">
              <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/20">
                1st: {figure.positionCounts.first}
              </Badge>
              <Badge variant="outline" className="text-xs bg-gray-400/10 border-gray-400/20">
                2nd: {figure.positionCounts.second}
              </Badge>
              <Badge variant="outline" className="text-xs bg-amber-600/10 border-amber-600/20">
                3rd: {figure.positionCounts.third}
              </Badge>
            </div>
          )}

          {/* Visual Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  type === 'matches' ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{
                  width: type === 'matches'
                    ? `${Math.min(100, (figure.matchCount / byMatches[0]?.matchCount) * 100)}%`
                    : `${figure.averageSimilarity}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Historical Figure Popularity</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Analysis of which figures users match with most
          </p>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'matches' | 'similarity')} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Most Matched
          </TabsTrigger>
          <TabsTrigger value="similarity" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Highest Similarity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          <Card className="p-4 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Most Matched Figures</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Figures that appear most frequently in users' top 3 matches, regardless of similarity score.
                  This shows which figures have the broadest appeal across different political positions.
                </p>
              </div>
            </div>
          </Card>

          {byMatches.length > 0 ? (
            <div className="grid gap-4">
              {byMatches.map((figure, index) => renderFigureCard(figure, index, 'matches'))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No matching data available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Figure popularity will appear after users complete the quiz.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="similarity" className="space-y-4">
          <Card className="p-4 bg-green-500/5 border-green-500/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Highest Similarity Figures</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Figures with the highest average similarity scores when matched with users.
                  This shows which figures users align with most closely when they do match.
                </p>
              </div>
            </div>
          </Card>

          {bySimilarity.length > 0 ? (
            <div className="grid gap-4">
              {bySimilarity.map((figure, index) => renderFigureCard(figure, index, 'similarity'))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No similarity data available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Figure similarity will appear after users complete the quiz.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {byMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {byMatches.length}
              </div>
              <div className="text-sm text-muted-foreground">Unique Figures Matched</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {byMatches[0]?.matchCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Most Matches ({byMatches[0]?.figureName})
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {bySimilarity[0]?.averageSimilarity.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-muted-foreground">
                Highest Similarity ({bySimilarity[0]?.figureName})
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FigurePopularityTab;