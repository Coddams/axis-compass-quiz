import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, RotateCcw, ArrowRight, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ThreeAxisVisualization from "@/components/ThreeAxisVisualization";
import { calculateResult, QuizResult } from "@/data/quizData";

const ResultPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() && rating === 0) {
      toast({
        title: "Please provide feedback",
        description: "Either write a comment or select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would typically send the feedback to your backend
      // For now, we'll just simulate a successful submission
      console.log("Feedback submitted:", { feedback, rating, result });
      
      setFeedbackSubmitted(true);
      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve the Political Compass experience.",
      });
    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

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
                      <h3 className="font-semibold text-lg text-primary">
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

        {/* Feedback Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="result-card">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <MessageSquare className="w-5 h-5" />
                How was your experience?
              </CardTitle>
              <CardDescription>
                Help us improve the Political Compass by sharing your feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!feedbackSubmitted ? (
                <>
                  {/* Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground">
                      Rate your experience (optional)
                    </label>
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(rating === star ? 0 : star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="space-y-2">
                    <label htmlFor="feedback" className="text-sm font-medium text-card-foreground">
                      Share your thoughts (optional)
                    </label>
                    <Textarea
                      id="feedback"
                      placeholder="Tell us about your experience with the quiz, the results, or any suggestions you have..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleFeedbackSubmit}
                    className="w-full bg-primary hover:bg-primary-glow"
                  >
                    Submit Feedback
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">
                      Thank you for your feedback!
                    </h3>
                    <p className="text-muted-foreground">
                      Your input helps us improve the Political Compass experience.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
