import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AISuggestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  context?: string;
  onSelectMessage: (message: string) => void;
}

export const AISuggestDialog = ({
  open,
  onOpenChange,
  candidateName,
  context,
  onSelectMessage,
}: AISuggestDialogProps) => {
  const [tone, setTone] = useState<string>("professional");
  const [suggestedMessage, setSuggestedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateMessage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-message-suggest', {
        body: { candidateName, tone, context }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuggestedMessage(data.message);
      toast.success("Messaggio generato! ✨");
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error("Errore nella generazione del messaggio");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedMessage);
    setCopied(true);
    toast.success("Messaggio copiato!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseMessage = () => {
    onSelectMessage(suggestedMessage);
    onOpenChange(false);
    toast.success("Messaggio inserito nella chat");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Suggerimento AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tono del messaggio</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">🎯 Professionale</SelectItem>
                <SelectItem value="empathetic">❤️ Empatico</SelectItem>
                <SelectItem value="direct">⚡ Diretto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!suggestedMessage && (
            <Button
              onClick={generateMessage}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Generazione..." : "Genera messaggio AI"}
            </Button>
          )}

          {suggestedMessage && (
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  value={suggestedMessage}
                  onChange={(e) => setSuggestedMessage(e.target.value)}
                  className="min-h-[150px] pr-10"
                  placeholder="Il messaggio apparirà qui..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="absolute top-2 right-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSuggestedMessage("");
                    generateMessage();
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  Rigenera
                </Button>
                <Button onClick={handleUseMessage} className="flex-1">
                  Usa messaggio
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
