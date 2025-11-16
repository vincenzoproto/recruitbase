import React from 'react';
import OptimizedAvatar from './OptimizedAvatar';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

interface OptimizedChatMessageProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    media_url?: string;
    read?: boolean;
  };
  isCurrentUser: boolean;
  senderName: string;
  senderAvatar?: string;
}

const OptimizedChatMessage: React.FC<OptimizedChatMessageProps> = ({
  message,
  isCurrentUser,
  senderName,
  senderAvatar
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`flex gap-2 mb-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      {!isCurrentUser && (
        <OptimizedAvatar
          src={senderAvatar}
          alt={senderName}
          fallback={getInitials(senderName)}
          className="h-8 w-8 flex-shrink-0"
        />
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
          {message.media_url && (
            <img
              src={message.media_url}
              alt="Attachment"
              className="mt-2 rounded-lg max-w-full"
              loading="lazy"
            />
          )}
        </div>
        
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: it
            })}
          </span>
          {isCurrentUser && (
            message.read ? (
              <CheckCheck className="h-3 w-3 text-primary" />
            ) : (
              <Check className="h-3 w-3 text-muted-foreground" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptimizedChatMessage);
