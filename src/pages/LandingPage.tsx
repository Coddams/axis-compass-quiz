import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import TreesCard from "@/components/TreesCard"; 


const LandingPage = () => {
  const navigate = useNavigate();
  const { userName, setUserName } = useUser();
  const [inputName, setInputName] = useState(userName);

  const handleStartQuiz = () => {
    const trimmedName = inputName.trim();
    if (trimmedName) {
      setUserName(trimmedName);
      navigate("/quiz");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/lovable-uploads/darkbrown.png')` }}    >
      {/* Dark overlay */}
      {/* <div className="absolute inset-0 bg-black/70"></div> */}
      
      {/* Content */}
      <div className="max-w-4xl mx-auto text-center space-y-8 page-enter page-enter-active relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center space-x-3 mb-8">         
          <img className="w-96 text-primary" 
            src="/lovable-uploads/20250909_1139_White Logo Transformation_remix_01k4q0shxzeq9aqzkxhnhw0mp3.png"
            alt="White Logo Transformation"
          />
           <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent">
            Axis
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
           🧭 Chart your course. Discover where you stand.        
        </p>

        {/* Main Description */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            Uncover Your Political Identity
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            This here is the start of an adventure in mapping your beliefs.
            Answer bold questions and explore surprising perspectives. See how your worldview lands on the compass of ideas.
            It’s less about left or right and more about finding your unique place in the bigger story of politics.
          </p>
        </div>

        {/* Features (replaced with TreesCard) */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-12">
          <TreesCard
            title="Political Interactive Compass"
            description="Visualize your position on a dynamic 2D political compass"
            backgroundImage={"/lovable-uploads/compass.jpg"}
          />
          <TreesCard
            title="Historical Figure Matches"
            description="Compare your views with influential political figures"
            backgroundImage={"/lovable-uploads/mlkPublic.png"}
          />
        </div>

        {/* Name Input */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter your name"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputName.trim()) {
                  handleStartQuiz();
                }
              }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button 
            onClick={handleStartQuiz}
            disabled={!inputName.trim()}
            className="btn-hero group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start the Quiz
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-muted-foreground mt-12">
          Takes about 3-5 minutes • Anonymous & Privacy-Focused
        </p>
      </div>
    </div>
  );
};

export default LandingPage;