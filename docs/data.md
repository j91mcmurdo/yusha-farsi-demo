# Data Schema

This document outlines the Firestore data schema used in the Farsi learning application.

## `/content` Collection

This collection stores all learning items. Each document represents a single item and is a discriminated union identified by the `type` field.

### Common Fields (All Types)
- `id` (string): The document ID.
- `type` (string): The type of the learning item ('word', 'phrase', 'verb', 'cultural_note', 'dialogue').
- `tags` (array of strings): An array of **IDs** of the documents in the `/tags` collection.
- `createdAt` (timestamp): The time when the item was added or last updated.
- `status` (string): The publication status of the item ('draft' or 'published').
- `lessonIds` (array of strings): An array of lesson document IDs this item is associated with.

### Translatable Item Fields (`word`, `phrase`, `verb`)
- `english` (string): The English representation of the item.
- `finglish` (string): The Finglish representation of the item.
- `farsi` (string): The Farsi script representation.
- `notes` (string, optional): Optional notes about the item.
- `recordingId` (string, optional): The ID of the document in the `/recordings` collection for the main Farsi text.

### Word-Specific Fields (`word`, `verb`)
- `category` (string): The **ID** of the document in the `/categories` collection.

### Verb-Specific Fields (`verb`)
- `conjugations` (array of objects): An array where each object represents a single conjugated form.
  - `person` (number | null): The grammatical person (1, 2, or 3).
  - `formal` (boolean): If the conjugation is formal.
  - `plural` (boolean): If the conjugation is plural.
  - `tense` (string): The tense or form of the conjugation (e.g., 'Present Simple').
  - `farsi` (string): The conjugated verb form in Farsi script.
  - `english` (string): The English translation of the conjugated form.
  - `finglish` (string): The Finglish representation of the conjugated form.
  - `stem` (string | null): The verb stem used for this conjugation.

### Cultural Note Fields (`cultural_note`)
- `title` (string): The title of the note.
- `content` (string): The main body of the note (supports markdown).

### Dialogue Fields (`dialogue`)
- `title` (string): The title of the dialogue.
- `dialogue` (array of objects): An array where each object is a line in the conversation.
  - `speaker` (string, optional): The name of the speaker.
  - `english` (string): The English line.
  - `finglish` (string): The Finglish transliteration.
  - `farsi` (string): The Farsi script for the line.

---

## Other Collections

### `/recordings` Collection
A centralized, de-duplicated cache of all generated audio files.
- `text` (string): The text that was converted to speech.
- `voiceId` (string): The ElevenLabs voice ID used for generation.
- `url` (string): The public URL to the cached audio file in Firebase Storage.
- `createdAt` (timestamp): When the recording was created.

### `/categories` Collection
Stores predefined grammatical categories.
- `name` (string): The name of the category (e.g., 'Noun', 'Verb').

### `/tags` Collection
Stores predefined thematic tags.
- `name` (string): The name of the tag (e.g., 'Food', 'Colours').

### `/lessons` Collection
Stores information about each lesson.
- `name` (string): The title or topic of the lesson.
- `date` (timestamp): The date the lesson took place.
- `notes` (string, optional): General notes about the lesson.
