
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuizStore } from '@/hooks/use-quiz-store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, XCircle, Lightbulb, Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Quiz() {
  const {
    questions,
    currentQuestionIndex,
    answers,
    quizConfig,
    submitAnswer,
    nextQuestion,
    useHint,
  } = useQuizStore();
  
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const lastAnswer = answers[answers.length - 1];
  const { toast } = useToast();

  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const playQuestionAudio = () => {
    if (!currentQuestion?.audioUrl || isPlayingAudio) return;
    setIsPlayingAudio(true);
    const audio = new Audio(currentQuestion.audioUrl);
    audio.play().catch(e => {
        console.error("Error playing audio:", e);
        toast({ title: "Playback Error", description: "Could not play the audio file.", variant: "destructive" });
    }).finally(() => {
        setIsPlayingAudio(false);
    });
  };

  // Auto-play audio for listening questions
  useEffect(() => {
    if (quizConfig.questionFormat === 'listening') {
      playQuestionAudio();
    }
  }, [currentQuestionIndex, quizConfig.questionFormat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '' || showFeedback) return;
    submitAnswer(userInput);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setShowHint(false); // Reset hint for the next question
    setUserInput('');
    nextQuestion();
  };

  const handleShowHint = () => {
    setShowHint(true);
    useHint();
  }

  const { questionText, answerText, hintText, promptType, inputDirection, answerDirection } = useMemo(() => {
    if (!currentQuestion) return { questionText: '', answerText: '', hintText: '', promptType: '', inputDirection: 'ltr', answerDirection: 'ltr' };
    
    if (quizConfig.direction === 'fa-en') {
      return { 
        questionText: currentQuestion.farsi, 
        answerText: currentQuestion.english, 
        hintText: currentQuestion.finglish,
        promptType: 'English',
        inputDirection: 'ltr',
        answerDirection: 'ltr',
      };
    } else { // en-fa
      if (quizConfig.answerFormat === 'farsi') {
        return {
          questionText: currentQuestion.english, 
          answerText: currentQuestion.farsi, 
          hintText: '',
          promptType: 'Farsi',
          inputDirection: 'rtl',
          answerDirection: 'rtl',
        }
      }
      return { // en-fa, answer in finglish
        questionText: currentQuestion.english, 
        answerText: currentQuestion.finglish, 
        hintText: '',
        promptType: 'Finglish',
        inputDirection: 'ltr',
        answerDirection: 'ltr',
      };
    }
  }, [currentQuestion, quizConfig.direction, quizConfig.answerFormat]);

  if (!currentQuestion) {
    return (
        <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading quiz...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardDescription>
            {quizConfig.questionFormat === 'listening' ? 'Listen to the Farsi and translate into English:' : `Translate the following into ${promptType}:`}
          </CardDescription>

          {quizConfig.questionFormat === 'listening' ? (
            <div className="flex items-center justify-center py-8">
                <Button variant="outline" size="icon" className="h-20 w-20 rounded-full" onClick={playQuestionAudio} disabled={isPlayingAudio}>
                    {isPlayingAudio ? <Loader2 className="h-8 w-8 animate-spin" /> : <Volume2 className="h-8 w-8" />}
                </Button>
            </div>
          ) : (
            <CardTitle className={cn("text-4xl font-bold", quizConfig.direction === 'fa-en' ? 'text-right' : '')} dir={quizConfig.direction === 'fa-en' ? 'rtl' : 'ltr'}>
                {questionText}
            </CardTitle>
          )}

          {quizConfig.direction === 'fa-en' && (
             <div className="pt-2 flex flex-col items-end">
                {showHint ? (
                    <p className="text-muted-foreground italic text-lg">{hintText}</p>
                ) : (
                    <Button variant="outline" size="sm" onClick={handleShowHint} disabled={showFeedback}>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Show Hint (Finglish)
                    </Button>
                )}
             </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Your answer..."
              disabled={showFeedback}
              className={cn('text-lg', inputDirection === 'rtl' ? 'text-right' : '')}
              dir={inputDirection}
              autoFocus
            />
             <Button type="submit" className="w-full" disabled={showFeedback || !userInput}>
              Submit Answer
            </Button>
          </form>
        </CardContent>
        {showFeedback && lastAnswer && (
          <CardFooter>
            <Alert variant={lastAnswer.isCorrect ? 'default' : 'destructive'} className="w-full">
               {lastAnswer.isCorrect ? (
                    <CheckCircle className="h-4 w-4" />
                ) : (
                    <XCircle className="h-4 w-4" />
                )}
              <AlertTitle>{lastAnswer.isCorrect ? 'Correct!' : 'Incorrect!'}</AlertTitle>
              <AlertDescription>
                {!lastAnswer.isCorrect && (
                   <p>The correct answer was: <strong className={cn("font-semibold", answerDirection === 'rtl' ? 'text-right' : '')} dir={answerDirection}>{answerText}</strong></p>
                )}
                <Button onClick={handleNextQuestion} className="w-full mt-4">
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
