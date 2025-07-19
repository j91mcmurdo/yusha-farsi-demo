
'use server';
/**
 * @fileOverview Server actions for generating Farsi content using Genkit.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { VerbConjugationSchema } from '@/lib/types';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, setDoc, getDoc, collection, addDoc, query, where, getDocs, writeBatch, documentId } from 'firebase/firestore';


// --- Farsi Translation for single words/phrases ---

const GenerateFarsiInputSchema = z.object({
  english: z.string().describe('The English text to translate.'),
  finglish: z.string().describe('The Finglish transliteration.'),
});
export type GenerateFarsiInput = z.infer<typeof GenerateFarsiInputSchema>;

const GenerateFarsiOutputSchema = z.object({
  farsi: z.string().describe('The Farsi translation.'),
});
export type GenerateFarsiOutput = z.infer<typeof GenerateFarsiOutputSchema>;

const farsiPrompt = ai.definePrompt({
    name: 'farsiPrompt',
    input: { schema: GenerateFarsiInputSchema },
    output: { schema: GenerateFarsiOutputSchema },
    prompt: `Translate the following English text and Finglish transliteration into Farsi script. Provide only the Farsi translation.

English: {{{english}}}
Finglish: {{{finglish}}}

Farsi:`,
});

const generateFarsiFlow = ai.defineFlow(
  {
    name: 'generateFarsiFlow',
    inputSchema: GenerateFarsiInputSchema,
    outputSchema: GenerateFarsiOutputSchema,
  },
  async (input) => {
    const llmResponse = await farsiPrompt(input);
    const output = llmResponse.output;

    if (!output) {
        throw new Error("Failed to generate Farsi translation.");
    }

    return output;
  }
);

export async function generateFarsiAction(input: GenerateFarsiInput): Promise<GenerateFarsiOutput> {
    const validatedInput = GenerateFarsiInputSchema.parse(input);
    return await generateFarsiFlow(validatedInput);
}


// --- Farsi Verb Conjugation Generation ---

const GenerateConjugationsInputSchema = z.object({
  verbEnglish: z.string().describe('The English infinitive form of the verb.'),
  verbFinglish: z.string().describe('The Finglish (pronunciation) of the Farsi infinitive form of the verb.'),
});
export type GenerateConjugationsInput = z.infer<typeof GenerateConjugationsInputSchema>;

// We expect an array of conjugations back from the AI
const GenerateConjugationsOutputSchema = z.object({
    conjugations: z.array(VerbConjugationSchema)
});
export type GenerateConjugationsOutput = z.infer<typeof GenerateConjugationsOutputSchema>;


const conjugationPrompt = ai.definePrompt({
    name: 'conjugationPrompt',
    input: { schema: GenerateConjugationsInputSchema },
    output: { schema: GenerateConjugationsOutputSchema },
    prompt: `You are an expert in Farsi linguistics, specializing in the modern, conversational Tehrani dialect. Given the infinitive form of a Farsi verb in English and Finglish, generate a comprehensive list of its conjugations.

IMPORTANT: The conjugations should be informal and conversational, not formal or written style. For example:
- Use "man mikhaam" not "man mikhaaham".
- Use "shoma mikhaain" not "shoma mikhaahid".
- Prefer suffixes like '-in' instead of '-id'.

Verb (English): {{{verbEnglish}}}
Verb (Finglish): {{{verbFinglish}}}

Please provide the conjugations for the following tenses:
- Present Simple (all persons: 1st/2nd/3rd singular, 1st/2nd/3rd plural)
- Past Simple (all persons)
- Present Continuous (all persons)
- Future (all persons)
- Present Subjunctive (all persons)
- Imperative (singular and plural)

For each conjugation, provide the tense, person (1, 2, or 3, or null for imperative), plural (true/false), formal (true for 2nd person plural, false otherwise), and the Farsi, English, and Finglish text. Also include the present and past stems.
Return the result as a structured JSON object.
`,
});


const generateConjugationsFlow = ai.defineFlow({
    name: 'generateConjugationsFlow',
    inputSchema: GenerateConjugationsInputSchema,
    outputSchema: GenerateConjugationsOutputSchema,
}, async(input) => {
    const llmResponse = await conjugationPrompt(input);
    const output = llmResponse.output;

    if (!output) {
        throw new Error("Failed to generate conjugations.");
    }
    return output;
});

export async function generateConjugationsAction(input: GenerateConjugationsInput): Promise<GenerateConjugationsOutput> {
    const validatedInput = GenerateConjugationsInputSchema.parse(input);
    return await generateConjugationsFlow(validatedInput);
}

// --- ElevenLabs Text-to-Speech Generation & Caching ---

async function findOrCreateRecording(text: string, voiceId: string): Promise<string> {
    const recordingsRef = collection(db, 'recordings');
    const q = query(recordingsRef, where("text", "==", text), where("voiceId", "==", voiceId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Recording already exists
        return querySnapshot.docs[0].id;
    }

    // --- Recording does not exist, create it ---
    const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
    if (!ELEVEN_LABS_API_KEY) {
        throw new Error("Server configuration error for audio generation.");
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to generate audio. Status: ${response.status}. Message: ${errorBody}`);
    }

    const audioBuffer = await response.arrayBuffer();

    // Create a new document in /recordings to get a unique ID for the filename
    const newRecordingRef = doc(collection(db, 'recordings'));
    const storageRef = ref(storage, `audio/${newRecordingRef.id}.mp3`);
    await uploadBytes(storageRef, audioBuffer, { contentType: 'audio/mpeg' });
    const downloadURL = await getDownloadURL(storageRef);

    // Now save the metadata to the new recording document
    await setDoc(newRecordingRef, {
        text,
        voiceId,
        url: downloadURL,
        createdAt: new Date(),
    });

    return newRecordingRef.id;
}


const GetOrCreateAudioInputSchema = z.object({
    docId: z.string(),
    text: z.string(),
    // This supports the transition. Old cards will pass audioUrl.
    // New cards won't pass anything, or will pass recordingId.
    // The action will fetch based on what's available.
    recordingId: z.string().optional(), 
    audioUrl: z.string().optional(), 
});

export async function getOrCreateAudioAction(input: GetOrCreateAudioInputSchema): Promise<{ audioUrl: string }> {
    const { docId, text, recordingId, audioUrl } = GetOrCreateAudioInputSchema.parse(input);

    // Backwards compatibility: If an old audioUrl is passed, just use it.
    if (audioUrl) {
        return { audioUrl };
    }

    // If we have a recordingId, fetch its URL
    if (recordingId) {
        const recordingDoc = await getDoc(doc(db, 'recordings', recordingId));
        if (recordingDoc.exists()) {
            return { audioUrl: recordingDoc.data().url };
        }
    }

    // --- No recording exists for this content item yet. Find or create one. ---
    const ELEVEN_LABS_VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID;
    if (!ELEVEN_LABS_VOICE_ID) {
        throw new Error("Voice ID is not configured.");
    }

    try {
        const newRecordingId = await findOrCreateRecording(text, ELEVEN_LABS_VOICE_ID);

        // Link this new recordingId to the content document
        const contentRef = doc(db, 'content', docId);
        await updateDoc(contentRef, { recordingId: newRecordingId });
        
        // Fetch the new recording's URL to return it
        const newRecordingDoc = await getDoc(doc(db, 'recordings', newRecordingId));
        return { audioUrl: newRecordingDoc.data()?.url };

    } catch (error) {
        console.error("Error in getOrCreateAudioAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while creating the audio.");
    }
}


const GetOrCreateTenseAudioInputSchema = z.object({
    text: z.string(),
});
type GetOrCreateTenseAudioInput = z.infer<typeof GetOrCreateTenseAudioInputSchema>;

export async function getOrCreateTenseAudioAction(input: GetOrCreateTenseAudioInput): Promise<{ audioUrl: string }> {
    const { text } = GetOrCreateTenseAudioInputSchema.parse(input);

    if (!text) {
        throw new Error("Text is required for audio generation.");
    }

    const ELEVEN_LABS_VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID;
    if (!ELEVEN_LABS_VOICE_ID) {
        throw new Error("Voice ID is not configured on the server.");
    }

    try {
        // Find if this exact script has been recorded before with this voice
        const recordingId = await findOrCreateRecording(text, ELEVEN_LABS_VOICE_ID);

        // Fetch the recording's URL to return it
        const recordingDoc = await getDoc(doc(db, 'recordings', recordingId));
        const audioUrl = recordingDoc.data()?.url;

        if (!audioUrl) {
            throw new Error("Failed to retrieve audio URL after creation.");
        }

        return { audioUrl };

    } catch (error) {
        console.error("Error in getOrCreateTenseAudioAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while creating the tense audio.");
    }
}


// --- AI-Powered Category Suggestion ---

const GenerateCategoryInputSchema = z.object({
    english: z.string().describe('The English word/phrase to categorize.'),
    availableCategories: z.array(z.string()).describe('The list of available categories to choose from.'),
});
export type GenerateCategoryInput = z.infer<typeof GenerateCategoryInputSchema>;

const GenerateCategoryOutputSchema = z.object({
    categoryName: z.string().describe('The suggested category for the word/phrase.'),
});
export type GenerateCategoryOutput = z.infer<typeof GenerateCategoryOutputSchema>;


const categoryPrompt = ai.definePrompt({
    name: 'categoryPrompt',
    input: { schema: GenerateCategoryInputSchema },
    output: { schema: GenerateCategoryOutputSchema },
    prompt: `You are an expert linguist. Your task is to categorize an English word or phrase into one of the following available categories.

Available Categories:
{{#each availableCategories}}
- {{{this}}}
{{/each}}

Word/Phrase to categorize: "{{{english}}}"

Based on the word/phrase, which of the available categories is the most appropriate? If none seem to fit well, choose 'Other'. Respond with only the name of the category.`,
});

const generateCategoryFlow = ai.defineFlow({
    name: 'generateCategoryFlow',
    inputSchema: GenerateCategoryInputSchema,
    outputSchema: GenerateCategoryOutputSchema,
}, async(input) => {
    const llmResponse = await categoryPrompt(input);
    const output = llmResponse.output;

    if (!output) {
        throw new Error("Failed to generate a category suggestion.");
    }
    // Rename field for clarity
    return { categoryName: output.categoryName };
});

export async function generateCategoryAction(input: GenerateCategoryInput): Promise<GenerateCategoryOutput> {
    const validatedInput = GenerateCategoryInputSchema.parse(input);
    return await generateCategoryFlow(validatedInput);
}
