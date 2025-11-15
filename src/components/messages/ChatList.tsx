import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { ProfileBadge } from "@/components/profile/ProfileBadge";

interface Chat {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get recent messages
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!messages) return;

      // Group by conversation
      const chatMap = new Map<string, Chat>();

      for (const msg of messages) {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!chatMap.has(otherUserId)) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          chatMap.set(otherUserId, {
            id: otherUserId,
            otherUserId,
            otherUserName: profile?.full_name || "Utente",
            otherUserAvatar: profile?.avatar_url || null,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unread: !msg.read && msg.receiver_id === user.id,
          });
        }
      }

      setChats(Array.from(chatMap.values()));
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full md:w-80 border-r border-border p-4">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 border-r border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Messaggi</h2>
      </div>
      
      <div className="divide-y divide-border">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Nessun messaggio
          </div>
        ) : (
          chats.map(chat => (
            <Card
              key={chat.id}
              className="p-4 rounded-none border-0 hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.otherUserAvatar || ""} />
                    <AvatarFallback>{chat.otherUserName[0]}</AvatarFallback>
                  </Avatar>
                  <ProfileBadge userId={chat.otherUserId} size="sm" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate">
                      {chat.otherUserName}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.lastMessageTime), { 
                        addSuffix: true,
                        locale: it 
                      })}
                    </span>
                  </div>
                  
                  <p className={`text-sm truncate ${chat.unread ? 'font-semibold' : 'text-muted-foreground'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
