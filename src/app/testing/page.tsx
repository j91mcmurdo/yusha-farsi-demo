
'use client';

import { useState, useEffect } from 'react';
import AppLayout from "@/components/app-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategories, getTags } from '@/lib/firestore';
import type { Category, Tag, ContentItem } from '@/lib/types';
import QuizSetup from '@/components/quiz-setup';
import Quiz from '@/components/quiz';
import QuizResults from '@/components/quiz-results';
import { useQuizStore } from '@/hooks/use-quiz-store';

type QuizStatus = 'configuring' | 'in_progress' | 'finished';

export default function TestingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get quiz state from the Zustand store
  const { questions, currentQuestionIndex, answers } = useQuizStore();
  
  // Determine quiz status
  const getQuizStatus = (): QuizStatus => {
    if (questions.length === 0) {
      return 'configuring';
    }
    if (currentQuestionIndex < questions.length) {
      return 'in_progress';
    }
    return 'finished';
  }

  const status = getQuizStatus();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [fetchedCategories, fetchedTags] = await Promise.all([
        getCategories(),
        getTags(),
      ]);
      setCategories(fetchedCategories);
      setTags(fetchedTags);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'in_progress':
        return <Quiz />;
      case 'finished':
        return <QuizResults />;
      case 'configuring':
      default:
        return <QuizSetup categories={categories} tags={tags} isLoading={isLoading} />;
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">Farsi Skills Test</CardTitle>
              <CardDescription>Test your knowledge of the words and phrases you've learned.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
