# KrishiMitrr — Kisan Ka AI Dost

A Next.js agriculture chatbot for Indian farmers. Chat with an AI that helps on crops, irrigation, pests, and more.

## Features

- **WhatsApp-style chat UI** — Clean, mobile-friendly interface
- **Streaming responses** — Replies stream in real time from the Gemini API
- **Secure** — API key is only used on the server; never exposed to the browser
- **Session history** — Conversation is kept in memory for the current session
- **Mobile responsive** — Works on phones and desktops

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set your API key

Create a file named `.env.local` in the project root.

**Option A — Google AI Studio (ai.google.dev)**  
Get a key from [Google AI Studio](https://aistudio.google.com/apikey):

```env
GEMINI_API_KEY=your_key_here
```

**Option B — Google Cloud (Vertex AI)**  
If your key is from [Google Cloud](https://console.cloud.google.com/apis/credentials) (Vertex AI / Express mode), use:

```env
GOOGLE_API_KEY=your_google_cloud_key_here
GOOGLE_GENAI_USE_VERTEXAI=true
```

Optional for Vertex (if not using Express mode defaults):

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
```

The app supports both: it uses **@google/genai** and switches to Vertex when `GOOGLE_GENAI_USE_VERTEXAI=true`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

## Deploy on Netlify

1. Push the repo to GitHub (or another Git provider).
2. In Netlify: **Add new site → Import an existing project** and select the repo.
3. Build settings are read from `netlify.toml` (build command, publish directory, Next.js plugin).
4. In **Site settings → Environment variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: your Gemini API key
5. Deploy. The Next.js plugin will run the build and serve the app.

## Project structure

```
app/
  page.tsx           # Main chat UI
  api/
    chat/
      route.ts       # Server-side Gemini API (key never sent to browser)
components/
  ChatBox.tsx        # Message list + typing indicator
  Message.tsx        # Single message bubble
  InputBar.tsx       # Input field + send button
```

## Notes

- `.env.local` is in `.gitignore` — never commit your API key.
- The bot only answers agriculture-related questions and refuses off-topic ones.
- Replies follow the user’s language (Hindi / English / Hinglish).
