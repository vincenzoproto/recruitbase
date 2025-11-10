import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MatchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateAvatar?: string;
  onOpenChat: () => void;
}

export const MatchPopup = ({ 
  open, 
  onOpenChange, 
  candidateName, 
  candidateAvatar,
  onOpenChat 
}: MatchPopupProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6 py-4">
          <div className="relative">
            <div className="absolute inset-0 animate-glow rounded-full" />
            <Avatar className="h-24 w-24 mx-auto border-4 border-success relative z-10">
              <AvatarImage src={candidateAvatar} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-success to-success/70 text-white">
                {candidateName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 z-20">
              <Sparkles className="h-8 w-8 text-success animate-bounce-soft" />
            </div>
          </div>
          
          <div>
            <DialogTitle className="text-2xl font-bold mb-2">
              Match Confermato! 🎉
            </DialogTitle>
            <p className="text-muted-foreground">
              Tu e <span className="font-semibold text-foreground">{candidateName}</span> vi siete piaciuti
            </p>
          </div>

          <div className="bg-success/10 rounded-xl p-4 border border-success/20">
            <p className="text-sm text-foreground">
              Inizia subito una conversazione e scopri come potete collaborare insieme!
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => onOpenChange(false)}
            >
              Dopo
            </Button>
            <Button 
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80" 
              onClick={onOpenChat}
            >
              <MessageCircle className="h-4 w-4" />
              Apri Chat AI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
