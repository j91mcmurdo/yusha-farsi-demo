
'use client';

import { useState, ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { createLessonAction } from '@/app/actions';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Lesson } from '@/lib/types';

interface CreateLessonFormProps {
  onLessonCreated?: (lesson: Lesson) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Creating...' : 'Create Lesson'}
    </Button>
  );
}

export default function CreateLessonForm({ onLessonCreated }: CreateLessonFormProps) {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);

    // Auto-populate name only if it's empty or was previously auto-populated
    if (newDate && (!name || name.startsWith('Lesson on '))) {
      try {
        const formattedDate = format(new Date(newDate), 'dd/MM/yyyy');
        setName(`Lesson on ${formattedDate}`);
      } catch (error) {
        // Handle invalid date format if necessary
        setName('');
      }
    } else if (!newDate) {
      setName('');
    }
  };

  const handleAction = async (formData: FormData) => {
    // Manually set form data from state to ensure it's up-to-date
    formData.set('name', name);
    formData.set('date', date);
    formData.set('notes', notes);
    
    const result = await createLessonAction(formData);
    if (result.success) {
      toast({ title: 'Lesson Created!', description: 'Your new lesson has been added.' });
      
      // Reset form state
      setDate('');
      setName('');
      setNotes('');
      
      // Notify parent if needed (though re-fetching on the page is often better)
      if (onLessonCreated) {
        // We don't get the full new lesson object back easily, so this part might
        // need adjustment if the parent needs the full object.
      }
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <form action={handleAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input 
          id="date" 
          name="date" 
          type="date" 
          required 
          value={date}
          onChange={handleDateChange} 
        />
      </div>
       <div className="space-y-2">
        <Label htmlFor="name">Lesson Name</Label>
        <Input 
          id="name" 
          name="name" 
          required 
          placeholder="e.g., Lesson 5 - Past Tense" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          placeholder="Any general notes about this lesson..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <SubmitButton />
    </form>
  );
}
