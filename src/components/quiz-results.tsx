
'use client';

import React from 'react';
import { useQuizStore } from '@/hooks/use-quiz-store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

export default function QuizResults() {
  const { answers, questions, quizConfig, resetQuiz } = useQuizStore();

  const correctAnswersCount = answers.filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          <CardDescription>Here's how you did.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-5xl font-bold">{score.toFixed(0)}%</p>
          <p className="text-muted-foreground">
            You got <span className="font-bold text-foreground">{correctAnswersCount}</span> out of <span className="font-bold text-foreground">{totalQuestions}</span> questions correct.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Your Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72 w-full pr-4">
            <div className="space-y-4">
              {answers.map((answer, index) => {
                const isFaToEn = quizConfig.direction === 'fa-en';
                const isEnToFaFarsi = quizConfig.direction === 'en-fa' && quizConfig.answerFormat === 'farsi';
                const isEnToFaFinglish = quizConfig.direction === 'en-fa' && quizConfig.answerFormat === 'finglish';

                const promptText = isFaToEn ? answer.question.farsi : answer.question.english;
                
                let correctAnswerText = '';
                if (isFaToEn) {
                  correctAnswerText = answer.question.english;
                } else if (isEnToFaFarsi) {
                  correctAnswerText = answer.question.farsi;
                } else {
                  correctAnswerText = answer.question.finglish;
                }
                
                const userAnswerDir = isEnToFaFarsi ? 'rtl' : 'ltr';
                const correctAnswerDir = isEnToFaFarsi ? 'rtl' : 'ltr';


                return (
                  <div key={index}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow space-y-1">
                        <div className='flex items-center justify-between'>
                            <p className="text-sm text-muted-foreground">Question {index + 1}</p>
                             {answer.usedHint && (
                                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                    <Lightbulb className="h-3 w-3" />
                                    Hint Used
                                </Badge>
                             )}
                        </div>
                        <p className={`font-semibold text-lg ${isFaToEn ? 'text-right' : ''}`} dir={isFaToEn ? 'rtl' : 'ltr'}>{promptText}</p>
                        <p className={`text-sm ${answer.isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                          Your answer: <span dir={userAnswerDir}>{answer.userAnswer}</span>
                        </p>
                        {!answer.isCorrect && (
                          <p className="text-sm text-green-600">
                            Correct answer: <span dir={correctAnswerDir}>{correctAnswerText}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        {answer.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-destructive" />
                        )}
                      </div>
                    </div>
                     {index < answers.length - 1 && <Separator className="mt-4" />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Button onClick={resetQuiz} size="lg" className="w-full">
        Start New Test
      </Button>
    </div>
  );
}
