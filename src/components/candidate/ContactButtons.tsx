import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";

interface ContactButtonsProps {
  email?: string;
  phone?: string;
  name: string;
}

export const ContactButtons = ({ email, phone, name }: ContactButtonsProps) => {
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
    <div className="flex gap-2">
      {email && (
        <Button variant="outline" size="sm" onClick={handleEmail} className="gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Button>
      )}
      {phone && (
        <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
      )}
    </div>
  );
};
