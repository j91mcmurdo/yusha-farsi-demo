
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/app-layout';
import { ArrowRight } from 'lucide-react';

const scenarios = [
  {
    id: 'restaurant',
    title: 'At the Restaurant',
    description: 'Practice ordering food, asking for the bill, and interacting with a waiter.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/restaurant.png?alt=media&token=16d2b048-0291-4e1d-9a35-edf52bf50db9',
    imageHint: 'restaurant interior',
  },
  {
    id: 'store',
    title: 'At the Store',
    description: 'Practice buying items, asking for prices, and interacting with a shopkeeper.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/At%20the%20Shop.png?alt=media&token=a51eabbc-c303-4fbf-9079-c130dc55ad2a',
    imageHint: 'grocery store',
  },
  {
    id: 'work',
    title: 'At Work',
    description: 'Practice professional interactions, talking about projects, and making small talk with colleagues.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/At%20Work.png?alt=media&token=6cad7070-3b74-416d-a12e-6c502626b88f',
    imageHint: 'office colleagues',
  },
  {
    id: 'city',
    title: 'Around the City',
    description: 'Practice asking for directions, taking a taxi, and navigating a bustling city environment.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/Around%20the%20City.png?alt=media&token=a2202ef7-9153-4baa-8c7a-9ba8fa6b6c67',
    imageHint: 'city street',
  },
  {
    id: 'family',
    title: 'With Family',
    description: 'Practice informal chats, talking about your day, and interacting with family members.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/Family.png?alt=media&token=84d630fb-48a6-4dd7-a299-bd2e3b4344cb',
    imageHint: 'family gathering',
  },
];

export default function PracticeScenariosPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold font-headline">AI Conversation Practice</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Choose a scenario to test your Farsi skills in a real-world conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <Link href={`/practice/${scenario.id}`} key={scenario.id}>
                <Card className="h-full hover:shadow-lg hover:border-primary transition-all duration-200 group flex flex-col">
                  <CardHeader>
                    <div className="overflow-hidden rounded-lg mb-4">
                      <Image
                        src={scenario.imageUrl}
                        alt={scenario.title}
                        width={600}
                        height={400}
                        className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={scenario.imageHint}
                      />
                    </div>
                    <CardTitle className="text-2xl font-headline">{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                     <div className="flex items-center justify-end text-sm font-semibold text-primary">
                        Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
