
'use client';

import { useState } from 'react';
import type { Phrase } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { MoreVertical, Pencil, Trash2, Volume2, Loader2, FileText } from 'lucide-react';
import { useAdminStore } from '@/hooks/use-admin-store';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteContentItemAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { getOrCreateAudioAction } from '@/app/ai-actions';

type PhraseCardProps = Phrase & {
  showAdminControls?: boolean;
  showStatusBadge?: boolean;
};

export default function PhraseCard(props: PhraseCardProps) {
  const { id, farsi, finglish, english, notes, tagNames, audioUrl, recordingId, status, showAdminControls = false, showStatusBadge = false } = props;
  const { open: openAdminDialog, openConfirmation } = useAdminStore();
  const { toast } = useToast();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(audioUrl);

  const handleEdit = () => {
    // Pass original tag names for editing
    openAdminDialog('phrase', null, 'edit', { ...props, tags: props.tagNames });
  };
  
  const handleDelete = () => {
    openConfirmation({
      title: 'Delete Phrase?',
      description: "Are you sure you want to delete this phrase? This action cannot be undone.",
      onConfirm: async () => {
        const result = await deleteContentItemAction(id);
        if (result.success) {
          toast({ title: "Phrase Deleted" });
        } else {
          toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
      }
    })
  }

  const playAudio = async () => {
    if (isGeneratingAudio) return;
    if (currentAudioUrl) {
      const audio = new Audio(currentAudioUrl);
      audio.play().catch(e => console.error("Error playing audio:", e));
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const result = await getOrCreateAudioAction({ docId: id, text: farsi, recordingId, audioUrl });
      setCurrentAudioUrl(result.audioUrl);
      const audio = new Audio(result.audioUrl);
      audio.play().catch(e => {
        console.error("Error playing audio:", e);
        toast({ title: "Playback Error", description: "Could not play the audio file.", variant: "destructive" });
      });
    } catch (error: any) {
      console.error("Failed to get audio:", error);
      toast({ title: "Audio Error", description: error.message || "Could not generate or play audio.", variant: "destructive" });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-accent/30 border-accent/50 shadow-md hover:shadow-lg transition-shadow duration-300 relative">
      <CardHeader className="pt-6 pb-4">
        {showAdminControls && (
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10 mb-2">
              {showStatusBadge && status && <Badge variant={status === 'published' ? 'default' : 'secondary'} className={cn(
                  'capitalize',
                  status === 'published' ? 'bg-green-600' : 'bg-yellow-500'
              )}>
                  {status}
              </Badge>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        )}
        <div className="flex justify-between items-start">
            <CardTitle className={cn("text-2xl font-headline font-bold text-foreground", showAdminControls && 'pt-8')} dir="rtl">
              {farsi}
            </CardTitle>
             <Button variant="ghost" size="icon" onClick={playAudio} disabled={isGeneratingAudio} className="text-muted-foreground hover:text-foreground">
                {isGeneratingAudio ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                <span className="sr-only">Play audio</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Separator className="w-full bg-accent/50 mb-4" />
        <div className='space-y-2'>
            <p className="text-lg text-secondary-foreground font-semibold">{english}</p>
            <p className="text-sm text-muted-foreground italic">{finglish}</p>
        </div>
        {notes && (
          <div className="p-3 bg-background/50 rounded-md mt-4">
            <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Notes</h4>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </CardContent>
      {tagNames && tagNames.length > 0 && (
          <CardFooter className="p-4 flex flex-wrap gap-2">
            {tagNames.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </CardFooter>
      )}
    </Card>
  );
}
