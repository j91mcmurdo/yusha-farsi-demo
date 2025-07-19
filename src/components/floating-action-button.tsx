"use client";

import { useState } from 'react';
import { Plus, PenSquare, MessageSquareText, Replace, Milestone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdminStore } from '@/hooks/use-admin-store';
import { cn } from '@/lib/utils';
import type { ContentItem } from '@/lib/types';

interface FloatingActionButtonProps {
  lessonId?: string; // Optional lessonId prop
}

export default function FloatingActionButton({ lessonId }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { open: openDialog } = useAdminStore();

  const handleFabClick = (type: ContentItem['type']) => {
    openDialog(type, lessonId); // Pass lessonId to the store
    setIsOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative flex flex-col items-center gap-2">
          {/* Speed Dial Options */}
          <div
            className={cn(
              'flex flex-col items-center gap-2 transition-all duration-300 ease-in-out',
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-12 h-12 shadow-lg"
                  onClick={() => handleFabClick('dialogue')}
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Add Dialogue</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-12 h-12 shadow-lg"
                  onClick={() => handleFabClick('cultural_note')}
                >
                  <Milestone className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Add Cultural Note</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-12 h-12 shadow-lg"
                  onClick={() => handleFabClick('verb')}
                >
                  <Replace className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Add Verb</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-12 h-12 shadow-lg"
                  onClick={() => handleFabClick('phrase')}
                >
                  <MessageSquareText className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Add Phrase</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-12 h-12 shadow-lg"
                  onClick={() => handleFabClick('word')}
                >
                  <PenSquare className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Add Word</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Main FAB */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  'rounded-full w-16 h-16 shadow-xl transition-transform duration-300',
                  isOpen && 'rotate-45'
                )}
                onClick={() => setIsOpen(!isOpen)}
              >
                <Plus className="h-8 w-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Add new content</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
