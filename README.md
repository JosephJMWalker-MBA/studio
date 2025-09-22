# Decision Flipper

Welcome to Decision Flipper! This is a fun and interactive web application built with Next.js that helps you make decisions when you're feeling indecisive. Just type or speak your question, and let AI and a bit of luck guide you!

## Features

-   **AI-Powered Suggestions**: Enter a question, and the app uses Google's Gemini AI to generate two creative, personalized options for you—one for "heads" and one for "tails".
-   **Bring Your Own Key (BYOK)**: To keep this app accessible for everyone without incurring API costs for the developer, it requires you to use your own Gemini API key. Your key is stored securely in your browser's local storage.
-   **Voice Dictation**: Use the microphone button to speak your question directly into the app.
-   **Interactive UI**: A sleek and modern interface with an animated coin flip.

## Getting Started

1.  **Get a Gemini API Key**: You'll need a Google Gemini API key to use the app's generative AI features. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Enter Your Key**: Click the settings icon (⚙️) in the top-right corner of the app. Paste your API key into the input field and click "Save Key".
3.  **Ask and Flip**: Type or dictate your question, click the "Flip for it!" button, and see what fate decides for you!

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **AI**: [Google's Genkit](https://firebase.google.com/docs/genkit) with the Gemini model
-   **UI**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)