import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface OptimizedAvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  className?: string;
  priority?: boolean;
}

const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({ 
  src, 
  alt, 
  fallback, 
  className,
  priority = false 
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Avatar className={className}>
      {src && !imageError ? (
        <AvatarImage 
          src={src} 
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImageError(true)}
        />
      ) : (
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {fallback}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default React.memo(OptimizedAvatar);
