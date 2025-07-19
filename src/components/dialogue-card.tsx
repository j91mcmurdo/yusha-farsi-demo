'use client';

import type { Dialogue } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Pencil, Trash2, MessageCircle, FileText } from 'lucide-react';
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
import { Button } from './ui/button';

type DialogueCardProps = Dialogue & {
  showAdminControls?: boolean;
  showStatusBadge?: boolean;
};

export default function DialogueCard(props: DialogueCardProps) {
  const { id, title, dialogue, notes, tagNames, status, showAdminControls = false, showStatusBadge = false } = props;
  const { open: openAdminDialog, openConfirmation } = useAdminStore();
  const { toast } = useToast();

  const handleEdit = () => {
    // Pass original tag names for editing
    openAdminDialog('dialogue', null, 'edit', { ...props, tags: props.tagNames });
  };
  
  const handleDelete = () => {
    openConfirmation({
      title: 'Delete Dialogue?',
      description: "Are you sure you want to delete this dialogue? This action cannot be undone.",
      onConfirm: async () => {
        const result = await deleteContentItemAction(id);
        if (result.success) {
          toast({ title: "Dialogue Deleted" });
        } else {
          toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
      }
    })
  }

  return (
    <Card className="h-full flex flex-col bg-cyan-500/10 border-cyan-500/30 shadow-md hover:shadow-lg transition-shadow duration-300 relative">
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
        <CardTitle className={cn("text-2xl font-headline font-bold text-foreground flex items-center gap-2", showAdminControls && 'pt-8')}>
            <MessageCircle className="h-6 w-6 text-cyan-600" />
            {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {dialogue.map((line, index) => (
            <div key={index} className="flex flex-col text-sm">
                {line.speaker && <p className="font-bold">{line.speaker}</p>}
                <p>{line.english}</p>
                <p className="italic text-muted-foreground">{line.finglish}</p>
                <p className="text-right" dir="rtl">{line.farsi}</p>
            </div>
        ))}
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
