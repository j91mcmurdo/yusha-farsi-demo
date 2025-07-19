
'use client';

import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useQuizStore } from '@/hooks/use-quiz-store';
import { getPublishedGridItems } from '@/lib/firestore';
import type { Category, Tag } from '@/lib/types';
import MultiSelect from './multi-select';
import { Loader2, Headphones, BookOpen, PenLine, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import QuizOptionCard from './quiz-option-card';

interface QuizSetupProps {
  categories: Category[];
  tags: Tag[];
  isLoading: boolean;
}

export default function QuizSetup({ categories, tags, isLoading }: QuizSetupProps) {
  // Local state for UI control
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<string>("10");
  const [questionFormat, setQuestionFormat] = useState<'reading' | 'listening'>('reading');
  const [direction, setDirection] = useState<'en-fa' | 'fa-en'>('en-fa');
  const [answerFormat, setAnswerFormat] = useState<'farsi' | 'finglish'>('farsi');
  const [isStarting, setIsStarting] = useState(false);

  // Zustand store actions
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const setQuizConfig = useQuizStore((state) => state.setQuizConfig);
  const { toast } = useToast();

  // Reset direction if an invalid one is selected for the current format
  useMemo(() => {
    if (questionFormat === 'listening' && direction === 'en-fa') {
      setDirection('fa-en');
    }
  }, [questionFormat, direction]);

  const handleStartQuiz = async () => {
    setIsStarting(true);
    
    // Update store config with final selections
    setQuizConfig({
        questionCount: questionCount === 'all' ? 'all' : parseInt(questionCount),
        categories: selectedCategories,
        tags: selectedTags,
        direction,
        answerFormat: direction === 'en-fa' ? answerFormat : null,
        questionFormat,
        answerMethod: 'writing', // Hardcoded for now
    });

    try {
        const fetchedQuestions = await getPublishedGridItems({
          category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
          tag: selectedTags.length > 0 ? selectedTags[0] : undefined,
        });

        const filteredQuestions = fetchedQuestions.filter(item => {
            const hasCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category || '');
            const hasTag = selectedTags.length === 0 || item.tags?.some(tagId => selectedTags.includes(tagId));
            return hasCategory && hasTag;
        });

        if (filteredQuestions.length === 0) {
            toast({
                title: 'No Questions Found',
                description: 'No content items match your selected filters. Please try a different selection.',
                variant: 'destructive',
            });
            setIsStarting(false);
            return;
        }

        startQuiz(filteredQuestions);

    } catch (error) {
        console.error("Failed to start quiz:", error);
        toast({
            title: 'Error',
            description: 'Could not fetch questions to start the quiz.',
            variant: 'destructive',
        });
    } finally {
        setIsStarting(false);
    }
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const tagOptions = tags.map(t => ({ value: t.id, label: t.name }));

  return (
    <div className="space-y-8">
      {/* Step 1: Content & Length */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">1. Choose Your Content</h3>
        <p className="text-sm text-muted-foreground">
          Select categories or tags to be included. Leave blank to include everything.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categories</Label>
            <MultiSelect
              options={categoryOptions}
              selected={selectedCategories}
              onChange={setSelectedCategories}
              placeholder="All categories"
              isLoading={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <MultiSelect
              options={tagOptions}
              selected={selectedTags}
              onChange={setSelectedTags}
              placeholder="All tags"
              isLoading={isLoading}
            />
          </div>
        </div>
         <div className="space-y-2 pt-2">
            <Label>Test Length</Label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
            <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Number of questions" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="25">25 Questions</SelectItem>
                <SelectItem value="50">50 Questions</SelectItem>
                <SelectItem value="all">All Questions</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>

      {/* Step 2: Question Format */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">2. How do you want to be tested?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuizOptionCard
            icon={Headphones}
            title="Listening"
            description="Listen to Farsi audio and translate."
            isSelected={questionFormat === 'listening'}
            onClick={() => setQuestionFormat('listening')}
          />
          <QuizOptionCard
            icon={BookOpen}
            title="Reading"
            description="Read text prompts and translate."
            isSelected={questionFormat === 'reading'}
            onClick={() => setQuestionFormat('reading')}
          />
        </div>
      </div>
      
      {/* Step 3: Direction (conditional on Reading) */}
      <div className={cn("space-y-4 transition-opacity duration-300", questionFormat === 'reading' ? 'opacity-100' : 'opacity-50 ')}>
        <h3 className="text-xl font-bold">3. Choose your direction</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuizOptionCard
                icon={BookOpen}
                title="Farsi to English"
                description="Read Farsi, write in English."
                isSelected={direction === 'fa-en'}
                onClick={() => setDirection('fa-en')}
            />
             <QuizOptionCard
                icon={BookOpen}
                title="English to Farsi"
                description="Read English, write in Farsi."
                isSelected={direction === 'en-fa'}
                onClick={() => setDirection('en-fa')}
                isDisabled={questionFormat === 'listening'}
                comingSoon={questionFormat === 'listening'}
            />
        </div>
      </div>


      {/* Step 4: Answer Format (conditional on En->Fa) */}
      <div className={cn("space-y-4 transition-opacity duration-300", direction === 'en-fa' && questionFormat === 'reading' ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden')}>
        <h3 className="text-xl font-bold">4. How do you want to answer?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuizOptionCard
                icon={PenLine}
                title="Answer in Farsi"
                description="Type your answer using the Farsi script."
                isSelected={answerFormat === 'farsi'}
                onClick={() => setAnswerFormat('farsi')}
            />
             <QuizOptionCard
                icon={PenLine}
                title="Answer in Finglish"
                description="Type your answer using English letters."
                isSelected={answerFormat === 'finglish'}
                onClick={() => setAnswerFormat('finglish')}
            />
        </div>
      </div>

      {/* Step 5: Answer Method */}
       <div className="space-y-4">
        <h3 className="text-xl font-bold">5. How do you want to submit answers?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuizOptionCard
                icon={PenLine}
                title="Writing"
                description="Type your answers."
                isSelected={true}
            />
             <QuizOptionCard
                icon={Mic}
                title="Speaking"
                description="Speak your answers."
                isSelected={false}
                isDisabled={true}
                comingSoon={true}
            />
        </div>
      </div>

      <Button onClick={handleStartQuiz} size="lg" className="w-full md:w-auto" disabled={isStarting}>
        {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isStarting ? 'Preparing Test...' : 'Begin Test'}
      </Button>
    </div>
  );
}

