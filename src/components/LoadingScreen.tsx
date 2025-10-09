import { useEffect, useState } from "react";

const welcomeTexts = [
  "Welcome to your political journey...",
  "Preparing your compass...",
  "Loading perspectives...",
  "Ready to discover where you stand?",
];

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    // Cycle through texts every 3 seconds
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % welcomeTexts.length);
    }, 3000);

    // Complete loading after 30 seconds
    const loadingTimeout = setTimeout(() => {
      onComplete();
    }, 30000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(loadingTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Large Loader */}
      <div className="loader-container mb-12">
        <div className="loader"></div>
      </div>

      {/* Fading Text */}
      <div className="text-center space-y-4 px-4">
        {welcomeTexts.map((text, index) => (
          <p
            key={index}
            className={`text-2xl md:text-3xl font-light text-foreground transition-opacity duration-1000 absolute left-1/2 -translate-x-1/2 whitespace-nowrap ${
              index === currentTextIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {text}
          </p>
        ))}
      </div>

      <style>{`
        .loader-container {
          width: 240px;
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader {
          transform: rotateZ(45deg);
          perspective: 1000px;
          border-radius: 50%;
          width: 192px;
          height: 192px;
          color: hsl(var(--primary));
        }

        .loader:before,
        .loader:after {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: inherit;
          height: inherit;
          border-radius: 50%;
          transform: rotateX(70deg);
          animation: 1s spin linear infinite;
        }

        .loader:after {
          color: hsl(var(--accent));
          transform: rotateY(70deg);
          animation-delay: .4s;
        }

        @keyframes spin {
          0%,
          100% {
            box-shadow: .2em 0px 0 0px currentcolor;
          }
          12% {
            box-shadow: .2em .2em 0 0 currentcolor;
          }
          25% {
            box-shadow: 0 .2em 0 0px currentcolor;
          }
          37% {
            box-shadow: -.2em .2em 0 0 currentcolor;
          }
          50% {
            box-shadow: -.2em 0 0 0 currentcolor;
          }
          62% {
            box-shadow: -.2em -.2em 0 0 currentcolor;
          }
          75% {
            box-shadow: 0px -.2em 0 0 currentcolor;
          }
          87% {
            box-shadow: .2em -.2em 0 0 currentcolor;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
