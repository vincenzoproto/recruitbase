import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, MessageSquare } from "lucide-react";
import { ChatDialog } from "@/components/chat/ChatDialog";

interface ContactButtonsProps {
  currentUserId?: string;
  targetUserId?: string;
  email?: string;
  phone?: string;
  name: string;
}

export const ContactButtons = ({ currentUserId, targetUserId, email, phone, name }: ContactButtonsProps) => {
  const handleEmail = () => {
    if (email) {
      window.location.href = `mailto:${email}?subject=Opportunità di lavoro`;
    }
  };

  const handleWhatsApp = () => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, "");
      const message = encodeURIComponent(`Ciao ${name}, ho visto il tuo profilo e vorrei parlare con te`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {currentUserId && targetUserId && (
        <ChatDialog
          currentUserId={currentUserId}
          otherUserId={targetUserId}
          otherUserName={name}
          triggerButton={
            <Button variant="default" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          }
        />
      )}
      {phone && (
        <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
      )}
      {email && (
        <Button variant="outline" size="sm" onClick={handleEmail} className="gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Button>
      )}
    </div>
  );
};
