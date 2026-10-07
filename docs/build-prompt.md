# Claude Code prompt: Tibetan chanting web app

Paste everything below the line into Claude Code, run from an empty project folder. Attach the screenshot of the 百字明咒 Tibetan text too, so Claude can check the transcription against it.

---

Build a web app that teaches people how to chant Buddhist texts in Tibetan. The users are Chinese- and English-speaking Buddhists who want to chant correctly. Most of them can't read Tibetan script yet. The first and main lesson is the Vajrasattva Hundred-Syllable Mantra (金剛薩埵百字明咒).

## Key domain fact (read before designing)

The 百字明咒 is **Sanskrit written in Tibetan script**, not the Tibetan language. Tibetans read it with their own pronunciation (for example, *vajrasattva* is chanted "benza sato", and ཥ is read "ka", so *sutoṣyo* becomes "suto kayo"). So:
- Every syllable needs several readings: Tibetan script, Wylie, Sanskrit IAST, Tibetan chanting phonetics and Chinese phonetics.
- Users must be able to choose the pronunciation tradition: **Tibetan (default)** or **Sanskrit-restored**.
- The word meanings are Sanskrit glosses.
- Design the data model so later texts that are real Tibetan (refuge prayer, Heart Sutra) fit the same structure.

## Tech stack

- Vite + React + TypeScript, Tailwind CSS, React Router.
- **PWA** (vite-plugin-pwa): installable, works offline, and caches the lesson JSON, fonts and audio.
- Progress, settings and counts stored in IndexedDB (Dexie). No backend and no login for the MVP.
- Fonts: self-host **Noto Serif Tibetan** (via @fontsource) as the main Tibetan font, plus a fallback. Check that stacks such as ཏྭ, ཥྛ, ཀྵ, ཌྷ, ཙྪ, ཉྩ, ཧཱུྃ render correctly in Chrome, Safari and Firefox. Don't rely on system fonts.
- Vitest for unit tests and Playwright for end-to-end tests. If Playwright's own browser download is blocked, use the Chromium that is already installed.
- Mobile-first layout that works one-handed at 375px wide and also looks good on desktop. Support light and dark themes with a calm, temple-like palette (maroon, saffron, off-white). Avoid kitsch.

## Content data model

Keep all content in `src/content/*.json`, validated with Zod at load time. Add new texts without code changes.

```ts
Text {
  id, title: {zh, en, bo}, kind: "mantra" | "prayer",
  description: {zh, en}, practiceNotes: {zh, en},   // context, visualization, Four Opponent Powers
  audio: { src, credit } | null,
  phrases: Phrase[],
  verified: boolean                                 // false until a qualified teacher reviews it
}
Phrase {
  id, tib, iast, wylie,
  phon: { tibetan, sanskrit }, phonZh, phonZhuyin?,
  gloss: { en, zh },                                // phrase meaning
  syllables: Syllable[],
  audio?: { start, end }                            // seconds into Text.audio
}
Syllable {
  tib, wylie, iast, phon: { tibetan, sanskrit }, phonZh,
  word?: { tib, iast, gloss: {en, zh} },            // the word this syllable belongs to
  stack?: { parts: string[], note: {en, zh} },      // e.g. ཏྭ = ཏ + ྭ (wa-zur)
  audio?: { start, end }
}
```

## Seed content: 百字明咒

Use this as the starting text. **Check it against the attached screenshot and standard sources.** Mark anything uncertain with `// TODO verify` and set `verified: false`. Split the text into syllables yourself, then fill in Wylie, Chinese phonetics (漢字 + 注音) and the stack breakdowns.

| # | Tibetan | Sanskrit (IAST) | Tibetan chanting phonetics | Meaning |
|---|---|---|---|---|
| 1 | ཨོཾ་བཛྲ་སཏྭ་ས་མ་ཡ། | oṃ vajrasattva samaya | om benza sato samaya | O Vajrasattva, (honor) the sacred bond |
| 2 | མ་ནུ་པཱ་ལ་ཡ། | manupālaya | manu palaya | protect it |
| 3 | བཛྲ་སཏྭ་ཏྭེ་ནོ་པ་ཏིཥྛ། | vajrasattva tvenopatiṣṭha | benza sato tenopa tishta | as Vajrasattva, remain close to me |
| 4 | དྲྀ་ཌྷོ་མེ་བྷ་ཝ། | dṛḍho me bhava | drido me bhawa | be steadfast for me |
| 5 | སུ་ཏོ་ཥྱོ་མེ་བྷ་ཝ། | sutoṣyo me bhava | suto kayo me bhawa | be well pleased with me |
| 6 | སུ་པོ་ཥྱོ་མེ་བྷ་ཝ། | supoṣyo me bhava | supo kayo me bhawa | nourish (increase) for me |
| 7 | ཨ་ནུ་རཀྟོ་མེ་བྷ་ཝ། | anurakto me bhava | anu rakto me bhawa | love me with care |
| 8 | སརྦ་སིདྡྷི་མྨེ་པྲ་ཡཙྪ། | sarvasiddhiṃ me prayaccha | sarwa siddhi me prayatsa | grant me all accomplishments |
| 9 | སརྦ་ཀརྨ་སུ་ཙ་མེ། | sarvakarmasu ca me | sarwa karma su tsa me | and in all actions |
| 10 | ཙིཏྟཾ་ཤྲེ་ཡཿ་ཀུ་རུ་ཧཱུྃ། | cittaṃ śreyaḥ kuru hūṃ | tsittam shriyam kuru hung | make my mind virtuous, hūṃ |
| 11 | ཧ་ཧ་ཧ་ཧ་ཧོཿ | ha ha ha ha hoḥ | ha ha ha ha ho | (the four immeasurables / joys) |
| 12 | བྷ་ག་ཝཱན། | bhagavān | bhagawan | Blessed One |
| 13 | སརྦ་ཏ་ཐཱ་ག་ཏ། | sarvatathāgata | sarwa tathagata | all the Tathāgatas |
| 14 | བཛྲ་མཱ་མེ་མུཉྩ། | vajra mā me muñca | benza ma me muntsa | vajra, do not abandon me |
| 15 | བཛྲཱི་བྷ་ཝ། | vajrī bhava | benzi bhawa | make me a vajra-holder |
| 16 | མ་ཧཱ་ས་མ་ཡ་སཏྭ། | mahāsamayasattva | maha samaya sato | great being of the sacred bond |
| 17 | ཨཱཿ | āḥ | ah | |

