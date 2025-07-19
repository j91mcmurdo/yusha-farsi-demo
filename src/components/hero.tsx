
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function Hero() {
  return (
    <section className="pt-12 md:pt-16 pb-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-12">
          {/* Left Column: Image */}
          <div className="md:w-1/2 w-full">
            <Card className="overflow-hidden shadow-lg border-2 border-primary/20 bg-card/80 backdrop-blur-sm h-full">
              <CardContent className="p-0 h-full">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/%D9%81%D8%A7%D8%B1%D8%B3%DB%8C.png?alt=media&token=7f9b0bc1-dbc1-439d-bf7d-967df7c5072a"
                  alt="Yusha studying Farsi at a desk"
                  width={800}
                  height={600}
                  className="object-cover w-full h-full"
                  data-ai-hint="man portrait"
                  priority
                />
              </CardContent>
            </Card>
          </div>
          {/* Right Column: Text and Skyline */}
          <div className="md:w-1/2 w-full flex flex-col justify-between text-center md:text-left">
          <div className="w-full mt-4">
   
            </div>
            <div className="p-6 rounded-lg">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-foreground mb-4">
                Welcome to my Farsi Journey
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                This is my personal, AI-powered space for learning Farsi. Here, I organize vocabulary from my lessons, test my knowledge, and practice real-world conversations with an AI partner.
              </p>
            </div>
            <div className="w-full mt-4">
                <Image
                    src="https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/banner-skyline%20(5).png?alt=media&token=2815765e-c723-4cbd-a25e-c3e52bb03cde"
                    alt="Decorative banner of Tehran skyline"
                    width={1200}
                    height={400}
                    className="w-full object-contain"
                />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
