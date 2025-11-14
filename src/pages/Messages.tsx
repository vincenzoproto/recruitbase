import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
      subscribeToMessages();
    }
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadConversations = async () => {
    // Get all unique conversations
    const { data: sentMessages } = await supabase
      .from("messages")
      .select("receiver_id, created_at")
      .eq("sender_id", currentUserId)
      .order("created_at", { ascending: false });

    const { data: receivedMessages } = await supabase
      .from("messages")
      .select("sender_id, created_at")
      .eq("receiver_id", currentUserId)
      .order("created_at", { ascending: false });

    const userIds = new Set<string>();
    sentMessages?.forEach(m => userIds.add(m.receiver_id));
    receivedMessages?.forEach(m => userIds.add(m.sender_id));

    // Load profiles for all users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", Array.from(userIds));

    // Get unread count and last message for each conversation
    const conversationsData = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${currentUserId})`)
          .order("created_at", { ascending: false })
          .limit(1);

        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("sender_id", profile.id)
          .eq("receiver_id", currentUserId)
          .eq("read", false);

        return {
          user: profile,
          lastMessage: messages?.[0],
          unreadCount: unreadCount || 0,
        };
      })
    );

    setConversations(conversationsData.sort((a, b) => {
      const aTime = new Date(a.lastMessage?.created_at || 0).getTime();
      const bTime = new Date(b.lastMessage?.created_at || 0).getTime();
      return bTime - aTime;
    }));
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-list-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `or(sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId})`,
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto p-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nessuna conversazione</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card 
                key={conv.user.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/messages/${conv.user.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.user.avatar_url} />
                      <AvatarFallback>{getInitials(conv.user.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">{conv.user.full_name}</h3>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(conv.lastMessage.created_at), {
                              addSuffix: true,
                              locale: it,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.content || "Nessun messaggio"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Messages;
