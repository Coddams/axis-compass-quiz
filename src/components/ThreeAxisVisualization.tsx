import { useEffect, useState } from "react";

interface ThreeAxisVisualizationProps {
  economic: number; // -2 to 2
  social: number;   // -2 to 2
  foreign: number;  // -2 to 2
  animated?: boolean;
}

const ThreeAxisVisualization = ({
  economic,
  social,
  foreign,
  animated = true,
}: ThreeAxisVisualizationProps) => {
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

  // Convert coordinates (-2 to 2 → 0% to 100%)
  const econPercent = ((animatedEconomic + 2) / 4) * 100;
  const socialPercent = ((animatedSocial + 2) / 4) * 100;
  const foreignPercent = ((animatedForeign + 2) / 4) * 100;

  // Get axis labels
  const getEconomicLabel = (value: number) => {
    if (value < -1.5) return "Socialist";
    if (value > 1.5) return "Capitalist";
    return "Mixed";
  };

  const getSocialLabel = (value: number) => {
    if (value < -1.5) return "Authoritarian";
    if (value > 1.5) return "Libertarian";
    return "Moderate";
  };

  const getForeignLabel = (value: number) => {
    if (value < -1.5) return "Isolationist";
    if (value > 1.5) return "Interventionist";
    return "Balanced";
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Main Compass (Economic vs Social) */}
      <div className="relative w-80 h-80 mx-auto">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-primary/30 rounded-full border-2 border-primary/20"></div>
        
        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
          <g stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3">
            {/* Vertical and horizontal lines */}
            <line x1="160" y1="20" x2="160" y2="300" />
            <line x1="20" y1="160" x2="300" y2="160" />
            {/* Quarter lines */}
            <line x1="80" y1="20" x2="80" y2="300" />
            <line x1="240" y1="20" x2="240" y2="300" />
            <line x1="20" y1="80" x2="300" y2="80" />
            <line x1="20" y1="240" x2="300" y2="240" />
          </g>
        </svg>

        {/* Axis Labels */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground">
          Authoritarian
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground">
          Libertarian
        </div>
        <div className="absolute top-1/2 -left-20 -translate-y-1/2 -rotate-90 text-sm font-medium text-muted-foreground">
          Socialist
        </div>
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 rotate-90 text-sm font-medium text-muted-foreground">
          Capitalist
        </div>

        {/* Position Indicator */}
        <div
          className="absolute"
          style={{
            left: `${econPercent}%`,
            top: `${100 - socialPercent}%`,
            transform: "translate(-50%, -50%)",
            transition: animated ? "all 1s ease-out" : "none",
          }}
        >
          <div className="relative w-6 h-6 bg-primary rounded-full border-3 border-primary-foreground shadow-glow">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
      </div>

      {/* Three Axis Bars */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-center text-foreground">
          Your Political Profile
        </h3>
        
        {/* Economic Axis */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Economic</span>
            <span className="text-sm font-bold text-primary">{getEconomicLabel(animatedEconomic)}</span>
          </div>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-gradient-to-r from-red-500/20 to-red-500/40"></div>
              <div className="flex-1 bg-gradient-to-r from-blue-500/20 to-blue-500/40"></div>
            </div>
            <div
              className="absolute top-0 h-full w-3 bg-primary rounded-full shadow-md transition-all duration-1000 ease-out"
              style={{
                left: `calc(${econPercent}% - 6px)`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Socialist</span>
            <span>Capitalist</span>
          </div>
        </div>

        {/* Social Axis */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Social</span>
            <span className="text-sm font-bold text-primary">{getSocialLabel(animatedSocial)}</span>
          </div>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-gradient-to-r from-purple-500/20 to-purple-500/40"></div>
              <div className="flex-1 bg-gradient-to-r from-green-500/20 to-green-500/40"></div>
            </div>
            <div
              className="absolute top-0 h-full w-3 bg-primary rounded-full shadow-md transition-all duration-1000 ease-out"
              style={{
                left: `calc(${socialPercent}% - 6px)`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Authoritarian</span>
            <span>Libertarian</span>
          </div>
        </div>

        {/* Foreign Policy Axis */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Foreign Policy</span>
            <span className="text-sm font-bold text-primary">{getForeignLabel(animatedForeign)}</span>
          </div>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-gradient-to-r from-orange-500/20 to-orange-500/40"></div>
              <div className="flex-1 bg-gradient-to-r from-teal-500/20 to-teal-500/40"></div>
            </div>
            <div
              className="absolute top-0 h-full w-3 bg-primary rounded-full shadow-md transition-all duration-1000 ease-out"
              style={{
                left: `calc(${foreignPercent}% - 6px)`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Isolationist</span>
            <span>Interventionist</span>
          </div>
        </div>
      </div>

      {/* Coordinate Display */}
      <div className="text-center">
        <div className="bg-card border border-border rounded-lg px-6 py-4 inline-block">
          <div className="text-sm text-muted-foreground mb-1">Your Position</div>
          <div className="font-semibold text-primary text-lg">
            ({economic.toFixed(1)}, {social.toFixed(1)}, {foreign.toFixed(1)})
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Economic • Social • Foreign
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeAxisVisualization;