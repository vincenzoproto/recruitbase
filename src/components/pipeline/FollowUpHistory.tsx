import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, Send, AlertCircle, XCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScheduledMessage {
  id: string;
  candidate_id: string;
  message_content: string;
  scheduled_at: string;
  sent_at: string | null;
  status: string;
  error_message: string | null;
  candidate: {
    full_name: string;
    avatar_url: string;
    job_title: string;
  };
  template: {
    name: string;
  } | null;
}

export const FollowUpHistory = ({ recruiterId }: { recruiterId: string }) => {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [recruiterId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select(`
          id,
          candidate_id,
          message_content,
          scheduled_at,
          sent_at,
          status,
          error_message,
          candidate:profiles!scheduled_messages_candidate_id_fkey(
            full_name,
            avatar_url,
            job_title
          ),
          template:follow_up_templates(name)
        `)
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data as any || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, sentAt: string | null) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle2 className="h-3 w-3" />
            Inviato
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Programmato
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Fallito
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Storico Follow-up
        </CardTitle>
        <CardDescription>
          Visualizza tutti i follow-up programmati e inviati
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nessun follow-up programmato</p>
            <p className="text-sm mt-1">Inizia a programmare follow-up automatici dalla sezione sopra</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={message.candidate.avatar_url} 
                        alt={message.candidate.full_name} 
                      />
                      <AvatarFallback>
                        {message.candidate.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium">{message.candidate.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {message.candidate.job_title || 'N/D'}
                          </p>
                        </div>
                        {getStatusBadge(message.status, message.sent_at)}
                      </div>

                      {message.template && (
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {message.template.name}
                          </Badge>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {message.message_content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {message.status === 'pending' ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Programmato per: {new Date(message.scheduled_at).toLocaleString('it-IT')}
                          </span>
                        ) : message.sent_at ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Inviato {formatDistanceToNow(new Date(message.sent_at), { 
                              addSuffix: true, 
                              locale: it 
                            })}
                          </span>
                        ) : null}
                      </div>

                      {message.error_message && (
                        <div className="mt-2 text-xs text-destructive flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5" />
                          <span>{message.error_message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
