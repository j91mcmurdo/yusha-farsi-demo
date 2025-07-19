
'use client';

import { useState } from 'react';
import type { Verb, VerbConjugation } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
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
import { getOrCreateAudioAction, getOrCreateTenseAudioAction } from '@/app/ai-actions';

type VerbCardProps = Verb & {
  showAdminControls?: boolean;
  showStatusBadge?: boolean;
};

const TenseAudioButton = ({ tense, conjugations, verbEnglish }: { tense: string; conjugations: VerbConjugation[]; verbEnglish: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const playTenseAudio = async () => {
        setIsLoading(true);
        try {
            // Construct the script for the AI
            const script = `This is how you say '${verbEnglish}' in the ${tense} tense. ${conjugations.map(c => `${c.english}. ${c.farsi}.`).join(' ')}`;
            
            const result = await getOrCreateTenseAudioAction({
                text: script,
            });

            if (result.audioUrl) {
                const audio = new Audio(result.audioUrl);
                audio.play().catch(e => {
                    console.error("Error playing tense audio:", e);
                    toast({ title: "Playback Error", description: "Could not play the audio file.", variant: "destructive" });
                });
            }
        } catch (error: any) {
            console.error("Failed to get tense audio:", error);
            toast({ title: "Audio Error", description: error.message || "Could not generate or play tense audio.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="ghost" size="icon" onClick={playTenseAudio} disabled={isLoading} className="text-muted-foreground hover:text-foreground h-7 w-7">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            <span className="sr-only">Play audio for {tense}</span>
        </Button>
    );
};


export default function VerbCard(props: VerbCardProps) {
  const { id, farsi, finglish, english, category, categoryName, tagNames, notes, conjugations, audioUrl, recordingId, status, showAdminControls = false, showStatusBadge = false } = props;
  const { open: openAdminDialog, openConfirmation } = useAdminStore();
  const { toast } = useToast();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(audioUrl);


  const handleEdit = () => {
    // Pass original tag names for editing
    openAdminDialog('verb', null, 'edit', { ...props, tags: props.tagNames });
  };
  
  const handleDelete = () => {
    openConfirmation({
      title: 'Delete Verb?',
      description: "Are you sure you want to delete this verb and all its conjugations? This action cannot be undone.",
      onConfirm: async () => {
        const result = await deleteContentItemAction(id);
        if (result.success) {
          toast({ title: "Verb Deleted" });
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
  
  const groupedConjugations = conjugations.reduce((acc, conj) => {
    const tense = conj.tense || 'Uncategorized';
    if (!acc[tense]) {
      acc[tense] = [];
    }
    acc[tense].push(conj);
    return acc;
  }, {} as Record<string, VerbConjugation[]>);
  
  return (
    <Card className="h-full flex flex-col bg-secondary/20 border-secondary/40 shadow-md hover:shadow-lg transition-shadow duration-300 relative">
      <CardHeader className="pt-6 pb-4">
        {showAdminControls ? (
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
        ) : (
            categoryName && <Badge variant="secondary" className="absolute top-2 right-2">{categoryName}</Badge>
        )}
        <div className={cn(showAdminControls && 'pt-8')}>
          <p className="text-xs text-muted-foreground">Verb (Infinitive)</p>
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-headline font-bold text-foreground" dir="rtl">
              {farsi}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={playAudio} disabled={isGeneratingAudio} className="text-muted-foreground hover:text-foreground">
                {isGeneratingAudio ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                <span className="sr-only">Play audio</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Separator className="w-full bg-secondary/50 mb-4" />
        <div className="mb-4 space-y-2">
            <div className='flex items-center gap-2'>
                <p className="text-lg text-secondary-foreground font-semibold">{english}</p>
                {categoryName && <Badge variant="secondary">{categoryName}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground italic">{finglish}</p>
        </div>
        {notes && (
          <div className="p-3 bg-background/50 rounded-md mb-4">
            <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Notes</h4>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
          </div>
        )}
        {conjugations && conjugations.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>View Conjugations</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {Object.entries(groupedConjugations).map(([tense, conjList]) => (
                    <div key={tense} className="p-3 bg-background/50 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-base">{tense}</h4>
                        <TenseAudioButton tense={tense} conjugations={conjList} verbEnglish={english} />
                      </div>
                      <ul className="space-y-2">
                        {conjList.map((conj, index) => (
                          <li key={index} className="text-sm border-t border-border pt-2">
                              <p dir="rtl" className="text-lg">{conj.farsi}</p>
                              <p>{conj.english}</p>
                              <p className="italic text-muted-foreground">{conj.finglish}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
