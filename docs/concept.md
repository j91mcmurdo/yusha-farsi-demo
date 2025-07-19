# Overall Concept: Yusha's Farsi Journey

The "Yusha Farsi Journey" app is a personal, interactive tool to aid in the Farsi learning process. It provides a platform for adding, organizing, and viewing Farsi vocabulary and grammar in a visually appealing format. It is enhanced with AI-powered features to accelerate content creation and provide interactive practice.

## Core Features

- **Centralized Content Grid:** The primary method for displaying learned content is a dynamic masonry grid, which arranges cards of different heights and types.
- **Rich Content Types:** The application supports multiple types of learning items to capture various aspects of the language:
    - **Words & Phrases:** For core vocabulary.
    - **Verbs:** For managing and displaying complex conjugations.
    - **Cultural Notes:** For capturing grammar rules, etiquette, and other important information.
    - **Dialogues:** For studying conversational exchanges.
- **In-Page Content Management:** A Floating ActionButton (FAB) with a "speed dial" menu allows for adding all content types directly from the main page via a pop-up dialog.
- **AI-Powered Content Generation:** The application uses Genkit to:
    - Automatically translate English/Finglish entries into Farsi script.
    - Suggest the most appropriate grammatical category for a new word.
    - Generate a comprehensive set of conversational, Tehrani-dialect verb conjugations from a single infinitive verb.
- **Interactive Audio:** Each card features audio playback for Farsi text, generated on-demand by ElevenLabs and cached in Firebase Storage for efficiency.
- **Lesson-Based Workflow:** Content can be grouped into lessons, reviewed in a dedicated lesson view, and then "published" to the main grid.
- **AI Conversation Practice:** A dedicated section allows for interactive, voice-enabled conversations with an AI partner across various real-world scenarios, complete with scoring and detailed feedback.
- **Knowledge Testing:** A configurable quiz feature allows for testing knowledge of the learned content.

## Organization and Filtering

To make the learning content manageable, items are organized using two distinct methods:

- **Categories:** Represent grammatical classifications (e.g., 'Noun', 'Verb', 'General'). Items can be filtered by category.
- **Tags:** Represent thematic groupings (e.g., 'Food', 'Animals', 'Colours'). Items can be filtered by tag.

## Styling

The app employs a calm and visually appealing color palette with a light sand background, dark brown text, and accents of sage mint, spearmint, and clay pink. The 'Aref Ruqaa Ink' font is used consistently for both English and Farsi text to maintain a unified look.
