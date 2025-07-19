'use server';

import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, runTransaction, getDocs, query, where, writeBatch, Timestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import type { ContentItem } from "@/lib/types";
import path from 'path';
import fs from 'fs/promises';

const CONTENT_COLLECTION = "content";
const CATEGORIES_COLLECTION = "categories";
const LESSONS_COLLECTION = "lessons";
const TAGS_COLLECTION = "tags";


async function getTagIds(tagNames: string[]): Promise<string[]> {
    if (!tagNames || tagNames.length === 0) {
        return [];
    }
    
    const tagsRef = collection(db, TAGS_COLLECTION);
    const existingTagsQuery = query(tagsRef, where('name', 'in', tagNames));
    const querySnapshot = await getDocs(existingTagsQuery);

    const existingTags = new Map<string, string>();
    querySnapshot.forEach(doc => {
        existingTags.set(doc.data().name, doc.id);
    });

    const tagIds: string[] = [];
    const batch = writeBatch(db);
    
    for (const name of tagNames) {
        if (existingTags.has(name)) {
            tagIds.push(existingTags.get(name)!);
        } else {
            const newTagRef = doc(collection(db, TAGS_COLLECTION));
            batch.set(newTagRef, { name });
            tagIds.push(newTagRef.id);
            // Add to map to prevent duplicates in the same batch
            existingTags.set(name, newTagRef.id); 
        }
    }

    await batch.commit();
    return tagIds;
}

// --- Content Item Actions ---

export type AddContentItemData = Omit<ContentItem, 'id' | 'createdAt' | 'tags'> & { 
    lessonId?: string | null;
    tags: string[]; // Coming in as an array of names from the form
};


export async function addContentItemAction(item: AddContentItemData) {
  if (!item || !item.type) {
    return { success: false, error: "Invalid item data provided." };
  }
  
  const { lessonId, tags: tagNames, ...itemData } = item;

  const tagIds = await getTagIds(tagNames);

  const dataToSave: any = {
      ...itemData,
      tags: tagIds,
      createdAt: serverTimestamp(),
  };

  if (lessonId) {
    dataToSave.status = 'draft';
    dataToSave.lessonIds = [lessonId];
  } else {
    dataToSave.status = 'published';
  }

  try {
    const docRef = await addDoc(collection(db, CONTENT_COLLECTION), dataToSave);
    
    if (lessonId) {
        revalidatePath(`/lessons/${lessonId}`);
    }
    revalidatePath('/');
    revalidatePath('/lessons');

    return { success: true, docId: docRef.id };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { success: false, error: "Failed to add item to the database." };
  }
}

export type UpdateContentItemData = Omit<ContentItem, 'createdAt' | 'tags'> & { 
    lessonId?: string | null;
    tags: string[]; // Coming in as an array of names from the form
};

export async function updateContentItemAction(item: UpdateContentItemData) {
  if (!item || !item.id) {
    return { success: false, error: "Invalid item data for update." };
  }

  const { id, lessonId, tags: tagNames, ...itemData } = item;
  
  const tagIds = await getTagIds(tagNames);
  const docRef = doc(db, CONTENT_COLLECTION, id);

  try {
    await updateDoc(docRef, { ...itemData, tags: tagIds });

    if (lessonId) {
        revalidatePath(`/lessons/${lessonId}`);
    }
    revalidatePath('/');
    revalidatePath('/lessons');

    return { success: true, docId: id };
  } catch (e) {
    console.error("Error updating document: ", e);
    return { success: false, error: "Failed to update item in the database." };
  }
}

export async function deleteContentItemAction(id: string) {
    if (!id) {
        return { success: false, error: "No ID provided for deletion." };
    }

    try {
        const docRef = doc(db, CONTENT_COLLECTION, id);
        // Note: Firestore doesn't automatically delete subcollections. 
        // We've removed the 'tenseAudio' subcollection, so no cascading delete is needed here anymore.
        // If other subcollections are added in the future, they would need to be handled.
        await deleteDoc(docRef);

        revalidatePath('/');
        revalidatePath('/lessons');
        
        return { success: true };
    } catch (e) {
        console.error("Error deleting document: ", e);
        return { success: false, error: "Failed to delete item." };
    }
}


