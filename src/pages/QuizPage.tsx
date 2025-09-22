import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { questions } from "@/data/quizData";
import { useUser } from "@/contexts/UserContext";
import { useAnalytics } from "@/hooks/useAnalytics";

interface UserAnswer {
  economic: number;
  social: number;
  foreign: number;
}

const QuizPage = () => {
  const navigate = useNavigate();
  const { userName } = useUser();
  const { initializeSession, trackQuestionAnswer, trackPageView } = useAnalytics();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<{
    id: string;
    text: string;
    vector: [number, number, number];
  } | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  useEffect(() => {
    // Initialize user session when quiz starts
    if (userName) {
      initializeSession(userName);
    }
    trackPageView('quiz');
  }, [userName, initializeSession, trackPageView]);

  useEffect(() => {
    // Reset selected answer and track time when moving to a new question
    setSelectedAnswer(null);
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  const handleAnswer = (answer: { id: string; text: string; vector: [number, number, number] }) => {
    setSelectedAnswer(answer);

    // Track question analytics
    const timeSpentOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000);
    trackQuestionAnswer(
      question,
      currentQuestion,
      answer,
      timeSpentOnQuestion
    );

    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = {
        economic: answer.vector[0],
        social: answer.vector[1],
        foreign: answer.vector[2],
      };
      setAnswers(newAnswers);

      if (isLastQuestion) {
        sessionStorage.setItem("quizAnswers", JSON.stringify(newAnswers));
        navigate("/result");
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 800);
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevAnswer = answers[currentQuestion - 1];
      if (prevAnswer) {
        const questionAnswers = questions[currentQuestion - 1].answers;
        const matchingAnswer = questionAnswers.find(
          (a) =>
            a.vector[0] === prevAnswer.economic &&
            a.vector[1] === prevAnswer.social &&
            a.vector[2] === prevAnswer.foreign
        );
        setSelectedAnswer(matchingAnswer || null);
      }
    } else {
      navigate("/");
    }
  };

  const goNext = () => {
    if (selectedAnswer && !isLastQuestion) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = {
        economic: selectedAnswer.vector[0],
        social: selectedAnswer.vector[1],
        foreign: selectedAnswer.vector[2],
      };
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {userName ? `${userName}'s Political Compass Quiz` : "Political Compass Quiz"}
          </h1>
          <ProgressBar current={currentQuestion + 1} total={questions.length} />
        </div>

        {/* Question */}
        <div className="page-enter page-enter-active">
          <QuestionCard
            question={question.text}
            answers={question.answers}
            onAnswer={handleAnswer}
            selectedAnswer={selectedAnswer}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={goBack}
            className="bg-secondary border-border hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentQuestion === 0 ? "Home" : "Previous"}
          </Button>

          {selectedAnswer && !isLastQuestion && (
            <Button
              onClick={goNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Counter */}
        <div className="text-center text-sm text-muted-foreground">
          {currentQuestion + 1} / {questions.length}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
