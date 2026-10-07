# Chant Tibetan · 藏文念诵

A web app (installable, works offline) that teaches English- and Chinese-speaking Buddhists to chant texts in Tibetan. The first full lesson is the Vajrasattva Hundred-Syllable Mantra (金刚萨埵百字明咒), with a short Om Mani Padme Hung lesson to introduce the format.

> **All content is marked unverified.** Pronunciations, Chinese phonetics and meanings must be checked by a qualified teacher before the app is shared. See [Teacher verification checklist](#teacher-verification-checklist).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/, including the service worker
npm run preview    # serve dist/ on http://localhost:4173
```

Checks:

```bash
npm run lint
npm run typecheck
npm test           # unit tests (Vitest)
npm run e2e        # browser tests (Playwright); builds and serves the app itself
```

If Playwright can't download its browser, point it at an installed Chromium with `CHROMIUM_PATH=/path/to/chrome npm run e2e`.

## What's in it

| Area | Where |
|---|---|
| Lesson reader: tap any syllable for Tibetan, Wylie, Sanskrit, Tibetan and Sanskrit readings, Chinese phonetics, the word's meaning and how the letters stack | `src/pages/Reader.tsx`, `src/components/SyllableSheet.tsx` |
| Player: karaoke highlighting, 0.5×/0.75×/1×, phrase loop, A–B repeat, call and response, lock-screen controls, screen kept awake | `src/lib/audioEngine.ts`, `src/components/PlayerBar.tsx` |
| Script: stack decoder and reading drill per text; alphabet course; syllable anatomy viewer | `src/pages/ScriptTab.tsx`, `Alphabet.tsx`, `Anatomy.tsx`, `src/lib/tibetan.ts` |
| Memorize: fill the gaps, chain building, chant from memory (peeks counted); daily spaced review (SM-2) | `src/pages/Memorize.tsx`, `Review.tsx`, `src/lib/srs.ts` |
| Record and compare with the reference: waveform, length and pace | `src/pages/Record.tsx` |
| Practice: mala counter, guided session (refuge → mantra → dedication), accumulation tracker with streaks and CSV export, daily reminder | `src/pages/Mala.tsx`, `Session.tsx`, `Tracker.tsx`, `src/lib/reminder.ts` |
| Teacher tool: tap along to a recording to time every syllable | `src/pages/Align.tsx` |

### Languages

The app starts in **English**. The `EN | 中文` switch in the header (also in Settings) changes everything except Tibetan text to **Simplified Chinese**, takes effect at once, and is remembered. Interface text lives in `src/locales/en.json` and `src/locales/zh-Hans.json`. A unit test fails if a key is in one file and not the other, or if the code uses a key that doesn't exist.

The **Chinese phonetics line** (汉字 + pinyin) is a separate setting: on by default in Chinese, off in English, and either can be changed.

### Pronunciation

The Hundred-Syllable Mantra is Sanskrit written in Tibetan script. Each syllable has two readings and Settings chooses which one is shown and spoken:

- **Tibetan** (default): how it is chanted in Tibetan Buddhism, e.g. *benza sato*, *suto kayo*.
- **Sanskrit**: the restored original, e.g. *vajrasattva*, *sutoshyo*.

## Content

Each text is a JSON file in `src/content/`. Files are checked against the schema in `src/lib/content.ts` when the app loads and again in the tests.

```
Text     id, title {en, zh, bo}, kind, description, practiceNotes, audio, verified, verifyNotes, phrases[]
Phrase   id, tib, iast, wylie, phon {tibetan, sanskrit}, phonZh, phonPinyin, gloss {en, zh}, syllables[], audio?
Syllable tib, wylie, iast, phon {tibetan, sanskrit}, phonZh, phonPinyin,
         word? {tib, iast, gloss {en, zh}}, stack? {parts[], note {en, zh}}, audio? {start, end}
```

`zh` is always Simplified Chinese. `phrase.tib` must equal its syllables joined with ་ and ended with །.

### Adding a text

1. Create `src/content/<id>.json` following the model above. Every meaning needs both `en` and `zh`. Set `"verified": false` and list open questions in `verifyNotes`.
2. Import it in `src/lib/content.ts` and add it to `RAW_TEXTS`.
3. For a mantra, add a default goal in `src/lib/useMantras.ts` if 100,000 isn't right.
4. Run `npm test`. The content tests check the structure, the translations and the tsheg joining.

### Recording and aligning audio

There are no real recordings yet. Until there are, the app uses the browser's speech synthesis, clearly labelled **Placeholder voice**. It is not an authentic pronunciation.

To add a recording:

1. Record a qualified chanter reading the whole text at a steady pace, ideally once slowly and once at normal speed.
2. Open **Settings → Teacher tools → Audio alignment** (`/tools/align`), choose the text and load the file.
3. Press **Space** to play, then press **Space** at the start of each syllable. Press it once more where the last syllable ends.
4. Drag region edges on the waveform to fine-tune them.
5. **Use in the app on this device** to try it straight away (stored in the browser), or **Export JSON**.
6. To ship it to everyone: put the audio in `public/audio/<id>.m4a`, set `"audio": {"src": "/audio/<id>.m4a", "credit": "…"}` on the text, and copy each syllable's `start`/`end` from the export into its `audio` field. Once every syllable has timings, the app uses the recording instead of the placeholder voice.

## Teacher verification checklist

For each text, a qualified teacher should confirm:

- [ ] The Tibetan spelling matches the lineage's text (see `verifyNotes`, e.g. phrase 8 མེ/མྨེ and phrase 10 ཤྲི་ཡཿ).
- [ ] The **Tibetan** reading of every syllable is how this lineage chants it.
- [ ] The **Sanskrit** reading is acceptable, or the option should be hidden for this text.
- [ ] The Chinese phonetics (汉字 and pinyin) lead a Chinese speaker to the right sounds.
- [ ] Word and phrase meanings, in English and Chinese, match the commentary the lineage uses.
- [ ] The practice notes (Four Opponent Powers, visualization, counts) are correct and appropriately worded.
- [ ] The refuge and dedication prayers in the guided session (`src/content/prayers.ts`) are the versions the lineage uses.
- [ ] Recordings, once added, are by a chanter the teacher approves, and the alignment sounds right at 0.5× speed.

When everything is confirmed, set `"verified": true` and empty `verifyNotes`. The "Unverified" badges then disappear for that text.

## Privacy and storage

Everything stays on the device. Nothing is uploaded and there are no accounts.

- Progress, review schedule, counts, goals, recordings and aligned audio are stored in IndexedDB (Dexie, `src/lib/db.ts`).
- Settings are stored in `localStorage` so the saved language can be applied before the first screen renders.
- **Settings → Delete all my data** clears both.

## Known limitations

- **No authentic audio yet.** The placeholder voice is an English speech synthesizer reading the phonetics.
- **No automatic pronunciation scoring.** Speech recognition for Tibetan isn't reliable enough. Record-and-compare shows waveforms, length and pace only.
- **Volume buttons can't count mala beads.** Browsers don't give web pages those keys. Tap or press Space instead.
- **Reminders need the app open.** Without a push server, they only fire while the app or its tab is running.
- **The anatomy viewer can be wrong on rare three-letter syllables** that standard spelling rules leave ambiguous. Sanskrit syllables are shown letter by letter instead.
- **No PWA score from Lighthouse.** Lighthouse 12+ dropped that category. The manifest, service worker and offline loading are covered by the Playwright tests. On sampled pages Lighthouse 13 gives accessibility, best practices and SEO 100 and performance 86–96 (simulated slow phone).
