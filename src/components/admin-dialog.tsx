"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdminForm from '@/components/admin-form';
import LessonForm from '@/components/lesson-form';
import { useAdminStore } from '@/hooks/use-admin-store';
import { ScrollArea } from './ui/scroll-area';

export default function AdminDialog() {
  const { isOpen, type, lessonId, mode, itemToEdit, close } = useAdminStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
  };
  
  if (!isClient) {
    return null;
  }

  const titleAction = mode === 'edit' ? 'Edit' : 'Add New';
  const titleType = type ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : 'Entry';
  const title = `${titleAction} ${titleType}`;

  const isLessonForm = type === 'lesson';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] grid-rows-[auto_1fr] p-0 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full">
          <div className="p-6">
            {isLessonForm ? (
                 <LessonForm
                    initialData={mode === 'edit' ? itemToEdit : null}
                    onFormSubmit={close}
                />
            ) : (
                type && (
                    <AdminForm 
                        contentType={type} 
                        lessonId={lessonId} 
                        onFormSubmit={close} 
                        initialData={mode === 'edit' ? itemToEdit : null}
                    />
                )
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
