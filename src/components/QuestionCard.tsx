import { useState } from "react";
import { CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";

// Canonical answer shape
interface Answer {
  id: string;
  text: string;
  vector: [number, number, number]; // econ, social, foreign
  implications?: { pros?: string[]; cons?: string[] };
}

interface QuestionCardProps {
  question: string;
  answers: Answer[];
  onAnswer: (answer: Answer) => void;
  selectedAnswer?: Answer | null;
}

const QuestionCard = ({ question, answers, onAnswer, selectedAnswer }: QuestionCardProps) => {
  const [previewedAnswer, setPreviewedAnswer] = useState<Answer | null>(null);

  const handleAnswerClick = (answer: Answer) => {
    // If this answer is already previewed, confirm it
    if (previewedAnswer?.id === answer.id) {
      onAnswer(answer);
    } else {
      // First click - show preview
      setPreviewedAnswer(answer);
    }
  };

  return (
    <div className="result-card max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
          {question}
        </h2>
      </div>

      <div className="space-y-3">
        {answers.map((answer) => {
          const isSelected = selectedAnswer?.id === answer.id;
          const isPreviewed = previewedAnswer?.id === answer.id;
          const hasImplications = answer.implications && (answer.implications.pros || answer.implications.cons);

          return (
            <div key={answer.id} className="space-y-2">
              <button
                onClick={() => handleAnswerClick(answer)}
                className={`
                  btn-answer w-full relative
                  ${isSelected ? "selected" : ""}
                  ${isPreviewed && !isSelected ? "bg-accent border-primary border-2" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1 text-left">{answer.text}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground ml-3 animate-scale-in" />
                  )}
                  {isPreviewed && !isSelected && (
                    <span className="text-xs text-muted-foreground ml-3">Click again to confirm</span>
                  )}
                </div>
              </button>

              {/* Show pros/cons when previewed */}
              {isPreviewed && hasImplications && (
                <div className="ml-4 p-4 bg-card border border-border rounded-lg space-y-3 animate-in fade-in-0 slide-in-from-top-2">
                  {answer.implications?.pros && answer.implications.pros.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-green-500 font-semibold text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Pros</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
                        {answer.implications.pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {answer.implications?.cons && answer.implications.cons.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-red-500 font-semibold text-sm">
                        <ThumbsDown className="w-4 h-4" />
                        <span>Cons</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
                        {answer.implications.cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
