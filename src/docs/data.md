# Data Schema

This document outlines the Firestore data schema used in the Farsi learning application.

## `/content` Collection

This collection stores all learning items, including words, phrases, and verbs. Each document represents a single learning item.

- `id` (string): The document ID.
- `type` (string): The type of the learning item ('word', 'phrase', 'verb').
- `english` (string): The English representation of the item.
- `finglish` (string): The Finglish representation of the item.
- `farsi` (string): The Farsi script representation.
- `category` (string): The **ID** of the document in the `/categories` collection.
- `tags` (array of strings): An array of **IDs** of the documents in the `/tags` collection.
- `notes` (string, optional): Optional notes, specific to the 'word' type.
- `createdAt` (timestamp): The time when the item was added or last updated.
- `recordingId` (string, optional): The ID of the document in the `/recordings` collection.
- `status` (string): The publication status of the item ('draft' or 'published').
- `lessonIds` (array of strings): An array of lesson document IDs this item is associated with.

## `/recordings` Collection

This collection stores a centralized, de-duplicated cache of all generated audio files. This prevents multiple API calls for the same text.

- `text` (string): The text that was converted to speech.
- `voiceId` (string): The ElevenLabs voice ID used for generation.
- `url` (string): The public URL to the cached audio file in Firebase Storage.
- `createdAt` (timestamp): The time the recording was created.

## `/categories` Collection

This collection stores the predefined grammatical categories that can be assigned to learning items. The document ID is used as a foreign key in the `content` collection.

- `name` (string): The name of the grammatical category (e.g., 'Noun', 'Verb', 'General').

## `/tags` Collection

This collection stores the predefined thematic tags that can be associated with learning items. The document ID is used as a foreign key in the `content` collection.

- `name` (string): The name of the thematic tag (e.g., 'Food', 'Animals', 'Colours').

## `/lessons` Collection

This collection stores information about each lesson.

- `id` (string): The document ID.
- `name` (string): The title or topic of the lesson.
- `date` (timestamp): The date the lesson took place.
- `notes` (string, optional): General notes related to the lesson.
