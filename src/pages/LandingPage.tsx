import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(/lovable-uploads/fe294dfa-bc92-487e-80b6-f2a8927d8703.png)` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="max-w-4xl mx-auto text-center space-y-8 page-enter page-enter-active relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Compass className="w-12 h-12 text-primary" />
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Axis
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Find your place on the political compass
        </p>

        {/* Main Description */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            Discover Your Political Identity
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Navigate through thought-provoking questions to map your political views 
            across economic and social dimensions. See how your beliefs align with 
            historical and contemporary political figures.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
          <div className="result-card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Interactive Compass</h3>
            <p className="text-muted-foreground text-sm">
              Visualize your position on a dynamic 2D political compass
            </p>
          </div>
          
          <div className="result-card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Historical Matches</h3>
            <p className="text-muted-foreground text-sm">
              Compare your views with influential political figures
            </p>
          </div>
          
          <div className="result-card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Share Results</h3>
            <p className="text-muted-foreground text-sm">
              Share your political compass with friends and family
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Button 
            onClick={() => navigate("/quiz")}
            className="btn-hero group"
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