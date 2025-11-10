import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface JobApplicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobOfferId: string;
  jobTitle: string;
  onOpenChat: (userId: string, userName: string) => void;
  onOpenCandidateDetail: (candidateId: string) => void;
}

export const JobApplicationsDialog = ({
  open,
  onOpenChange,
  jobOfferId,
  jobTitle,
  onOpenChat,
  onOpenCandidateDetail,
}: JobApplicationsDialogProps) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadApplications();
    }
  }, [open, jobOfferId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          candidate:profiles!applications_candidate_id_fkey(
            id,
            full_name,
            avatar_url,
            job_title,
            city,
            bio,
            skills
          )
        `)
        .eq("job_offer_id", jobOfferId)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Errore nel caricamento delle candidature");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Candidature per: {jobTitle}</DialogTitle>
          <DialogDescription>
            {applications.length} candidature ricevute
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna candidatura ricevuta per questa offerta.
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={app.candidate?.avatar_url} />
                      <AvatarFallback>{getInitials(app.candidate?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{app.candidate?.full_name}</h3>
                          {app.candidate?.job_title && (
                            <p className="text-sm text-muted-foreground">{app.candidate?.job_title}</p>
                          )}
                          {app.candidate?.city && (
                            <p className="text-xs text-muted-foreground">{app.candidate?.city}</p>
                          )}
                        </div>
                        <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                          {app.status === 'pending' ? 'In attesa' : app.status}
                        </Badge>
                      </div>
                      
                      {app.candidate?.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{app.candidate.bio}</p>
                      )}
                      
                      {app.candidate?.skills && app.candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {app.candidate.skills.slice(0, 5).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onOpenCandidateDetail(app.candidate.id);
                          }}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Vedi Profilo
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onOpenChat(app.candidate.id, app.candidate.full_name);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Contatta
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
