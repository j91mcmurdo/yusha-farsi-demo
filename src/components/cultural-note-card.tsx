'use client';

import type { CulturalNote } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
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

type CulturalNoteCardProps = CulturalNote & {
  showAdminControls?: boolean;
  showStatusBadge?: boolean;
};

export default function CulturalNoteCard(props: CulturalNoteCardProps) {
  const { id, title, content, tagNames, status, showAdminControls = false, showStatusBadge = false } = props;
  const { open: openAdminDialog, openConfirmation } = useAdminStore();
  const { toast } = useToast();

  const handleEdit = () => {
    // Pass original tag names for editing
    openAdminDialog('cultural_note', null, 'edit', { ...props, tags: props.tagNames });
  };
  
  const handleDelete = () => {
    openConfirmation({
      title: 'Delete Cultural Note?',
      description: "Are you sure you want to delete this note? This action cannot be undone.",
      onConfirm: async () => {
        const result = await deleteContentItemAction(id);
        if (result.success) {
          toast({ title: "Note Deleted" });
        } else {
          toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
      }
    })
  }

  return (
    <Card className="h-full flex flex-col bg-amber-500/10 border-amber-500/30 shadow-md hover:shadow-lg transition-shadow duration-300 relative">
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
        <CardTitle className={cn("text-2xl font-headline font-bold text-foreground", showAdminControls && 'pt-8')}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
      </CardContent>
      {tagNames && tagNames.length > 0 && (
        <CardContent className="p-4 flex flex-wrap gap-2">
            {tagNames.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
        </CardContent>
      )}
    </Card>
  );
}