Also add a short **lesson 0: ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ** (Om Mani Padme Hum) that introduces the lesson format.

## Features, in build order

Build in phases. After each phase, run lint, typecheck, unit tests and the app itself, and commit before starting the next one.

### Phase 1: Lesson reader
- Home page: a list of texts with progress for each.
- Text page: phrases shown as cards. Each card has a large Tibetan line and smaller lines for phonetics and meaning.
- **Tap a syllable** to open a bottom sheet with Tibetan, Wylie, IAST, Tibetan and Sanskrit phonetics, Chinese phonetics, the word it belongs to with its gloss, a stack breakdown if any, and a play button.
- A display toggle for each line (Tibetan / phonetics / IAST / Chinese phonetics / meaning), saved in settings.
- Settings: interface language (繁中 / 简中 / English), pronunciation tradition, phonetics script (Latin / 漢字 / 注音), Tibetan font size, and theme.
- A "Practice context" panel showing practiceNotes, plus a respectful note that traditional practice includes receiving transmission (口傳 / lung) from a qualified teacher.

### Phase 2: Audio and karaoke
- One `AudioEngine` wrapping HTMLAudioElement, with playbackRate 0.5–1.0 and `preservesPitch`.
- **Karaoke:** highlight the current syllable using its timestamps, and auto-scroll.
- Loop the current phrase, A–B repeat, and play from any tapped syllable.
- **Call-and-response mode:** play a phrase, pause for (phrase length × 1.2), then play the next.
- Media Session API for lock-screen controls, and the Wake Lock API while practicing.
- **There are no real recordings yet.** Ship clearly labeled placeholder audio. If no audio exists for a phrase, fall back to the browser's speech synthesis with a "placeholder voice" badge. Don't fake authenticity.
- **Alignment tool** (`/tools/align`): load an audio file, play it, and tap the spacebar (or a button) at each syllable to record timestamps. Show the timestamps on a waveform (wavesurfer.js) for fine-tuning, then export JSON in the content format. This is how real recordings get added later.

### Phase 3: Reading the script
- Alphabet course: the 30 consonants and 4 vowel signs, with audio, a grid and quizzes.
- **Syllable anatomy viewer:** a tappable diagram that labels the prefix, superscript, root, subscript, vowel, suffix and second suffix of any syllable.
- **Stack decoder:** every Sanskrit stack in the current text, broken into its parts.
- Reading drills drawn from the current text: show a syllable and ask the user to choose how it's read (multiple choice). Scaffolding fades: phonetics shown, then Wylie only, then script only.

### Phase 4: Memorization
- **Cloze mode:** hide every Nth syllable, then whole words, then whole phrases. Tap to reveal.
- **Chain building:** learn phrase 1, then 1→2, then 1→3, and so on.
- **Chant from memory:** a blank screen with a "peek" button. Count peeks, and track the best runs.
- Spaced repetition (SM-2 or FSRS) at the phrase level. Each day the app shows the phrases due for review.

### Phase 5: Record and compare
- Record with MediaRecorder and play the user's attempt next to the reference.
- Show both waveforms, plus a simple duration and pace comparison for each phrase.
- No automatic pronunciation score: speech recognition for Tibetan is not reliable. Keep the code ready to plug in a scoring model later.
- Recordings stay on the device. Show a clear privacy note.

### Phase 6: Practice tools
- **Digital mala:** targets of 21, 108 or custom. Tap anywhere, press the spacebar or press a volume key to count. Vibration where supported, and a bell at the end of each round. The screen stays awake.
- **Accumulation tracker** for each mantra (for example, a goal of 100,000), with a daily history chart, streaks and an export to CSV.
- **Session flow:** refuge, then mantra × N, then dedication (迴向), with a timer.
- Optional reminders through the Notifications API, with clear handling when the user says no.

## Quality bar

- Accessibility: the Tibetan text has `lang="bo"`, there are aria labels, karaoke can be used with a keyboard, and `prefers-reduced-motion` is respected.
- Unit tests: content validation (every syllable has the required fields, and timestamps increase), the karaoke time→syllable lookup, the SRS scheduler and the mala counter.
- Playwright tests: open a lesson, tap a syllable and see the sheet, change the pronunciation tradition and see the phonetics change, count a full 108 round, and load the app offline.
- Lighthouse PWA and accessibility scores of at least 90.
- A README covering how to run the app, how to add a new text, how to record and align audio, and a **content verification checklist** for a teacher.

## Working agreements

- Before coding, show me the file structure and the data model, and wait for my OK.
- Never invent a meaning or pronunciation and present it as authoritative. Leave a TODO and set `verified: false`, and show an "unverified content" badge in the UI until a teacher signs off.
- At the end of each phase, give me a short summary of what to try in the browser.
