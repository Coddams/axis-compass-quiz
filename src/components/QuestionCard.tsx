import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

// Canonical answer shape
interface Answer {
  id: string;
  text: string;
  vector: [number, number, number]; // econ, social, foreign
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
    <div className="result-card max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
          {question}
        </h2>
      </div>

      <div className="space-y-3">
        {answers.map((answer, index) => {
          const isSelected = selectedAnswer?.id === answer.id; // ✅ compare by id
          const isHovered = hoveredIndex === index;

          return (
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
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
