
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Badge } from './ui/badge';

interface QuizOptionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected: boolean;
  isDisabled?: boolean;
  comingSoon?: boolean;
  onClick?: () => void;
}

export default function QuizOptionCard({
  icon: Icon,
  title,
  description,
  isSelected,
  isDisabled = false,
  comingSoon = false,
  onClick,
}: QuizOptionCardProps) {
  return (
    <Card
      onClick={isDisabled ? undefined : onClick}
      className={cn(
        'cursor-pointer border-2 transition-all duration-200',
        isSelected ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50',
        isDisabled ? 'cursor-not-allowed bg-muted/50 text-muted-foreground' : ''
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2 relative">
        {comingSoon && (
            <Badge variant="secondary" className="absolute top-2 right-2">Coming Soon</Badge>
        )}
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors',
            isSelected && !isDisabled ? 'bg-primary text-primary-foreground' : ''
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