// --- Lesson Actions ---

export async function createLessonAction(formData: FormData) {
    const name = formData.get('name') as string;
    const date = formData.get('date') as string;

    if (!name || !date) {
        return { success: false, error: 'Name and date are required.' };
    }

    try {
        await addDoc(collection(db, LESSONS_COLLECTION), {
            name,
            date: new Date(date),
            notes: formData.get('notes') || '',
        });
        revalidatePath('/lessons');
        return { success: true };
    } catch (e) {
        console.error('Error creating lesson:', e);
        return { success: false, error: 'Failed to create lesson.' };
    }
}

export async function updateLessonAction(id: string, formData: FormData) {
    if (!id) {
        return { success: false, error: 'No lesson ID provided for update.' };
    }
    const name = formData.get('name') as string;
    const date = formData.get('date') as string;

    if (!name || !date) {
        return { success: false, error: 'Name and date are required.' };
    }

    try {
        const lessonRef = doc(db, LESSONS_COLLECTION, id);
        await updateDoc(lessonRef, {
            name,
            date: new Date(date),
            notes: formData.get('notes') || '',
        });
        revalidatePath('/lessons');
        revalidatePath(`/lessons/${id}`);
        return { success: true };
    } catch (e) {
        console.error('Error updating lesson:', e);
        return { success: false, error: 'Failed to update lesson.' };
    }
}

export async function deleteLessonAction(id: string) {
    if (!id) {
        return { success: false, error: "No lesson ID provided for deletion." };
    }

    try {
        await runTransaction(db, async (transaction) => {
            const lessonRef = doc(db, LESSONS_COLLECTION, id);
            
            // Step 1: Delete the lesson document itself
            transaction.delete(lessonRef);

            // Step 2: Query for all content items associated with this lesson
            const contentQuery = query(collection(db, CONTENT_COLLECTION), where("lessonIds", "array-contains", id));
            const contentSnapshot = await getDocs(contentQuery);

            // Step 3: Remove the lessonId from each associated content item
            contentSnapshot.forEach(docSnap => {
                const currentLessonIds = docSnap.data().lessonIds || [];
                const updatedLessonIds = currentLessonIds.filter((lessonId: string) => lessonId !== id);
                
                transaction.update(doc(db, CONTENT_COLLECTION, docSnap.id), { lessonIds: updatedLessonIds });
            });
        });

        revalidatePath('/lessons');
        return { success: true };
    } catch (e) {
        console.error("Error deleting lesson and updating content: ", e);
        return { success: false, error: "Failed to delete lesson." };
    }
}


// --- Database Seeding Action ---

// Helper function to deserialize Firestore data, converting objects back to Timestamps
const deserializeFirestoreData = (data: any) => {
    for (const key in data) {
      if (data[key] && typeof data[key] === 'object' && '_seconds' in data[key] && '_nanoseconds' in data[key]) {
        data[key] = new Timestamp(data[key]._seconds, data[key]._nanoseconds);
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        deserializeFirestoreData(data[key]); // Recurse for nested objects/arrays
      }
    }
    return data;
  };

export async function seedDatabaseAction() {
    const demoDataPath = path.join(process.cwd(), 'src', 'demo');
    const collectionsToSeed = ['categories', 'tags', 'lessons', 'content'];

    try {
        const batch = writeBatch(db);

        for (const collectionName of collectionsToSeed) {
            const filePath = path.join(demoDataPath, `${collectionName}.json`);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const documents = JSON.parse(fileContent);

            for (const docData of documents) {
                const { _id, ...data } = docData;
                if (!_id) {
                    console.warn(`Skipping document in ${collectionName} because it's missing '_id'.`);
                    continue;
                }
                const docRef = doc(db, collectionName, _id);
                const deserializedData = deserializeFirestoreData(data);
                batch.set(docRef, deserializedData);
            }
        }
        
        await batch.commit();

        revalidatePath('/');
        revalidatePath('/lessons');
        return { success: true };
    } catch (e) {
        console.error("Error seeding database: ", e);
        return { success: false, error: "Failed to seed the database." };
    }
}
