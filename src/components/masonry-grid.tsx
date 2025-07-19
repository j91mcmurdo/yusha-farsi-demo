import WordCard from '@/components/word-card';
import PhraseCard from '@/components/phrase-card';
import VerbCard from '@/components/verb-card';
import CulturalNoteCard from '@/components/cultural-note-card';
import DialogueCard from '@/components/dialogue-card';
import { getPublishedGridItems, getLessonItems } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentItem } from '@/lib/types';


interface MasonryGridProps {
  gridItems: ContentItem[];
  lessonId?: string;
  showAdminControls?: boolean;
}

export default async function MasonryGrid({ 
  gridItems,
  lessonId,
  showAdminControls = false,
}: MasonryGridProps) {
  
  if (gridItems.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No items match your current filters. Try adjusting your search or adding new content.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show controls if it's a lesson page OR if explicitly enabled for homepage
  const displayAdminControls = !!lessonId || showAdminControls;
  const showStatusBadge = !!lessonId;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
        {gridItems.map((item) => (
          <div key={item.id} className="break-inside-avoid mb-8">
            {(() => {
              switch (item.type) {
                case 'word':
                  return <WordCard {...item} showAdminControls={displayAdminControls} showStatusBadge={showStatusBadge} />;
                case 'phrase':
                  return <PhraseCard {...item} showAdminControls={displayAdminControls} showStatusBadge={showStatusBadge} />;
                case 'verb':
                  return <VerbCard {...item} showAdminControls={displayAdminControls} showStatusBadge={showStatusBadge} />;
                case 'cultural_note':
                  return <CulturalNoteCard {...item} showAdminControls={displayAdminControls} showStatusBadge={showStatusBadge} />;
                case 'dialogue':
                    return <DialogueCard {...item} showAdminControls={displayAdminControls} showStatusBadge={showStatusBadge} />;
                default:
                  const _exhaustiveCheck: never = item;
                  return null;
              }
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
