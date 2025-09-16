import { useEffect, useState } from "react";

interface CompassVisualizationProps {
  economic: number; // -2 to 2
  social: number;   // -2 to 2
  foreign: number;  // -2 to 2 (new axis)
  animated?: boolean;
}

const CompassVisualization = ({
  economic,
  social,
  foreign,
  animated = true,
}: CompassVisualizationProps) => {
  const [animatedEconomic, setAnimatedEconomic] = useState(0);
  const [animatedSocial, setAnimatedSocial] = useState(0);
  const [animatedForeign, setAnimatedForeign] = useState(0);

  useEffect(() => {
    if (animated) {
      const timeout = setTimeout(() => {
        setAnimatedEconomic(economic);
        setAnimatedSocial(social);
        setAnimatedForeign(foreign);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setAnimatedEconomic(economic);
      setAnimatedSocial(social);
      setAnimatedForeign(foreign);
    }
  }, [economic, social, foreign, animated]);

  // Convert coordinates to compass position (-2 to 2 → 0% to 100%)
  const xPercent = ((animatedEconomic + 2) / 4) * 100;
  const yPercent = ((-animatedSocial + 2) / 4) * 100; // Invert Y
  const radius = ((animatedForeign + 2) / 4) * 40 + 10; 
  // → makes foreign policy show as a halo size (10px – 50px)

  return (
    <div className="compass-container mx-auto relative">
      {/* Quadrant Labels */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground">
        Authoritarian
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground">
        Libertarian
      </div>
      <div className="absolute top-1/2 -left-16 -translate-y-1/2 -rotate-90 text-sm font-medium text-muted-foreground">
        Left
      </div>
      <div className="absolute top-1/2 -right-16 -translate-y-1/2 rotate-90 text-sm font-medium text-muted-foreground">
        Right
      </div>

      {/* Compass Background */}
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 320 320">
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              style={{ stopColor: "hsl(var(--navy-dark))", stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "hsl(var(--navy-deep))", stopOpacity: 0.8 }}
            />
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

      {/* Position Indicator + Foreign Policy Halo */}
      <div
        className="absolute"
        style={{
          left: `${xPercent}%`,
          top: `${yPercent}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Foreign policy halo */}
        <div
          className="absolute rounded-full border-2 border-primary/40 bg-primary/10"
          style={{
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            left: `-${radius}px`,
            top: `-${radius}px`,
          }}
        ></div>

        {/* Main dot */}
        <div className="relative w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground shadow-glow">
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
        </div>
      </div>

      {/* Coordinate Display */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
        <div className="bg-card border border-border rounded-lg px-4 py-2">
          <div className="text-sm text-muted-foreground">Your Position</div>
          <div className="font-semibold text-primary">
            ({economic.toFixed(1)}, {social.toFixed(1)}, {foreign.toFixed(1)})
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompassVisualization;
