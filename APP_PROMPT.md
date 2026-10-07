# Prompt: Build "SpeakUp", an iOS English Speaking Coach

Copy everything below the line into Claude Code.

---

Build a native iOS app called **SpeakUp** that teaches people to speak English confidently. The course is about real-world communication (charisma, confidence, conversation), not grammar drills. Learners practise by **speaking out loud** and get feedback.

## Tech stack
- Swift 5.9+, **SwiftUI**, iOS 17+ deployment target, MVVM.
- **SwiftData** for local persistence (progress, recordings metadata, streaks).
- Apple frameworks only for v1: `Speech` (SFSpeechRecognizer, on-device when available), `AVFoundation` (AVAudioRecorder, AVAudioPlayer, AVSpeechSynthesizer).
- No third-party dependencies. Generate the Xcode project with **XcodeGen** (`project.yml`) so the repo has no hand-edited `.pbxproj`. Include a `README.md` that explains how to run `xcodegen generate` and open the project in Xcode on a Mac.
- Add `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` to Info.plist.

## Course content (15 lessons, 4 modules)
Store lesson content as bundled JSON (`Resources/Lessons/*.json`) so it can be edited without code changes. Write **original** lesson content for each topic below.

**Module 1: Make Your Mark**
1. First Impression Hacks (15 min)
2. Build Trust with Your Voice (11 min)
3. Confidence Wins (10 min)
4. Speak Up in Any Room (10 min)

**Module 2: Connect & Influence**
5. Storytelling Secrets (13 min)
6. Body Language (15 min)
7. Read People Like a Pro (15 min)
8. Give Tough Feedback Fast (17 min)

**Module 3: Handle Hard Moments**
9. Handle Difficult People Smartly (15 min)
10. Say "No" and Be Likable (10 min)
11. Interrupt Smoothly (10 min)
12. Defuse Any Conflict (13 min)

**Module 4: Everyday Mastery**
13. Listen Like a Leader (11 min)
14. Small Talk Magic (12 min)
15. The Power of a Perfect Pause (12 min)

Each lesson JSON contains:
- `id`, `module`, `title`, `durationMinutes`, `summary`
- `keyIdeas`: 3–5 short teaching points
- `phrases`: 8–12 useful English phrases, each with `text`, `meaning`, `exampleSentence`
- `listenAndRepeat`: 5 sentences the learner hears (TTS) and then repeats
- `rolePlay`: one scenario with a setting, the other person's lines, and suggested responses
- `speakingChallenge`: an open-ended prompt (e.g. "Introduce yourself to a new colleague in 30 seconds")
- `quiz`: 3 multiple-choice questions

## Screens
1. **Onboarding**: welcome, pick English level (Beginner / Intermediate / Advanced), set a daily goal (5/10/15 min), request mic and speech permissions with a clear explanation.
2. **Home**: greeting, streak counter, daily goal ring, "Continue lesson" card, list of modules with lessons (locked/unlocked/completed state, duration, progress). Unlock lessons in order; let users unlock all in Settings.
3. **Lesson detail**: tabs or steps through: Learn (key ideas) → Phrases (tap to hear TTS) → Listen & Repeat → Role-play → Speaking Challenge → Quiz.
4. **Listen & Repeat**: play the sentence with AVSpeechSynthesizer (adjustable speed 0.75x / 1x), record the learner, transcribe with SFSpeechRecognizer, then show a word-by-word comparison (matched words in green, missed or wrong words in red) and an accuracy score.
5. **Speaking Challenge**: countdown timer, live waveform while recording, then a results card with transcript, **words per minute**, **filler word count** ("um", "uh", "like", "you know", "so", "basically"), **pause count** (gaps over 1.5 s from speech timestamps), and speaking duration. Let the learner play their recording back and retry.
6. **Role-play**: chat-style screen; the app speaks the other person's line, the learner answers by voice, and the transcript appears as a bubble. Show suggested responses as a hint.
7. **Progress**: total minutes practised, lessons completed, streak history (calendar), average accuracy, WPM trend and filler-word trend charts (Swift Charts).
8. **Settings**: voice accent (US/UK/AU from AVSpeechSynthesisVoice), speech rate, daily reminder (UserNotifications), reset progress, unlock all lessons.

## Architecture
- `Models/` – Lesson, Module, Phrase, Quiz (Codable); SwiftData models: LessonProgress, PracticeAttempt, DailyActivity.
- `Services/` – `LessonRepository` (loads JSON), `SpeechRecognizer` (async/await wrapper around SFSpeechRecognizer with partial results and segment timestamps), `AudioRecorder`, `TextToSpeech`, `SpeechAnalyzer` (WPM, fillers, pauses, word-diff scoring; pure Swift, no UI dependencies), `StreakService`, `NotificationService`.
- `ViewModels/` – one per screen, `@Observable`.
- `Views/` – grouped by feature; shared components (PrimaryButton, ProgressRing, WaveformView, ScoreBadge).
- Handle denied permissions, no speech recognised, and recognizer unavailable cases with friendly messages.

## Design
- Look: premium and calm. Dark charcoal background, white serif display font for titles (e.g. New York), SF Pro for body, one warm accent colour (gold/amber). Support Light and Dark mode.
- Large tap targets, a big round mic button with a pulse animation while recording, haptic feedback on record start/stop and quiz answers.
- Support Dynamic Type and VoiceOver labels on all controls.

## Testing
- Unit tests (XCTest) for `SpeechAnalyzer` (WPM, filler detection, pause detection, word-diff scoring), `StreakService`, and `LessonRepository` (all 15 JSON files decode and every lesson has the required sections).
- SwiftUI previews for every screen with mock data.

## Optional v2 (structure the code so this is easy to add later; do not build it yet)
- AI conversation partner and personalised feedback via the Claude API, called through a small backend proxy so no API key ships in the app.
- Pronunciation scoring per phoneme.
- iCloud sync of progress.

## Deliverables
1. Complete, compiling SwiftUI source for all screens and services.
2. All 15 lesson JSON files with full original content.
3. `project.yml`, Info.plist, asset catalog with accent colour and app icon placeholder.
4. Unit tests.
5. README with setup steps, architecture overview, and how to add a new lesson.

Work in steps: scaffold the project and models first, then services with tests, then screens, then lesson content. Commit after each step.
