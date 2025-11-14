import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChatList } from "@/components/chat/ChatList";
import { ChatConversation } from "@/components/chat/ChatConversation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

const Messages = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && currentUserId) {
      loadSelectedUser(userId);
    }
  }, [searchParams, currentUserId]);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUserId(user.id);
    } catch (error) {
      console.error('Error loading user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedUser = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (profile) {
        setSelectedUserId(userId);
        setSelectedUserName(profile.full_name);
        setSelectedUserAvatar(profile.avatar_url);
      }
    } catch (error) {
      console.error('Error loading selected user:', error);
    }
  };

  const handleChatSelect = (userId: string, userName: string, userAvatar?: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserAvatar(userAvatar);
  };

  const handleBack = () => {
    setSelectedUserId(null);
    setSelectedUserName("");
    setSelectedUserAvatar(undefined);
  };

  if (loading || !currentUserId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (isMobile) {
    // Mobile: Full screen chat list or conversation
    return (
      <div className="h-screen">
        {selectedUserId ? (
          <ChatConversation
            currentUserId={currentUserId}
            otherUserId={selectedUserId}
            otherUserName={selectedUserName}
            otherUserAvatar={selectedUserAvatar}
            onBack={handleBack}
          />
        ) : (
          <ChatList
            currentUserId={currentUserId}
            onChatSelect={handleChatSelect}
          />
        )}
      </div>
    );
  }

  // Desktop: Two-column layout
  return (
    <div className="h-screen flex">
      <div className="w-1/3 border-r border-border">
        <ChatList
          currentUserId={currentUserId}
          onChatSelect={handleChatSelect}
          selectedUserId={selectedUserId || undefined}
        />
      </div>
      <div className="flex-1">
        {selectedUserId ? (
          <ChatConversation
            currentUserId={currentUserId}
            otherUserId={selectedUserId}
            otherUserName={selectedUserName}
            otherUserAvatar={selectedUserAvatar}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Seleziona una conversazione per iniziare
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
