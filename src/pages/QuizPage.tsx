import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { quizQuestions } from "@/data/quizData";

interface UserAnswer {
  economic: number;
  social: number;
}

const QuizPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<{ text: string; economic: number; social: number } | null>(null);

  const question = quizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;

  useEffect(() => {
    // Reset selected answer when moving to next question
    setSelectedAnswer(null);
  }, [currentQuestion]);

  const handleAnswer = (answer: { text: string; economic: number; social: number }) => {
    setSelectedAnswer(answer);
    
    // Auto-advance after a short delay
    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = { economic: answer.economic, social: answer.social };
      setAnswers(newAnswers);

      if (isLastQuestion) {
        // Store results and navigate to result page
        sessionStorage.setItem('quizAnswers', JSON.stringify(newAnswers));
        navigate('/result');
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 800);
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Find the corresponding answer from quiz data
      const prevAnswer = answers[currentQuestion - 1];
      if (prevAnswer) {
        const questionAnswers = quizQuestions[currentQuestion - 1].answers;
        const matchingAnswer = questionAnswers.find(a => 
          a.economic === prevAnswer.economic && a.social === prevAnswer.social
        );
        setSelectedAnswer(matchingAnswer || null);
      }
    } else {
      navigate('/');
    }
  };

  const goNext = () => {
    if (selectedAnswer && !isLastQuestion) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = { economic: selectedAnswer.economic, social: selectedAnswer.social };
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
            Political Compass Quiz
          </h1>
          <ProgressBar current={currentQuestion + 1} total={quizQuestions.length} />
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
            {currentQuestion === 0 ? 'Home' : 'Previous'}
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
          {currentQuestion + 1} / {quizQuestions.length}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;