# Admin Functionality

The admin functionality of this application provides a user interface for managing all learning content. Content is added via a dialog-based form, which is opened from a Floating ActionButton (FAB) on the main screen. This approach removes the need for a separate admin page and allows for content to be added directly from any context.

## Content Types
The application supports a variety of content types to capture different aspects of language learning:
*   **Word:** An individual vocabulary item.
*   **Phrase:** A common expression or group of words.
*   **Verb:** A verb with its full set of conjugations.
*   **Cultural Note:** A text card for explaining cultural nuances, grammar rules, or other notes.
*   **Dialogue:** A multi-line conversation between speakers.

## Admin UI

The admin interface is composed of two main parts: a Floating Action Button and a Dialog Form.

*   **Floating ActionButton (FAB):** A "speed dial" FAB is fixed to the bottom-right of the screen. Clicking the main button reveals options to add each of the content types listed above.
*   **Admin Dialog:** Selecting an option from the FAB opens a modal dialog containing the `AdminForm`.
*   **Dynamic Form:** The form within the dialog is dynamic, showing different fields based on the selected content type.

### Form Fields

*   **Content Type Selection:** Determined by which button is clicked on the FAB.
*   **Common Fields (for words, phrases, verbs):** Input fields for `english`, `finglish`, `farsi` (with an option to trigger AI population), `category` (dropdown with AI suggestion), and `tags` (comma-separated input).
*   **Notes Field:** An optional `notes` textarea appears for words, phrases, and verbs.
*   **Verb Conjugation Section:** When 'verb' is selected, a dedicated section appears allowing the admin to add multiple conjugation entries.
*   **Cultural Note Fields:** Fields for a `title` and markdown-enabled `content`.
*   **Dialogue Fields:** Fields for a `title` and a dynamic list of dialogue lines, each with fields for `speaker`, `english`, `finglish`, and `farsi`.

## AI Integration

The admin UI leverages Genkit Server Actions to streamline content creation:

1.  **Farsi Translation:** A button next to the `farsi` input field (on words, phrases, and individual dialogue lines) triggers an AI call to generate the Farsi script based on the provided `english` and `finglish` text.
2.  **Category Suggestion:** A "magic wand" button next to the category dropdown uses AI to suggest the most appropriate category for the given English word, based on the predefined list of categories.
3.  **Verb Conjugation Generation:** For verbs, a dedicated button triggers an AI call to generate a full list of conversational, Tehrani-dialect conjugations based on the verb's infinitive form. The form is then automatically populated with the generated data, which can be reviewed and edited before submission.

All content is stored in the Firebase Firestore `content` collection.
