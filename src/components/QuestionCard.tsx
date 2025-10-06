import { useState } from "react";
import { CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="result-card max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            {question}
          </h2>
        </div>

        <div className="space-y-3">
          {answers.map((answer, index) => {
            const isSelected = selectedAnswer?.id === answer.id;
            const isHovered = hoveredIndex === index;
            const hasImplications = answer.implications && (answer.implications.pros || answer.implications.cons);

            const answerButton = (
              <button
                key={answer.id}
                onClick={() => onAnswer(answer)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  btn-answer w-full relative
                  ${isSelected ? "selected" : ""}
                  ${isHovered && !isSelected ? "bg-accent/50" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1 text-left">{answer.text}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground ml-3 animate-scale-in" />
                  )}
                </div>
              </button>
            );

            // Wrap with tooltip if implications exist
            if (hasImplications) {
              return (
                <Tooltip key={answer.id}>
                  <TooltipTrigger asChild>
                    {answerButton}
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="max-w-sm p-4 bg-popover border-border"
                    sideOffset={10}
                  >
                    <div className="space-y-3">
                      {answer.implications?.pros && answer.implications.pros.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-green-500 font-semibold text-sm">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Pros</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-xs text-popover-foreground">
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
                          <ul className="list-disc list-inside space-y-0.5 text-xs text-popover-foreground">
                            {answer.implications.cons.map((con, i) => (
                              <li key={i}>{con}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return answerButton;
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QuestionCard;
