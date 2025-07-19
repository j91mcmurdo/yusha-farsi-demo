import { collection, getDocs, query, where, orderBy, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { ContentItem, Category, Tag, Lesson } from "./types";
import { ContentItemSchema, CategorySchema, TagSchema, LessonSchema } from "./types";

const CONTENT_COLLECTION = "content";
const CATEGORIES_COLLECTION = "categories";
const TAGS_COLLECTION = "tags";
const LESSONS_COLLECTION = "lessons";

interface GetGridItemsParams {
    searchQuery?: string;
    category?: string; // category ID
    tag?: string;      // tag ID
}

// Fetches items for the main homepage grid (published only)
export async function getPublishedGridItems({ searchQuery, category, tag }: GetGridItemsParams = {}): Promise<ContentItem[]> {
    try {
        const [categories, tags] = await Promise.all([getCategories(), getTags()]);
        const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
        const tagMap = new Map(tags.map(t => [t.id, t.name]));

        let constraints: any[] = [
            where("status", "==", "published"),
        ];

        if (category) {
            constraints.push(where("category", "==", category));
        }
        if (tag) {
            constraints.push(where("tags", "array-contains", tag));
        }
        
        // Add sorting only if not searching, as it's not compatible with all queries.
        if (!searchQuery) {
            constraints.push(orderBy("createdAt", "desc"));
        }
        
        const q = query(collection(db, CONTENT_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);
        
        let items = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const categoryId = data.category || '';
            const tagIds = data.tags || [];
            
            const itemWithResolvedNames = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
                categoryName: categoryMap.get(categoryId) || '', // Add the category name
                tagNames: tagIds.map((tagId: string) => tagMap.get(tagId)).filter(Boolean) as string[],
            };
            // Use .safeParse to avoid throwing errors on unknown types
            return ContentItemSchema.safeParse(itemWithResolvedNames);
        }).filter(result => result.success).map(result => (result as { success: true; data: ContentItem }).data);


        // Client-side filter for the search query, as Firestore doesn't support text search on multiple fields well
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            items = items.filter(item => {
                if ('english' in item) {
                    return item.english.toLowerCase().includes(lowercasedQuery) || 
                           item.finglish.toLowerCase().includes(lowercasedQuery) ||
                           item.farsi.toLowerCase().includes(lowercasedQuery)
                }
                if ('title' in item) {
                    return item.title.toLowerCase().includes(lowercasedQuery)
                }
                return false;
            });
        }
        
        return items;
    } catch(error) {
        console.error("Error fetching published grid items: ", error);
        return [];
    }
}


// Fetches all items for a specific lesson, regardless of status
export async function getLessonItems(lessonId: string): Promise<ContentItem[]> {
    if (!lessonId) return [];
    try {
        const [categories, tags, contentSnapshot] = await Promise.all([
            getCategories(), 
            getTags(),
            getDocs(query(collection(db, CONTENT_COLLECTION), where("lessonIds", "array-contains", lessonId), orderBy("createdAt", "desc")))
        ]);
        
        const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
        const tagMap = new Map(tags.map(t => [t.id, t.name]));
        
        const items = contentSnapshot.docs.map(doc => {
            const data = doc.data();
            const categoryId = data.category || '';
            const tagIds = data.tags || [];

            const itemWithDate = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
                categoryName: categoryMap.get(categoryId) || '', // Add the category name
                tagNames: tagIds.map((tagId: string) => tagMap.get(tagId)).filter(Boolean) as string[],
            };
            return ContentItemSchema.parse(itemWithDate);
        });
        
        return items;
    } catch(error) {
        console.error(`Error fetching items for lesson ${lessonId}: `, error);
        return [];
    }
}


export async function getCategories(): Promise<Category[]> {
    try {
        const querySnapshot = await getDocs(query(collection(db, CATEGORIES_COLLECTION), orderBy("name")));
        return querySnapshot.docs.map(doc => CategorySchema.parse({ id: doc.id, ...doc.data() }));
    } catch(error) {
        console.error("Error fetching categories: ", error);
        return [];
    }
}

export async function getTags(): Promise<Tag[]> {
    try {
        const querySnapshot = await getDocs(query(collection(db, TAGS_COLLECTION), orderBy("name")));
        return querySnapshot.docs.map(doc => TagSchema.parse({ id: doc.id, ...doc.data() }));
    } catch(error) {
        console.error("Error fetching tags: ", error);
        return [];
    }
}


export async function getLessons(): Promise<Lesson[]> {
    try {
        const q = query(collection(db, LESSONS_COLLECTION), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return LessonSchema.parse({
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
            });
        });
    } catch (error) {
        console.error("Error fetching lessons: ", error);
        return [];
    }
}

export async function getLesson(id: string): Promise<Lesson | null> {
    try {
        const docRef = doc(db, LESSONS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return LessonSchema.parse({
                id: docSnap.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
            });
        } else {
            console.log("No such lesson!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching lesson:", error);
        return null;
    }
}
