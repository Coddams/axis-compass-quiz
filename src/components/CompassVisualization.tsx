import { useEffect, useState } from "react";

interface CompassVisualizationProps {
  economic: number; // -5 to 5
  social: number;   // -5 to 5
  animated?: boolean;
}

const CompassVisualization = ({ economic, social, animated = true }: CompassVisualizationProps) => {
  const [animatedEconomic, setAnimatedEconomic] = useState(0);
  const [animatedSocial, setAnimatedSocial] = useState(0);

  useEffect(() => {
    if (animated) {
      // Animate to final position
      const timeout = setTimeout(() => {
        setAnimatedEconomic(economic);
        setAnimatedSocial(social);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setAnimatedEconomic(economic);
      setAnimatedSocial(social);
    }
  }, [economic, social, animated]);

  // Convert coordinates to compass position (-5 to 5 → 0% to 100%)
  const xPercent = ((animatedEconomic + 5) / 10) * 100;
  const yPercent = ((-animatedSocial + 5) / 10) * 100; // Invert Y axis

  return (
    <div className="compass-container mx-auto">
      {/* Quadrant Labels */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-muted-foreground">
        Authoritarian
      </div>
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-muted-foreground">
        Libertarian
      </div>
      <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-muted-foreground">
        Left
      </div>
      <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 rotate-90 text-sm font-medium text-muted-foreground">
        Right
      </div>

      {/* Compass Background */}
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 320 320">
        {/* Quadrant Colors */}
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--navy-dark))', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--navy-deep))', stopOpacity: 0.8 }} />
          </radialGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx="160" cy="160" r="150" fill="url(#centerGradient)" />
        
        {/* Grid Lines */}
        <g stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3">
          {/* Vertical lines */}
          <line x1="80" y1="10" x2="80" y2="310" />
          <line x1="160" y1="10" x2="160" y2="310" />
          <line x1="240" y1="10" x2="240" y2="310" />
          
          {/* Horizontal lines */}
          <line x1="10" y1="80" x2="310" y2="80" />
          <line x1="10" y1="160" x2="310" y2="160" />
          <line x1="10" y1="240" x2="310" y2="240" />
        </g>

        {/* Center crosshairs */}
        <g stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6">
          <line x1="160" y1="10" x2="160" y2="310" />
          <line x1="10" y1="160" x2="310" y2="160" />
        </g>
      </svg>

      {/* Position Indicator */}
      <div
        className="absolute w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground shadow-glow transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10"
        style={{
          left: `${xPercent}%`,
          top: `${yPercent}%`,
        }}
      >
        {/* Pulsing animation */}
        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
      </div>

      {/* Coordinate Display */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-card border border-border rounded-lg px-4 py-2">
          <div className="text-sm text-muted-foreground">Your Position</div>
          <div className="font-semibold text-primary">
            ({economic.toFixed(1)}, {social.toFixed(1)})
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompassVisualization;