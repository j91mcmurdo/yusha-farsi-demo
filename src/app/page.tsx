
import { Suspense } from 'react';
import Hero from '@/components/hero';
import MasonryGrid from '@/components/masonry-grid';
import FloatingActionButton from '@/components/floating-action-button';
import FilterControls from '@/components/filter-controls';
import { getCategories, getTags, getPublishedGridItems } from '@/lib/firestore';
import AppLayout from '@/components/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import SeedDataPrompt from '@/components/seed-data-prompt';

// This is now a Server Component responsible for data fetching
export default async function Home({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    category?: string;
    tag?: string;
  };
}) {
  const searchQuery = searchParams?.q || '';
  const selectedCategory = searchParams?.category || '';
  const selectedTag = searchParams?.tag || '';

  // Fetch data that doesn't depend on client-side state here
  const [categories, tags, gridItems] = await Promise.all([
    getCategories(),
    getTags(),
    getPublishedGridItems({ searchQuery, category: selectedCategory, tag: selectedTag })
  ]);
  
  const showSeedPrompt = gridItems.length === 0 && !searchQuery && !selectedCategory && !selectedTag;

  return (
    <AppLayout>
      <main className="min-h-screen text-foreground font-body">
        <Hero />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <FilterControls categories={categories} tags={tags} />
        </div>
          
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-8">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <MasonryGrid 
                gridItems={gridItems}
                showAdminControls={true} // Enable admin controls on homepage
              />
            </Suspense>
            {showSeedPrompt && <SeedDataPrompt />}
        </div>

        <FloatingActionButton />
      </main>
    </AppLayout>
  );
}
