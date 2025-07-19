
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/components/app-layout';
import { getPublishedGridItems } from '@/lib/firestore';
import type { DialogueMessage, EvaluationOutput, Persona } from '@/lib/types';
import { practiceDialogueAction, evaluateConversationAction } from '@/ai/flows/conversation-flow';
import { Loader2, Send, Star, UserCheck, MessageSquareQuote, BotMessageSquare, Flag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type PracticeStatus = 'not_started' | 'active' | 'evaluating' | 'complete';

const scenarioConfig = {
    restaurant: {
        persona: { name: 'Alireza', role: 'a friendly waiter' },
        objectives: [
            {
                intro: "You've just been seated at a restaurant. The waiter, Alireza, approaches your table.",
                objective: "You are very hungry. Greet the waiter and order a main course and a drink for yourself.",
                initialMessage: { role: 'model', content: 'سلام، خوش آمدید! چی میل دارید؟', finglish: 'Salaam, khosh amadid! Chi meyl daarid?' },
            },
            {
                intro: "You have finished your meal and you want to pay.",
                objective: "Ask for the bill, pay for your meal, and thank the waiter.",
                initialMessage: { role: 'model', content: 'غذا چطور بود؟ چیز دیگری میل دارید؟', finglish: 'Ghazā chetor bud? Chiz-e digari meil dārid?' },
            },
        ]
    },
    store: {
        persona: { name: 'Mahsa', role: 'a helpful shopkeeper' },
        objectives: [
            {
                intro: "You walk into a small grocery store. The shopkeeper, Mahsa, greets you.",
                objective: "Ask for the price of three items and then decide to buy two of them.",
                initialMessage: { role: 'model', content: 'سلام، خوش آمدید! چی لازم دارید؟', finglish: 'Salaam, khosh amadid! Chi laazem daarid?' },
            },
            {
                intro: "You are at a local shop to buy some fruit. The shopkeeper, Mahsa, is arranging some apples.",
                objective: "Ask if they have any watermelon, and if so, buy one.",
                initialMessage: { role: 'model', content: 'سلام، بفرمایید.', finglish: 'Salaam, befarmaayid.' },
            }
        ]
    },
    work: {
        persona: { name: 'Amir', role: 'a friendly colleague' },
        objectives: [
            {
                intro: "It's the morning and you see your colleague, Amir, by the coffee machine.",
                objective: "Greet your colleague and ask them how their weekend was.",
                initialMessage: { role: 'model', content: 'سلام، صبح بخیر!', finglish: 'Salaam, sobh bekhair!' },
            },
            {
                intro: "You need to ask your colleague Amir for help with a presentation.",
                objective: "Explain that you're working on a presentation and ask if they have a moment to review it with you.",
                initialMessage: { role: 'model', content: 'سلام، وقت داری؟', finglish: 'Salaam, vaght daari?' },
            }
        ]
    },
    city: {
        persona: { name: 'Reza', role: 'a helpful taxi driver' },
        objectives: [
            {
                intro: "You've just gotten into a taxi. The driver, Reza, greets you.",
                objective: "Tell the taxi driver you want to go to the Azadi Tower and ask how much it will cost.",
                initialMessage: { role: 'model', content: 'سلام آقا، کجا برم؟', finglish: 'Salaam agha, koja beram?' },
            },
            {
                intro: "You are lost in Tehran and you see a police officer.",
                objective: "Politely ask the officer for directions to the nearest metro station.",
                initialMessage: { role: 'model', content: 'ببخشید، می توانم کمکتان کنم؟', finglish: 'Bebakshid, mitavaanam komaketaan konam?' },
            }
        ]
    },
    family: {
        persona: { name: 'Maman Bozorg', role: 'your kind grandmother' },
        objectives: [
            {
                intro: "Your grandmother, Maman Bozorg, calls you on the phone.",
                objective: "Greet your grandmother, ask how she is, and tell her that you will visit her tomorrow.",
                initialMessage: { role: 'model', content: 'سلام عزیزم، چطوری؟', finglish: 'Salaam azizam, chetori?' },
            },
            {
                intro: "You are at a family gathering. Your aunt asks you what you've been up to.",
                objective: "Tell your aunt that you've been busy with work, but that it's going well.",
                initialMessage: { role: 'model', content: 'چه خبر؟ خیلی وقته ندیدمت!', finglish: 'Che khabar? Kheili vaghte nadidamet!' },
            }
        ]
    },
} as const;

type ScenarioId = keyof typeof scenarioConfig;
type ScenarioDetails = {
    intro: string;
    objective: string;
    initialMessage: DialogueMessage;
    persona: Persona;
};

const getScenarioDetails = (scenarioId: ScenarioId): ScenarioDetails | null => {
    const config = scenarioConfig[scenarioId];
    if (!config) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * config.objectives.length);
    const details = config.objectives[randomIndex];
    return { ...details, persona: config.persona };
}


