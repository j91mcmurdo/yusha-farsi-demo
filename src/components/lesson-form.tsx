'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updateLessonAction } from '@/app/actions';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Lesson } from '@/lib/types';
import { format } from 'date-fns';


interface LessonFormProps {
  initialData?: Lesson | null;
  onFormSubmit?: () => void;
}

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Lesson')}
    </Button>
  );
}

export default function LessonForm({ initialData, onFormSubmit }: LessonFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const isEditMode = !!initialData;

  const handleAction = async (formData: FormData) => {
    if (!isEditMode || !initialData?.id) return;
    
    const result = await updateLessonAction(initialData.id, formData);
    if (result.success) {
      toast({ title: 'Lesson Updated', description: 'The lesson details have been saved.' });
      if (onFormSubmit) onFormSubmit();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <form ref={formRef} action={handleAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Lesson Name</Label>
        <Input id="name" name="name" required defaultValue={initialData?.name} placeholder="e.g., Lesson 5 - Past Tense" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={initialData ? format(initialData.date, 'yyyy-MM-dd') : ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" name="notes" defaultValue={initialData?.notes} placeholder="Any general notes about this lesson..." />
      </div>
      <SubmitButton isEditMode={isEditMode} />
    </form>
  );
}
