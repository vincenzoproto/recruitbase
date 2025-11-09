import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hapticFeedback } from "@/lib/haptics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AcademyContent {
  id: string;
  title: string;
  category: string;
  description: string;
  article_text: string;
  duration_minutes: number;
}

export const AcademySection = () => {
  const [contents, setContents] = useState<AcademyContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<AcademyContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAcademyContent();
  }, []);

  const loadAcademyContent = async () => {
    try {
      const { data } = await supabase
        .from('academy_content')
        .select('*')
        .order('order_position', { ascending: true });

      if (data) {
        setContents(data);
      }
    } catch (error) {
      console.error('Error loading academy content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'best_practice': return 'Best Practice';
      case 'trs_improvement': return 'TRS Improvement';
      case 'candidate_management': return 'Gestione Candidati';
      default: return category;
    }
  };

  const handleOpenContent = async (content: AcademyContent) => {
    await hapticFeedback.light();
    setSelectedContent(content);
  };

  if (loading) return null;

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Recruit Base Academy</h3>
            <p className="text-sm text-muted-foreground">Migliora le tue skill</p>
          </div>
        </div>

        <div className="space-y-3">
          {contents.map((content) => (
            <div
              key={content.id}
              className="p-4 rounded-lg border hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => handleOpenContent(content)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {getCategoryLabel(content.category)}
                    </span>
                  </div>
                  <h4 className="font-medium mb-1 group-hover:text-primary transition-colors">
                    {content.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {content.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{content.duration_minutes} min di lettura</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {selectedContent?.article_text?.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) {
                  return <h1 key={idx} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={idx} className="text-xl font-semibold mt-5 mb-2">{line.slice(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-lg font-medium mt-4 mb-2">{line.slice(4)}</h3>;
                }
                if (line.trim() === '') {
                  return <br key={idx} />;
                }
                return <p key={idx} className="mb-2">{line}</p>;
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
