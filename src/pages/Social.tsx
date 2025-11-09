import { SocialFeed } from "@/components/social/SocialFeed";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Social = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Feed Sociale</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
        
        <SocialFeed />
      </div>
    </div>
  );
};

export default Social;
