export type LessonStatus = 'available' | 'coming-soon'

export interface KeyPhrase {
  phrase: string
  example: string
  note?: string
}

export interface VocabItem {
  word: string
  meaning: string
  example: string
}

export interface PronunciationDrill {
  text: string
  /** Hint shown under the drill, e.g. which syllable to stress. */
  hint: string
}

export interface PronunciationFocus {
  title: string
  explanation: string
  drills: PronunciationDrill[]
}

export interface DialogueLine {
  speaker: string
  text: string
}

export interface Dialogue {
  title: string
  scene: string
  /** Speaker names; index decides which TTS voice is used. */
  speakers: string[]
  lines: DialogueLine[]
}

export interface RolePlayTurn {
  /** What the app says out loud. */
  prompt: string
  /** Example answers shown after the learner speaks. */
  suggestions: string[]
}

export interface RolePlay {
  title: string
  situation: string
  turns: RolePlayTurn[]
}

export interface FreeSpeakingTask {
  prompt: string
  tips: string[]
  minSeconds: number
  maxSeconds: number
}

export type QuizQuestion =
  | {
      type: 'multiple-choice'
      question: string
      options: string[]
      answerIndex: number
      explanation: string
    }
  | {
      type: 'fill-blank'
      /** Use "___" to mark the blank. */
      question: string
      answers: string[]
      explanation: string
    }

export interface LessonContent {
  goal: string
  explanation: string[]
  keyPhrases: KeyPhrase[]
  vocabulary: VocabItem[]
  pronunciation: PronunciationFocus
  dialogue: Dialogue
  shadowing: string[]
  rolePlay: RolePlay
  freeSpeaking: FreeSpeakingTask
  quiz: QuizQuestion[]
}

export interface Lesson {
  id: number
  moduleId: number
  title: string
  durationMin: number
  status: LessonStatus
  /** Present only when status is "available". */
  content?: LessonContent
}

export interface Module {
  id: number
  title: string
  description: string
}
