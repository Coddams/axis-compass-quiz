import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { CanonQuestion } from "@/data/quizData";

const AdminPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<CanonQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<CanonQuestion | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: CanonQuestion = {
      id: Date.now().toString(),
      text: "",
      answers: [
        { id: "1", text: "", vector: [0, 0, 0] },
        { id: "2", text: "", vector: [0, 0, 0] },
        { id: "3", text: "", vector: [0, 0, 0] },
        { id: "4", text: "", vector: [0, 0, 0] }
      ]
    };
    setEditingQuestion(newQuestion);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    const updatedQuestions = questions.some(q => q.id === editingQuestion.id)
      ? questions.map(q => q.id === editingQuestion.id ? editingQuestion : q)
      : [...questions, editingQuestion];

    setQuestions(updatedQuestions);
    setEditingQuestion(null);
    
    toast({
      title: "Question saved",
      description: "Your question has been saved successfully."
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast({
      title: "Question deleted",
      description: "The question has been removed."
    });
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'axis-quiz-questions.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export successful",
      description: "Questions exported to JSON file."
    });
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedQuestions = JSON.parse(e.target?.result as string);
        setQuestions(importedQuestions);
        toast({
          title: "Import successful",
          description: "Questions imported from JSON file."
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid JSON file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-secondary border-border hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Quiz Admin Panel
          </h1>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleExportJson}
              variant="outline"
              className="bg-secondary border-border hover:bg-accent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
              <Button
                variant="outline"
                className="bg-secondary border-border hover:bg-accent"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Add Question Button */}
        <div className="text-center">
          <Button onClick={handleAddQuestion} className="btn-hero">
            <Plus className="w-5 h-5 mr-2" />
            Add New Question
          </Button>
        </div>

        {/* Questions List */}
        <div className="grid gap-6">
          {questions.map((question) => (
            <div key={question.id} className="result-card">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Question {question.id}
                </h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setEditingQuestion(question)}
                    variant="outline"
                    size="sm"
                    className="bg-secondary border-border hover:bg-accent"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteQuestion(question.id)}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{question.text}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {question.answers.map((answer, idx) => (
                  <div key={idx} className="text-sm bg-muted/30 rounded p-2">
                    <div className="font-medium">{answer.text}</div>
                    <div className="text-xs text-muted-foreground">
                      Economic: {answer.vector[0]}, Social: {answer.vector[1]}, Foreign: {answer.vector[2]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Question Editor Modal */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">
                {questions.some(q => q.id === editingQuestion.id) ? 'Edit' : 'Add'} Question
              </h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="question-text">Question Text</Label>
                  <Textarea
                    id="question-text"
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      text: e.target.value
                    })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Answer Options</Label>
                  <div className="space-y-4 mt-2">
                    {editingQuestion.answers.map((answer, idx) => (
                      <div key={idx} className="bg-muted/30 rounded-lg p-4 space-y-3">
                        <div>
                          <Label htmlFor={`answer-${idx}`}>Answer {idx + 1}</Label>
                          <Input
                            id={`answer-${idx}`}
                            value={answer.text}
                            onChange={(e) => {
                              const newAnswers = [...editingQuestion.answers];
                              newAnswers[idx] = { ...answer, text: e.target.value };
                              setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                            }}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`economic-${idx}`}>Economic (-2 to 2)</Label>
                            <Input
                              id={`economic-${idx}`}
                              type="number"
                              min="-2"
                              max="2"
                              value={answer.vector[0]}
                              onChange={(e) => {
                                const newAnswers = [...editingQuestion.answers];
                                const newVector: [number, number, number] = [...answer.vector];
                                newVector[0] = parseInt(e.target.value) || 0;
                                newAnswers[idx] = { ...answer, vector: newVector };
                                setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                              }}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`social-${idx}`}>Social (-2 to 2)</Label>
                            <Input
                              id={`social-${idx}`}
                              type="number"
                              min="-2"
                              max="2"
                              value={answer.vector[1]}
                              onChange={(e) => {
                                const newAnswers = [...editingQuestion.answers];
                                const newVector: [number, number, number] = [...answer.vector];
                                newVector[1] = parseInt(e.target.value) || 0;
                                newAnswers[idx] = { ...answer, vector: newVector };
                                setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                              }}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`foreign-${idx}`}>Foreign (-2 to 2)</Label>
                            <Input
                              id={`foreign-${idx}`}
                              type="number"
                              min="-2"
                              max="2"
                              value={answer.vector[2]}
                              onChange={(e) => {
                                const newAnswers = [...editingQuestion.answers];
                                const newVector: [number, number, number] = [...answer.vector];
                                newVector[2] = parseInt(e.target.value) || 0;
                                newAnswers[idx] = { ...answer, vector: newVector };
                                setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                              }}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setEditingQuestion(null)}
                    className="bg-secondary border-border hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveQuestion} className="bg-primary hover:bg-primary/90">
                    Save Question
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && !editingQuestion && (
          <div className="text-center space-y-4 py-12">
            <div className="text-muted-foreground text-lg">No questions created yet</div>
            <p className="text-sm text-muted-foreground">
              Start by adding your first question or importing an existing JSON file
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;