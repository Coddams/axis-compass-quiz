import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThreeAxisVisualization from "@/components/ThreeAxisVisualization";
import { calculateResult, QuizResult } from "@/data/quizData";

const ResultPage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const answersJson = sessionStorage.getItem("quizAnswers");
    if (!answersJson) {
      navigate("/");
      return;
    }

    try {
      const answers = JSON.parse(answersJson);
      const calculatedResult = calculateResult(answers);
      setResult(calculatedResult);

      sessionStorage.setItem("quizResult", JSON.stringify(calculatedResult));
    } catch (error) {
      console.error("Error calculating result:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Calculating your results...</p>
        </div>
      </div>
    );
  }

 const getQuadrantName = (economic: number, social: number, foreign: number) => {
  let base = "";

  if (economic < 0 && social > 0) base = "Libertarian Left";
  else if (economic > 0 && social > 0) base = "Libertarian Right";
  else if (economic < 0 && social < 0) base = "Authoritarian Left";
  else if (economic > 0 && social < 0) base = "Authoritarian Right";
  else base = "Centrist";

  let foreignTag = "";
  if (foreign > 0) foreignTag = "Interventionist";
  else if (foreign < 0) foreignTag = "Isolationist";
  else foreignTag = "Neutralist";

  return `${base} – ${foreignTag}`;
};


const quadrant = getQuadrantName(result.economic, result.social, result.foreign);

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 page-enter page-enter-active">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Your Political Compass
          </h1>
          {/* <p className="text-xl text-muted-foreground">
            You align with the{" "}
            <span className="text-primary font-semibold">{quadrant}</span>{" "}
            quadrant
          </p> */}

          {/* Ideology */}
          {result.ideology && (
            <div className="mt-4 p-4 bg-card rounded-xl shadow-md border border-border">
              <h2 className="text-2xl font-bold text-primary">
                {result.ideology.name}
              </h2>
              <p className="text-muted-foreground mt-2">
                {result.ideology.description}
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Three-Axis Visualization */}
          <div className="space-y-6">
            <ThreeAxisVisualization
              economic={result.economic}
              social={result.social}
              foreign={result.foreign}
              animated={true}
            />
          </div>

          {/* Top Matches */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-foreground mb-6">
              Your Top Political Matches
            </h2>

            <div className="space-y-4">
              {result.topMatches.map((match, index) => (
                <div
                  key={match.figure.id}
                  className="result-card flex items-center space-x-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {match.figure.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        #{index + 1} {match.figure.name}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {match.figure.explain || match.figure.quote}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${match.similarity}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/share")}
              className="btn-hero group"
            >
              <Share2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Share Your Results
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="bg-secondary border-border hover:bg-accent"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Take Quiz Again
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Share your compass to see how friends and family compare
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
