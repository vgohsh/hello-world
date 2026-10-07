# Speak Up English

A web app for practising confident spoken English (CEFR B1–B2). Learners listen to model
speech, shadow it, role-play real situations and get instant feedback on their speaking.
Everything runs in the browser, with no backend and no API keys.

**Version 0.1:** Module 1 (Lessons 1–4) has full content. Lessons 5–15 are listed as *Coming soon*.

## Features

- **15-lesson course** in 4 modules. Lessons unlock in order, or you can turn on "Unlock all lessons".
- **Each lesson has five tabs**
  - *Learn:* an explanation and vocabulary
  - *Phrases:* key phrases with audio
  - *Listen:* a model dialogue with a different voice for each speaker, plus pronunciation drills
  - *Practice:* shadowing, role-play and free speaking
  - *Quiz:* five questions; a score of 3/5 or more completes the lesson
- **Speaking feedback**, calculated on the device:
  - transcript, and a word-by-word comparison with the target sentence (accuracy %)
  - words per minute (the target is 120–160)
  - filler words (*um, uh, like, you know, basically…*)
  - long pauses, detected from the microphone's loudness
  - a 1–5 star score and 2–3 concrete tips
  - playback of the learner's own recording
- **Progress page:** lessons completed, average stars, accuracy, and trends for pace and filler words, plus a daily streak.
- **Settings:** American or British accent, voice, speaking speed, dark or light theme, and a progress reset.
- Progress is saved in `localStorage`. If storage is blocked, the app still works but forgets progress on reload.

## Getting started

```bash
cd speak-up-english
npm install
npm run dev       # http://localhost:5173/hello-world/
npm test          # unit tests (Vitest) for the scoring logic
npm run build     # type-check, then production build in dist/
npm run preview   # serve the production build
```

The app uses the microphone, so open it on `localhost` or over HTTPS.

## Deploying to GitHub Pages

`.github/workflows/deploy-speak-up-english.yml` builds and deploys the app whenever
`speak-up-english/` changes on `main`.

1. In the repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
2. Push to `main`, or run the workflow by hand from the Actions tab.
3. The site goes live at `https://<user>.github.io/<repo>/`.

The base path comes from the repository name through `BASE_PATH`. Locally it defaults
to `/hello-world/` (see `vite.config.ts`). Routing uses hash URLs (`#/lesson/1`), so
page refreshes work on GitHub Pages.

## Browser support

| Feature | Chrome / Edge | Safari | Firefox |
|---|---|---|---|
| Text to speech (listening) | ✅ | ✅ | ✅ |
| Speech recognition (automatic feedback) | ✅ | ⚠️ partial | ❌ |
| Recording and playback | ✅ | ✅ | ✅ |

Without speech recognition, the app switches to **record and self-assess** mode: learners
play back their recording and rate themselves. Pause detection still works in this mode.
In Chrome, speech recognition goes through Google's online speech service, so the device
needs an internet connection.

## Project structure

```
src/
  data/lessons.ts          ← all course content (modules and lessons)
  types/lesson.ts          ← lesson data types
  lib/scoring.ts           ← transcript diff, WPM, fillers, pauses, feedback (pure, tested)
  lib/dates.ts             ← streak calculation (tested)
  lib/storage.ts           ← safe localStorage helpers
  hooks/
    useProgress.tsx        ← progress and settings context (persisted)
    useSpeechSynthesis.ts  ← text to speech, voice selection, queued playback
    useSpeechRecognition.ts← speech to text (Web Speech API)
    useRecorder.ts         ← MediaRecorder and loudness levels for pause detection
  components/              ← SpeakRecorder, FeedbackPanel, ListenButton, charts…
  pages/                   ← Home, Course, Lesson (+ tabs), Progress, Settings
```

## How to add a new lesson

All content lives in `src/data/lessons.ts`. To publish a lesson, for example Lesson 5:

1. Find its entry, which currently looks like this:
   ```ts
   { id: 5, moduleId: 2, title: 'Tell Stories People Remember', durationMin: 13, status: 'coming-soon' },
   ```
2. Change `status` to `'available'` and add a `content` object. Use Lessons 1–4 as
   templates. The `LessonContent` type in `src/types/lesson.ts` defines the shape:

   | Field | What to write |
   |---|---|
   | `goal` | One sentence: what the learner will be able to do |
   | `explanation` | 3–4 short paragraphs (150–250 words in total) |
   | `keyPhrases` | 8–12 items with `{ phrase, example, note? }` |
   | `vocabulary` | about 8 items with `{ word, meaning, example }` |
   | `pronunciation` | `{ title, explanation, drills: [{ text, hint }] }` |
   | `dialogue` | `{ title, scene, speakers: [...], lines: [{ speaker, text }] }` |
   | `shadowing` | about 6 sentences to repeat |
   | `rolePlay` | `{ title, situation, turns: [{ prompt, suggestions: [...] }] }` |
   | `freeSpeaking` | `{ prompt, tips, minSeconds, maxSeconds }` |
   | `quiz` | 5 questions: `multiple-choice` (`options`, `answerIndex`) or `fill-blank` (`question` with `___`, `answers`) |

3. Run `npm run build`. TypeScript reports any missing or misspelled fields.

You don't need to change any components. The course list, unlocking, progress and tabs
all pick up the new lesson automatically.