export default function PracticeSessionPage() {
  const [status, setStatus] = useState<PracticeStatus>('not_started');
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [visibleFinglish, setVisibleFinglish] = useState<Set<number>>(new Set());
  const [evaluation, setEvaluation] = useState<EvaluationOutput | null>(null);
  const [scenarioDetails, setScenarioDetails] = useState<ScenarioDetails | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  
  const persona = scenarioDetails?.persona;
  const aiAvatarFallback = persona?.name?.charAt(0) || 'A';


  useEffect(() => {
    // This effect runs only on the client, after hydration
    const scenario = params.scenario as ScenarioId;
    if (scenario && Object.keys(scenarioConfig).includes(scenario)) {
        setScenarioDetails(getScenarioDetails(scenario));
    }

    async function fetchVocabulary() {
      setIsLoading(true);
      const items = await getPublishedGridItems({});
      const vocabList = items.map((item) => {
        if (item.type === 'word' || item.type === 'phrase' || item.type === 'verb') {
          return `English: ${item.english} - Farsi: ${item.farsi} - Finglish: ${item.finglish}`;
        }
        return '';
      }).filter(Boolean);
      setVocabulary(vocabList);
      setIsLoading(false);
    }
    fetchVocabulary();
  }, [params.scenario]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages, isAiResponding, status]);
  
  const startSession = () => {
    if (!scenarioDetails) return;
    setMessages([scenarioDetails.initialMessage]);
    setStatus('active');
    setEvaluation(null);
  }

  const toggleFinglish = (index: number) => {
    setVisibleFinglish(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        return newSet;
    })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAiResponding || !scenarioDetails || !persona) return;

    const newUserMessage: DialogueMessage = { role: 'user', content: userInput };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsAiResponding(true);

    try {
      const result = await practiceDialogueAction({
        persona: persona,
        objective: scenarioDetails.objective,
        vocabulary,
        history: newMessages,
      });
      
      if (result.isComplete && result.evaluation) {
        setStatus('evaluating');
        setMessages(prev => [...prev, { role: 'model', content: result.response.farsi, finglish: result.response.finglish }]);
        setEvaluation(result.evaluation);
        setTimeout(() => setStatus('complete'), 500);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: result.response.farsi, finglish: result.response.finglish }]);
      }
    } catch (error) {
      console.error("Error with AI response:", error);
      setMessages(prev => [...prev, { role: 'model', content: "متاسفم، مشکلی پیش آمد.", finglish: "Motasefam, moshkeli pish amad." }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleGiveUp = async () => {
    if (!scenarioDetails || !persona) return;
    setStatus('evaluating');
    setIsAiResponding(true);
    try {
        const result = await evaluateConversationAction({
            history: messages,
            personaName: persona.name,
            objective: scenarioDetails.objective,
        });
        setEvaluation(result);
        setTimeout(() => setStatus('complete'), 500);
    } catch (error) {
        console.error("Error during evaluation:", error);
         setMessages(prev => [...prev, { role: 'model', content: "متاسفم، مشکلی در ارزیابی پیش آمد.", finglish: "Motasefam, moshkeli dar arzyabi pish amad." }]);
         setStatus('active');
    } finally {
        setIsAiResponding(false);
    }
  }

  const renderContent = () => {
    if (status === 'not_started' || isLoading || !scenarioDetails) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Conversation Scenario</CardTitle>
                    {scenarioDetails ? <CardDescription>{scenarioDetails.intro}</CardDescription> : <Skeleton className="h-4 w-3/4" />}
                </CardHeader>
                <CardContent>
                    <Alert>
                        <BotMessageSquare className="h-4 w-4"/>
                        <AlertTitle>Your Objective</AlertTitle>
                        {scenarioDetails ? <AlertDescription>{scenarioDetails.objective}</AlertDescription> : <Skeleton className="h-4 w-full" />}
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button onClick={startSession} disabled={isLoading || !scenarioDetails} className="w-full">
                        {isLoading || !scenarioDetails ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Begin Conversation'}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (status === 'complete' && evaluation) {
        return (
             <Card className="max-w-2xl mx-auto w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">Conversation Complete!</CardTitle>
                    <CardDescription>Here is your performance evaluation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[45vh] pr-4">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h4 className="font-semibold flex items-center gap-2"><BotMessageSquare className="h-5 w-5 text-primary"/>Objective Completion</h4>
                                <p className="text-sm text-muted-foreground pl-7 whitespace-pre-wrap">{evaluation.objective.feedback}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary"/>Tone & Formality</h4>
                                    <div className="flex items-center">{Array.from({length: 5}).map((_, i) => <Star key={i} className={cn("h-5 w-5", i < evaluation.formality.score ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")}/>)}</div>
                                </div>
                                <p className="text-sm text-muted-foreground pl-7 whitespace-pre-wrap">{evaluation.formality.feedback}</p>
                            </div>
                            <div className="space-y-1">
                                 <div className="flex justify-between items-center">
                                    <h4 className="font-semibold flex items-center gap-2"><MessageSquareQuote className="h-5 w-5 text-primary"/>Grammar & Spelling</h4>
                                     <div className="flex items-center">{Array.from({length: 5}).map((_, i) => <Star key={i} className={cn("h-5 w-5", i < evaluation.grammar.score ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")}/>)}</div>
                                </div>
                                <p className="text-sm text-muted-foreground pl-7 whitespace-pre-wrap">{evaluation.grammar.feedback}</p>
                            </div>
                             <div className="space-y-1">
                                <h4 className="font-semibold flex items-center gap-2"><BotMessageSquare className="h-5 w-5 text-primary"/>Taarof</h4>
                                <p className="text-sm text-muted-foreground pl-7 whitespace-pre-wrap">{evaluation.taarof.feedback}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold flex items-center gap-2"><BotMessageSquare className="h-5 w-5 text-primary"/>Overall Feedback</h4>
                                <p className="text-sm text-muted-foreground pl-7 whitespace-pre-wrap">{evaluation.overall.feedback}</p>
                            </div>
                        </div>
                    </ScrollArea>
                    <Accordion type="single" collapsible className="w-full mt-4">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>View Conversation History</AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-48 mt-4 p-2 border rounded-md">
                            <div className="space-y-4 p-2">
                              {messages.map((message, index) => (
                                <div key={index} className={cn('flex items-start gap-2 text-sm', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                  {message.role === 'model' && (<Avatar className="h-6 w-6"><AvatarFallback>{aiAvatarFallback}</AvatarFallback></Avatar>)}
                                  <div className="flex flex-col">
                                      <div className={cn('max-w-xs rounded-lg px-3 py-1.5', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')} dir={message.role === 'model' ? 'rtl' : 'auto'}>
                                          <p>{message.content}</p>
                                      </div>
                                      {message.role === 'model' && message.finglish && (
                                        <p className="text-xs italic text-muted-foreground px-1 py-0.5">{message.finglish}</p>
                                      )}
                                  </div>
                                  {message.role === 'user' && (<Avatar className="h-6 w-6"><AvatarFallback>ME</AvatarFallback></Avatar>)}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                </CardContent>
                <CardFooter className="gap-2">
                     <Button onClick={() => setStatus('not_started')} className="w-full">Try Another Scenario</Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="flex-grow flex flex-col shadow-lg w-full">
            <CardHeader>
                <CardTitle className="text-xl font-headline">AI Conversation Practice</CardTitle>
                {scenarioDetails && (
                    <CardDescription>
                        <strong>Objective:</strong> {scenarioDetails.objective}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0">
                <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={cn('flex items-end gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {message.role === 'model' && (<Avatar className="h-8 w-8 self-start"><AvatarFallback>{aiAvatarFallback}</AvatarFallback></Avatar>)}
                        <div className="flex flex-col">
                            <div className={cn('max-w-xs md:max-w-md rounded-lg px-4 py-2', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')} dir={message.role === 'model' ? 'rtl' : 'auto'}>
                                <p>{message.content}</p>
                            </div>
                            {message.role === 'model' && message.finglish && (
                                <div className="px-1 py-1">
                                    {visibleFinglish.has(index) ? (
                                        <p className="text-sm italic text-muted-foreground">{message.finglish}</p>
                                    ) : (
                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => toggleFinglish(index)}>Show Finglish</Button>
                                    )}
                                </div>
                            )}
                        </div>
                        {message.role === 'user' && (<Avatar className="h-8 w-8"><AvatarFallback>ME</AvatarFallback></Avatar>)}
                        </div>
                    ))}
                    {isAiResponding && (
                        <div className="flex items-end gap-2 justify-start">
                            <Avatar className="h-8 w-8"><AvatarFallback>{aiAvatarFallback}</AvatarFallback></Avatar>
                            <div className="bg-muted rounded-lg px-4 py-3"><Loader2 className="h-5 w-5 animate-spin" /></div>
                        </div>
                    )}
                     {status === 'evaluating' && (
                        <div className="flex items-center justify-center p-4 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <p>Conversation complete. Evaluating performance...</p>
                        </div>
                    )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t space-y-2">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type your response..." disabled={isAiResponding || isLoading || status !== 'active'}/>
                  <Button type="submit" disabled={isAiResponding || isLoading || !userInput.trim() || status !== 'active'}>
                    {isAiResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
                {status === 'active' && (
                    <Button variant="outline" size="sm" className="w-full" onClick={handleGiveUp} disabled={isAiResponding}>
                        <Flag className="mr-2 h-4 w-4" />
                        Give Up & Evaluate
                    </Button>
                )}
              </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8 h-full">
        <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center">
            {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}
