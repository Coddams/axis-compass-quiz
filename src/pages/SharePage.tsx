import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Twitter, 
  MessageCircle, 
  Instagram, 
  Download, 
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import CompassVisualization from "@/components/CompassVisualization";
import { QuizResult } from "@/data/quizData";

const SharePage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const resultJson = sessionStorage.getItem('quizResult');
    if (!resultJson) {
      navigate('/result');
      return;
    }

    try {
      const parsedResult = JSON.parse(resultJson);
      setResult(parsedResult);
    } catch (error) {
      console.error('Error parsing result:', error);
      navigate('/result');
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  const getQuadrantName = (economic: number, social: number) => {
    if (economic < 0 && social > 0) return "Libertarian Left";
    if (economic > 0 && social > 0) return "Libertarian Right";
    if (economic < 0 && social < 0) return "Authoritarian Left";
    if (economic > 0 && social < 0) return "Authoritarian Right";
    return "Centrist";
  };

  const quadrant = getQuadrantName(result.economic, result.social);
  const topMatch = result.topMatches[0];

  const shareText = `I found my place on Axis! I'm ${quadrant} and ${Math.round(topMatch.similarity)}% similar to ${topMatch.figure.name}. See where you land →`;
  const shareUrl = window.location.origin;

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleInstagramShare = () => {
    toast({
      title: "Instagram Sharing",
      description: "Copy the link and share it in your Instagram bio or story!",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Share this text anywhere you'd like.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PNG
    toast({
      title: "Download feature coming soon!",
      description: "We're working on downloadable result cards.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/result')}
            className="bg-secondary border-border hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Share Your Compass
          </h1>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Preview Card */}
        <div className="result-card max-w-2xl mx-auto">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                My Political Compass Result
              </h2>
              <p className="text-muted-foreground">
                I align with the <span className="text-primary font-semibold">{quadrant}</span> quadrant
              </p>
            </div>

            {/* Mini Compass */}
            <div className="scale-75 mx-auto">
              <CompassVisualization
                economic={result.economic}
                social={result.social}
                foreign={result.foreign}
                animated={false}
              />
            </div>

            {/* Top Match */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {topMatch.figure.name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-semibold">{Math.round(topMatch.similarity)}% match with</div>
                  <div className="text-primary font-bold">{topMatch.figure.name}</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Discover your political identity at <span className="text-primary font-medium">axis.app</span>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center text-foreground">
            Share with the world
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Button
              onClick={handleTwitterShare}
              className="btn-share-twitter flex items-center justify-center space-x-2"
            >
              <Twitter className="w-5 h-5" />
              <span>Twitter</span>
            </Button>

            <Button
              onClick={handleWhatsAppShare}
              className="btn-share-whatsapp flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </Button>

            <Button
              onClick={handleInstagramShare}
              className="btn-share-instagram flex items-center justify-center space-x-2"
            >
              <Instagram className="w-5 h-5" />
              <span>Instagram</span>
            </Button>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-secondary border-border hover:bg-accent flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </Button>
          </div>

          {/* Copy Link */}
          <div className="text-center">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="bg-secondary border-border hover:bg-accent min-w-48"
            >
              {copied ? (
                <Check className="w-5 h-5 mr-2 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Invite Text */}
        <div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto">
          <h4 className="font-semibold mb-2 text-center">Share this message:</h4>
          <div className="bg-muted rounded p-4 text-sm font-mono text-center">
            "{shareText} {shareUrl}"
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;