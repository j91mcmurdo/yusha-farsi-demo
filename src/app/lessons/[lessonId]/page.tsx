import MasonryGrid from '@/components/masonry-grid';
import FloatingActionButton from '@/components/floating-action-button';
import { getLesson } from '@/lib/firestore';
import AppLayout from '@/components/app-layout';

export default async function LessonDetailPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const lesson = await getLesson(params.lessonId);

  if (!lesson) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          Lesson not found.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-background text-foreground font-body">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold font-headline">{lesson.name}</h1>
              <p className="text-muted-foreground">
                {lesson.date.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
            
          <MasonryGrid lessonId={params.lessonId} />
        </div>

        <FloatingActionButton lessonId={params.lessonId} />
      </main>
    </AppLayout>
  );
}
