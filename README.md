# Yusha's Farsi Journey 🇮🇷

Welcome to Yusha's Farsi Journey! This is a feature-rich, AI-powered web application built to make learning Farsi an interactive and engaging experience. It's built entirely within **Firebase Studio**, showcasing a modern web development workflow.

## ✨ Features

-   **🤖 AI Conversation Practice**: Have interactive, voice-enabled conversations with an AI partner in various real-world scenarios (e.g., at a restaurant, with family) and receive detailed feedback on your performance.
-   **📝 Rich Content Management**: Add and manage various content types including words, phrases, verbs, cultural notes, and multi-line dialogues.
-   **🧠 AI-Powered Content Creation**:
    -   **Farsi Translation**: Automatically generate Farsi script from English and Finglish for words, phrases, and dialogue lines.
    -   **Verb Conjugations**: Generate full, conversational verb conjugations from a single infinitive.
    -   **Category Suggestions**: Let AI suggest the best grammatical category for your new words.
-   **🔊 ElevenLabs Audio Playback**: Hear the correct pronunciation for every word, phrase, and verb tense, generated and cached on demand.
-   **📚 Lesson-Based Workflow**: Group content into lessons, review them, and 'publish' them to the main grid.
-   **🧪 Interactive Quiz**: Test your knowledge with a configurable quiz on the content you've learned.
-   **🎨 Beautiful & Responsive UI**: Built with ShadCN UI and Tailwind CSS for a clean, modern, and mobile-friendly design.
-   **🔍 Powerful Filtering**: Easily search and filter all content by text, category, or tag.

## 🚀 Tech Stack

This project leverages a modern, server-centric tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **IDE**: [Firebase Studio](https://firebase.google.com/studio)
-   **Hosting**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
-   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
-   **File Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
-   **AI Orchestration**: [Genkit](https://firebase.google.com/docs/genkit)
-   **Generative AI**: [Google Gemini](https://ai.google.dev/)
-   **Text-to-Speech**: [ElevenLabs](https://elevenlabs.io/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---

## 🛠️ Getting Started

Follow these steps to get the application running locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   An active [Firebase](https://firebase.google.com/) project.
-   An [ElevenLabs](https://elevenlabs.io/) account.
-   A [Google AI Studio](https://aistudio.google.com/) account.

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone https://github.com/your-username/yusha-farsi-journey.git
cd yusha-farsi-journey
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Set Up Environment Variables 🔑

This is the most important step! You need to get API keys from Firebase, Google, and ElevenLabs.

Create a new file named `.env.local` in the root of your project directory. Then, copy and paste the following content into it:

```env
# Firebase Configuration - Found in your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google AI (Gemini) API Key
GOOGLE_API_KEY=

# ElevenLabs API Key and Voice ID
ELEVEN_LABS_API_KEY=
ELEVEN_LABS_VOICE_ID=
```

Now, let's find the values for each of these variables.

#### A. Finding your Firebase Credentials

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Click the **Gear icon** ⚙️ next to "Project Overview" and select **Project settings**.
4.  In the "General" tab, scroll down to the "Your apps" section.
5.  Click on the **Web app** (`</>`) you have registered.
6.  In the "Firebase SDK snippet" section, select **Config**.
7.  You will see an object with all the necessary keys. Copy the values into your `.env.local` file.

**Important Note:** After setting up your Firebase project, make sure you enable **Firestore** and **Firebase Storage**.

*   Go to the "Build" section in your Firebase console.
*   Click on "Firestore Database" and create a database. For initial setup and testing, you can start in **test mode**, which allows open access. **Do not use test mode for a production application.**
*   Click on "Storage" and create a storage bucket. You can accept the default security rules for now.

#### B. Finding your Google AI (Gemini) Key

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Click on **"Get API key"** in the top left.
3.  Click **"Create API key in new project"**.
4.  Copy the generated API key and paste it as the `GOOGLE_API_KEY` value.

#### C. Finding your ElevenLabs Key and Voice ID

1.  Log in to your [ElevenLabs](https://elevenlabs.io/) account.
2.  Click on your profile icon in the top-right corner and select **Profile + API Key**.
3.  Copy your **API Key** and paste it as the `ELEVEN_LABS_API_KEY` value.
4.  Go to the [Voice Lab](https://elevenlabs.io/voice-lab).
5.  Find a voice you like, click the **"Add to VoiceLab"** button, and then **"Add Voice"**.
6.  In your VoiceLab, find the voice you just added and click on its name.
7.  Click the **"ID"** button next to the voice's name to copy the Voice ID.
8.  Paste this ID as the `ELEVEN_LABS_VOICE_ID` value.

### 4. Run the Development Server

Once your `.env.local` file is complete, you can start the application:

```bash
npm run dev
```

The application should now be running at `http://localhost:9002`. Enjoy exploring your Farsi Journey! 🎉

---

## 🚧 Common Issues & Troubleshooting

If you run into problems after setting up the project, check these common issues.

### 1. Firestore Indexing Errors

**Symptom:** When you first run the application and try to filter or sort content, you might see an error in your browser's developer console or in the terminal where `npm run dev` is running. The error message will mention a "failed precondition" and will include a long URL.

**Solution:** This is expected. Firestore requires composite indexes for complex queries (like filtering by both category and tags).

1.  **Copy the entire URL** from the error message. It will look something like `https://console.firebase.google.com/v1/r/project/...`.
2.  **Paste the URL** into your web browser and hit Enter.
3.  This will take you directly to the index creation screen in the Firebase console with all the required fields pre-filled.
4.  Click **"Create Index"**. The index will take a few minutes to build. Once it's enabled, the feature will work correctly.

### 2. ElevenLabs Audio Not Playing

**Symptom:** When you click the audio playback button on a word or phrase, nothing happens, or you see a network error in the developer console related to an ElevenLabs API call.

**Solution:** This often happens for users on the free tier of ElevenLabs. The free tier has strict usage policies and may block API requests originating from server environments (like a Next.js application).

1.  **Check your ElevenLabs account status.**
2.  If you are on the free tier, **upgrade to a paid plan** (e.g., the "Starter" plan). This almost always resolves the issue immediately.
