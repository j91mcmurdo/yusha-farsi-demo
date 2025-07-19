'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import CreateLessonForm from '@/components/create-lesson-form';
import AppLayout from '@/components/app-layout';
import { getLessons } from '@/lib/firestore';
import type { Lesson } from '@/lib/types';
import { useAdminStore } from '@/hooks/use-admin-store';
import { deleteLessonAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { open: openAdminDialog, openConfirmation } = useAdminStore();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLessons() {
      setIsLoading(true);
      const fetchedLessons = await getLessons();
      setLessons(fetchedLessons);
      setIsLoading(false);
    }
    fetchLessons();
  }, []);

  const handleEdit = (lesson: Lesson) => {
    openAdminDialog('lesson', null, 'edit', lesson);
  };

  const handleDelete = (lessonId: string) => {
    openConfirmation({
      title: 'Delete Lesson?',
      description: "This will permanently delete the lesson and remove its association from all content items. This action cannot be undone.",
      onConfirm: async () => {
        const result = await deleteLessonAction(lessonId);
        if (result.success) {
          toast({ title: 'Lesson Deleted', description: 'The lesson has been removed.' });
          setLessons(prev => prev.filter(l => l.id !== lessonId));
        } else {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
      },
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl py-8">
        <div className='flex justify-between items-center mb-6'>
          <h1 className="text-4xl font-bold font-headline">Lessons</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Create New Lesson</h2>
            <Card>
              <CardHeader>
                <CardTitle>New Lesson</CardTitle>
                <CardDescription>Add a new lesson to your journey.</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateLessonForm onLessonCreated={(newLesson) => setLessons(prev => [newLesson, ...prev])} />
              </CardContent>
            </Card>
          </div>
            
          <div>
            <h2 className="text-2xl font-bold mb-4">Existing Lessons</h2>
            <div className="space-y-4">
              {isLoading ? (
                <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </>
              ) : lessons.length > 0 ? (
                lessons.map((lesson) => (
                    <Card key={lesson.id} className='hover:bg-muted/50 transition-colors flex justify-between items-center pr-6'>
                      <Link href={`/lessons/${lesson.id}`} className="block flex-grow">
                          <CardHeader>
                            <CardTitle>{lesson.name}</CardTitle>
                            <CardDescription>
                              {lesson.date.toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </CardDescription>
                          </CardHeader>
                      </Link>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(lesson)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(lesson.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </Card>
                ))
              ) : (
                <p>No lessons created yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
