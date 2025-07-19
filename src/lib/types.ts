

import { z } from "zod";

// Define Zod Schemas for core data structures

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Tag = z.infer<typeof TagSchema>;

// Lesson Schema
export const LessonSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.date(),
  notes: z.string().optional(),
  type: z.literal('lesson').default('lesson'), // Add type for store differentiation
});
export type Lesson = z.infer<typeof LessonSchema>;


// Define VerbConjugation Schema and Type
export const VerbConjugationSchema = z.object({
  person: z.number().nullable(),
  formal: z.boolean(),
  plural: z.boolean(),
  tense: z.string(),
  farsi: z.string(),
  english: z.string(),
  finglish: z.string(),
  stem: z.string().nullable(),
});
export type VerbConjugation = z.infer<typeof VerbConjugationSchema>;

// Define DialogueLine Schema
export const DialogueLineSchema = z.object({
  speaker: z.string().optional(),
  english: z.string(),
  finglish: z.string(),
  farsi: z.string(),
});
export type DialogueLine = z.infer<typeof DialogueLineSchema>;

// Schema for messages in the AI Practice Chat
export const DialogueMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
  finglish: z.string().optional(),
});
export type DialogueMessage = z.infer<typeof DialogueMessageSchema>;

// Schema for AI Persona
export const PersonaSchema = z.object({
  name: z.string(),
  role: z.string(),
});
export type Persona = z.infer<typeof PersonaSchema>;

// Schema for the final evaluation of a practice session
export const EvaluationSchema = z.object({
    objective: z.object({
        feedback: z.string().describe("Detailed feedback on whether the user met their objective, and how they could improve.")
    }),
    formality: z.object({
        score: z.number().min(1).max(5).describe("A score from 1 to 5 on the user's use of formality and tone."),
        feedback: z.string().describe("Detailed feedback on the user's tone and formality.")
    }),
    grammar: z.object({
        score: z.number().min(1).max(5).describe("A score from 1 to 5 on the user's spelling and grammar."),
        feedback: z.string().describe("Detailed feedback on the user's grammar and spelling.")
    }),
    taarof: z.object({
        feedback: z.string().describe("Detailed feedback on the user's use of taarof.")
    }),
    overall: z.object({
        feedback: z.string().describe("General, encouraging feedback on the user's performance and suggestions for improvement.")
    })
});
export type EvaluationOutput = z.infer<typeof EvaluationSchema>;


// Define Base Content Item Schema with common fields
const BaseContentItemSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  tags: z.array(z.string()).optional(), // Tag IDs
  tagNames: z.array(z.string()).optional(), // Resolved tag names
  status: z.enum(['draft', 'published']),
  lessonIds: z.array(z.string()).optional(),
});

// Schemas for items with Farsi/English/Finglish
const TranslatableItemSchema = BaseContentItemSchema.extend({
  english: z.string(),
  finglish: z.string(),
  farsi: z.string(),
  // For backwards compatibility during transition
  audioUrl: z.string().optional(), 
  // The new reference to a document in the /recordings collection
  recordingId: z.string().optional(),
});


// Define Specific Content Schemas
export const WordSchema = TranslatableItemSchema.extend({
 type: z.literal('word'),
 notes: z.string().optional(),
 category: z.string(),
 categoryName: z.string().optional(),
});

export const PhraseSchema = TranslatableItemSchema.extend({
 type: z.literal('phrase'),
 notes: z.string().optional(),
});

export const VerbSchema = TranslatableItemSchema.extend({
  type: z.literal('verb'),
  conjugations: z.array(VerbConjugationSchema),
  category: z.string(),
  categoryName: z.string().optional(),
  notes: z.string().optional(),
});

export const CulturalNoteSchema = BaseContentItemSchema.extend({
    type: z.literal('cultural_note'),
    title: z.string(),
    content: z.string(),
});

export const DialogueSchema = BaseContentItemSchema.extend({
    type: z.literal('dialogue'),
    title: z.string(),
    dialogue: z.array(DialogueLineSchema),
    notes: z.string().optional(),
});


// Define ContentItem as a discriminated union based on the 'type' field
export const ContentItemSchema = z.discriminatedUnion('type', [
  WordSchema,
  PhraseSchema,
  VerbSchema,
  CulturalNoteSchema,
  DialogueSchema,
]);

// Export inferred types
export type ContentItem = z.infer<typeof ContentItemSchema>;
export type Word = z.infer<typeof WordSchema>;
export type Phrase = z.infer<typeof PhraseSchema>;
export type Verb = z.infer<typeof VerbSchema>;
export type CulturalNote = z.infer<typeof CulturalNoteSchema>;
export type Dialogue = z.infer<typeof DialogueSchema>;


// --- Form Validation Schemas ---

const BaseFormSchema = z.object({
  id: z.string().optional(),
  tags: z.string().transform(val => val.split(',').map(tag => tag.trim()).filter(Boolean)),
  status: z.enum(['draft', 'published']),
});

const WordFormSchema = (isLessonContext: boolean) => BaseFormSchema.extend({
  type: z.literal('word'),
  english: z.string().min(1, "English is required"),
  finglish: z.string().min(1, "Finglish is required"),
  farsi: z.string(),
  notes: z.string().optional(),
  category: isLessonContext ? z.string().optional() : z.string().min(1, "Category is required"),
});

const PhraseFormSchema = () => BaseFormSchema.extend({
  type: z.literal('phrase'),
  english: z.string().min(1, "English is required"),
  finglish: z.string().min(1, "Finglish is required"),
  farsi: z.string(),
  notes: z.string().optional(),
});

const VerbFormSchema = (isLessonContext: boolean) => BaseFormSchema.extend({
  type: z.literal('verb'),
  english: z.string().min(1, "English is required"),
  finglish: z.string().min(1, "Finglish is required"),
  farsi: z.string(),
  category: isLessonContext ? z.string().optional() : z.string().min(1, "Category is required"),
  notes: z.string().optional(),
  conjugations: z.array(z.object({
    person: z.string().nullable(),
    formal: z.boolean(),
    plural: z.boolean(),
    tense: z.string().min(1, "Tense is required"),
    farsi: z.string().min(1, "Farsi is required"),
    english: z.string().min(1, "English is required"),
    finglish: z.string().min(1, "Finglish is required"),
    stem: z.string().nullable(),
  })).optional(),
});

const CulturalNoteFormSchema = () => BaseFormSchema.extend({
  type: z.literal('cultural_note'),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

const DialogueLineFormSchema = z.object({
    speaker: z.string().optional(),
    english: z.string().min(1, "English is required"),
    finglish: z.string().min(1, "Finglish is required"),
    farsi: z.string(), // Farsi can be empty as it can be AI-generated
});

const DialogueFormSchema = () => BaseFormSchema.extend({
  type: z.literal('dialogue'),
  title: z.string().min(1, "Title is required"),
  dialogue: z.array(DialogueLineFormSchema).min(1, "At least one dialogue line is required."),
  notes: z.string().optional(),
});


// Dynamic schema for the admin form
export const ContentItemFormValuesSchema = (type: ContentItem['type'], isLessonContext: boolean) => {
  switch(type) {
    case 'word': return WordFormSchema(isLessonContext);
    case 'phrase': return PhraseFormSchema();
    case 'verb': return VerbFormSchema(isLessonContext);
    case 'cultural_note': return CulturalNoteFormSchema();
    case 'dialogue': return DialogueFormSchema();
    default: throw new Error(`Unknown content type for form schema: ${type}`);
  }
};
