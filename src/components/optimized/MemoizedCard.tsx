import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MemoizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const MemoizedCard: React.FC<MemoizedCardProps> = ({ title, children, className, onClick }) => {
  return (
    <Card className={className} onClick={onClick}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default React.memo(MemoizedCard);
