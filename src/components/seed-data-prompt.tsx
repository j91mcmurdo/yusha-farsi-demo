'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { seedDatabaseAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

export default function SeedDataPrompt() {
  const [isOpen, setIsOpen] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    const result = await seedDatabaseAction();
    setIsSeeding(false);

    if (result.success) {
      toast({
        title: 'Database Seeded! ✨',
        description: 'Your app is now populated with demo data. The page will now refresh.',
      });
      // Delay refresh slightly to allow toast to be seen
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toast({
        title: 'Seeding Failed',
        description: result.error,
        variant: 'destructive',
      });
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome to Your Farsi Journey! 🎉</AlertDialogTitle>
          <AlertDialogDescription>
            Your content library is currently empty. Would you like to populate the app with some demo data to get started?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, thanks</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleSeedDatabase} disabled={isSeeding}>
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Populating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Yes, add demo data
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
