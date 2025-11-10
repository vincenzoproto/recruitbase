import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, X, Smile, Image, Mic, Phone, Check, CheckCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISuggestDialog } from "./AISuggestDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pushNotifications } from "@/lib/push-notifications";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  message_type?: string;
  media_url?: string;
}

interface ChatDialogProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ChatDialog = ({
  currentUserId,
  otherUserId,
  otherUserName,
  triggerButton,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "💯", "✨", "👏", "💪", "🙏", "😍"];

  useEffect(() => {
    if (open) {
      loadMessages();
      markMessagesAsRead();

      // Real-time subscription with unique channel per conversation
      const channelName = `chat-${[currentUserId, otherUserId].sort().join('-')}`;
      console.log('Subscribing to channel:', channelName);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${otherUserId},receiver_id=eq.${currentUserId}`,
          },
          async (payload) => {
            console.log('New message received:', payload);
            const message = payload.new as Message;
            setMessages(prev => [...prev, message]);
            markMessagesAsRead();
            
            // Show toast notification
            toast.success(`Nuovo messaggio da ${otherUserName}`, {
              description: message.content,
            });

            // Show push notification if dialog is not focused
            if (pushNotifications.isSupported() && document.hidden) {
              await pushNotifications.showNotification(
                `Nuovo messaggio da ${otherUserName}`,
                {
                  body: message.content,
                  tag: 'chat-message',
                  requireInteraction: false,
                }
              );
            }

            // Create in-app notification with sender ID in link
            await supabase.from('notifications').insert({
              user_id: currentUserId,
              type: 'message',
              title: `Nuovo messaggio da ${otherUserName}`,
              message: message.content,
              link: otherUserId,
              read: false,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${currentUserId},receiver_id=eq.${otherUserId}`,
          },
          (payload) => {
            console.log('Message sent confirmed:', payload);
            const message = payload.new as Message;
            // Only add if not already in the list (prevent duplicates)
            setMessages(prev => {
              if (prev.find(m => m.id === message.id)) return prev;
              return [...prev, message];
            });
          }
        )
        .subscribe((status) => {
          console.log('Channel subscription status:', status);
        });

      return () => {
        console.log('Unsubscribing from channel:', channelName);
        supabase.removeChannel(channel);
      };
    }
  }, [open, currentUserId, otherUserId, otherUserName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (data) {
      setMessages(data);
    }
  };

  const markMessagesAsRead = async () => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', otherUserId)
      .eq('read', false);
  };

  const sendMessage = async (messageType = 'text', content?: string, mediaUrl?: string) => {
    const messageContent = content || newMessage.trim();
    if (!messageContent && !mediaUrl) return;

    setNewMessage("");

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: messageContent,
        message_type: messageType,
        media_url: mediaUrl,
      })
      .select()
      .single();

    if (error) {
      toast.error("Errore nell'invio del messaggio");
      console.error('Error sending message:', error);
      if (!mediaUrl) setNewMessage(messageContent);
      return;
    }

    console.log('Message sent successfully:', data);
    toast.success("💬 Messaggio inviato");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File troppo grande (max 10MB)");
      return;
    }

    // Determine file type
    let messageType = 'file';
    let displayMessage = file.name;
    
    if (file.type.startsWith('image/')) {
      messageType = 'image';
      displayMessage = 'Immagine';
    } else if (file.type === 'application/pdf') {
      messageType = 'document';
      displayMessage = `📄 ${file.name}`;
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      messageType = 'document';
      displayMessage = `📄 ${file.name}`;
    }

    toast.info("📤 Caricamento in corso...");

    const fileName = `${currentUserId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Errore caricamento file");
      console.error(uploadError);
      return;
    }

    const { data } = supabase.storage.from('chat-media').getPublicUrl(fileName);
    await sendMessage(messageType, displayMessage, data.publicUrl);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const fileName = `${currentUserId}/${Date.now()}.webm`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(fileName, blob);

        if (uploadError) {
          toast.error("Errore caricamento audio");
          console.error(uploadError);
          return;
        }

        const { data } = supabase.storage.from('chat-media').getPublicUrl(fileName);
        await sendMessage('audio', 'Messaggio vocale', data.publicUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Registrazione in corso...");
    } catch (error) {
      toast.error("Errore accesso microfono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  const startCall = () => {
    toast.info("Funzione chiamata in sviluppo");
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton && (
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(otherUserName)}
                </AvatarFallback>
              </Avatar>
              <DialogTitle>{otherUserName}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={startCall}>
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isSender = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isSender
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                  >
                    {message.message_type === 'image' && message.media_url && (
                      <img src={message.media_url} alt="Immagine" className="max-w-full rounded mb-2" />
                    )}
                    {message.message_type === 'audio' && message.media_url && (
                      <audio controls src={message.media_url} className="max-w-full" />
                    )}
                    {message.message_type === 'document' && message.media_url && (
                      <a 
                        href={message.media_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm underline hover:no-underline"
                      >
                        {message.content}
                      </a>
                    )}
                    {(message.message_type === 'text' || message.message_type === 'file') && (
                      <p className="text-sm break-words">{message.content}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {isSender && (
                        message.read ? (
                          <CheckCheck className="h-3 w-3 opacity-70" />
                        ) : (
                          <Check className="h-3 w-3 opacity-70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[70%]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAISuggest(true)}
            className="w-full mb-2"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Suggerisci messaggio AI
          </Button>

          {showEmojiPicker && (
            <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(newMessage + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Allega file (immagini, PDF, documenti)"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? "text-red-500" : ""}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <AISuggestDialog
          open={showAISuggest}
          onOpenChange={setShowAISuggest}
          candidateName={otherUserName}
          context={messages.length > 0 ? "Conversazione già iniziata" : undefined}
          onSelectMessage={(message) => setNewMessage(message)}
        />
      </DialogContent>
    </Dialog>
  );
};
