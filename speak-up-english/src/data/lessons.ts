import type { Lesson, Module } from '../types/lesson'

export const modules: Module[] = [
  { id: 1, title: 'Make an Impression', description: 'Introduce yourself well, sound credible and speak up with confidence.' },
  { id: 2, title: 'Communicate with Influence', description: 'Stories, body language, reading people and giving feedback.' },
  { id: 3, title: 'Navigate Tough Talks', description: 'Challenging people, saying no, interrupting and resolving disagreements.' },
  { id: 4, title: 'Build Real Connections', description: 'Listening, small talk and the power of the pause.' },
]

export const lessons: Lesson[] = [
  // ───────────────────────────── Module 1 ─────────────────────────────
  {
    id: 1,
    moduleId: 1,
    title: 'Make Your First 30 Seconds Count',
    durationMin: 15,
    status: 'available',
    content: {
      goal: 'Introduce yourself clearly and warmly in under 30 seconds, and start a conversation that keeps going.',
      explanation: [
        'People form a first impression very quickly, often before you finish your second sentence. The good news is that you can prepare those sentences. A strong introduction is not long or clever. It is clear, friendly and easy to reply to.',
        'Use a simple three-part formula: Name → Role → Hook. First, say your name slowly and clearly ("Hi, I\'m Daniel Park"). Second, say what you do in plain words, not a job title nobody understands ("I help small shops sell online"). Third, add a hook: a short detail or question that gives the other person something to say ("…and I\'m here because I\'m curious about the new AI tools. What brings you here?").',
        'Three habits make a big difference. Smile before you speak, because a smile changes the sound of your voice. Repeat the other person\'s name once ("Nice to meet you, Sarah"). It helps you remember it, and it makes them feel noticed. Finish with a question so the conversation moves back to them.',
        'Avoid apologising for your English ("Sorry, my English is bad"). It sets a negative tone. If you need a moment, say "Let me think how to say this" and smile. In this lesson you will practise ready-to-use phrases, the word stress of common introduction words, and a short networking conversation.',
      ],
      keyPhrases: [
        { phrase: "Hi, I'm … — nice to meet you.", example: "Hi, I'm Maria Lopez — nice to meet you." },
        { phrase: 'I work in … / I work as a …', example: 'I work in logistics, mostly on the planning side.' },
        { phrase: 'Basically, I help … (to) …', example: 'Basically, I help hospitals reduce waiting times.' },
        { phrase: "I'm responsible for …", example: "I'm responsible for our customer training programme." },
        { phrase: 'What brings you here today?', example: "So, what brings you here today?", note: 'A great open question for events.' },
        { phrase: 'How do you know [host]?', example: 'How do you know Priya?' },
        { phrase: "I don't think we've met. I'm …", example: "I don't think we've met. I'm Tom, from the design team." },
        { phrase: "It's great to finally meet you in person.", example: "It's great to finally meet you in person after all those emails!" },
        { phrase: 'Sorry, could you say your name again?', example: 'Sorry, could you say your name again? I want to get it right.' },
        { phrase: "I've heard a lot about …", example: "I've heard a lot about your project in Singapore." },
      ],
      vocabulary: [
        { word: 'first impression', meaning: 'the opinion people form when they meet you for the first time', example: 'A warm smile helps you make a good first impression.' },
        { word: 'approachable', meaning: 'friendly and easy to talk to', example: 'She seems very approachable, so let\'s go and say hello.' },
        { word: 'background', meaning: 'your education and work experience', example: 'My background is in finance, but now I work in HR.' },
        { word: 'to network', meaning: 'to meet people who may help you professionally', example: 'I came to the conference mainly to network.' },
        { word: 'to break the ice', meaning: 'to say something that makes people feel relaxed at the start', example: 'He broke the ice by joking about the long coffee queue.' },
        { word: 'colleague', meaning: 'a person you work with', example: 'Let me introduce my colleague, Ahmed.' },
        { word: 'to follow up', meaning: 'to contact someone again after a first meeting', example: "I'll follow up with an email next week." },
        { word: 'in a nutshell', meaning: 'in a few words; to summarise', example: 'In a nutshell, I make complex data easy to understand.' },
      ],
      pronunciation: {
        title: 'Word stress in self-introductions',
        explanation:
          'In English, one syllable in each word is LOUDER, LONGER and HIGHER. If you stress the wrong syllable, people may not understand you even when every sound is correct. Listen and repeat. The stressed syllable is in CAPITALS.',
        drills: [
          { text: 'Nice to meet you.', hint: 'nice to MEET you' },
          { text: 'I work in marketing.', hint: 'MAR-ke-ting' },
          { text: "I'm an engineer.", hint: 'en-gi-NEER' },
          { text: "I'm a manager.", hint: 'MA-na-ger' },
          { text: 'I work in development.', hint: 'de-VE-lop-ment' },
          { text: "I'm responsible for the company's finances.", hint: 're-SPON-si-ble · COM-pa-ny · FI-nan-ces' },
          { text: 'This is my colleague.', hint: 'COL-league' },
          { text: "I'm a photographer.", hint: 'pho-TO-gra-pher (not PHO-to-gra-pher)' },
        ],
      },
      dialogue: {
        title: 'Meeting someone at a networking event',
        scene: 'A business breakfast. Elena is standing near the coffee table. James walks over.',
        speakers: ['James', 'Elena'],
        lines: [
          { speaker: 'James', text: "Hi there. I don't think we've met. I'm James." },
          { speaker: 'Elena', text: "Hi James, I'm Elena. Nice to meet you." },
          { speaker: 'James', text: 'Nice to meet you too, Elena. So, what brings you here this morning?' },
          { speaker: 'Elena', text: "Mostly the talk on remote teams. I manage a team that's spread across four countries, so it's very relevant. How about you?" },
          { speaker: 'James', text: "Same talk, actually! I work in IT support. Basically, I help companies set up the tools their remote staff use every day." },
          { speaker: 'Elena', text: 'Oh, interesting. Then you probably hear a lot of complaints about video calls!' },
          { speaker: 'James', text: 'Ha, every single day. Which tools does your team use?' },
          { speaker: 'Elena', text: "Mainly chat and video, but we're struggling with time zones. Maybe I can pick your brain after the talk?" },
          { speaker: 'James', text: "Sure, I'd be happy to. Here's my card, and it's great to meet you, Elena." },
        ],
      },
      shadowing: [
        "Hi, I'm James. Nice to meet you.",
        'So, what brings you here this morning?',
        'Basically, I help companies work better together.',
        "It's great to finally meet you in person.",
        "Sorry, could you say your name again? I want to get it right.",
        "I'd be happy to talk more after the presentation.",
      ],
      rolePlay: {
        title: 'Your first conversation at a conference',
        situation: 'You are at an industry conference. A friendly stranger starts talking to you during the coffee break. Answer each question out loud.',
        turns: [
          {
            prompt: "Hi! I don't think we've met. I'm Sam.",
            suggestions: [
              "Hi Sam, I'm Lina. Nice to meet you.",
              "Hello Sam, nice to meet you. I'm Victor, from Lisbon.",
            ],
          },
          {
            prompt: 'So, what do you do?',
            suggestions: [
              'I work in finance. Basically, I help small companies plan their budgets.',
              "I'm a software developer. In a nutshell, I build apps for hospitals.",
            ],
          },
          {
            prompt: 'Oh, interesting. And what brings you to the conference?',
            suggestions: [
              "I'm here to learn about new trends and, honestly, to meet people like you!",
              'My manager recommended the talk on leadership, so I came to hear it. How about you?',
            ],
          },
          {
            prompt: "Well, it's been great talking to you. Maybe we can stay in touch?",
            suggestions: [
              "Definitely. Let's connect online. I'll follow up with a message this week.",
              "I'd like that. Here's my card. It was really nice meeting you, Sam.",
            ],
          },
        ],
      },
      freeSpeaking: {
        prompt: 'Record a 30–45 second self-introduction for a networking event. Use the Name → Role → Hook formula and end with a question.',
        tips: ['Smile before you start.', 'Explain your job in plain words, not a job title.', 'Finish with a question like "What brings you here?"'],
        minSeconds: 30,
        maxSeconds: 60,
      },
      quiz: [
        {
          type: 'multiple-choice',
          question: 'Which is the best way to end a short self-introduction?',
          options: ['"…and that\'s all about me."', '"…sorry, my English is not good."', '"…so, what brings you here today?"', '"…okay, finished."'],
          answerIndex: 2,
          explanation: 'A question passes the conversation back to the other person and keeps it going.',
        },
        {
          type: 'fill-blank',
          question: "I don't think we've ___. I'm Tom.",
          answers: ['met'],
          explanation: '"I don\'t think we\'ve met" is a polite way to start talking to someone new.',
        },
        {
          type: 'multiple-choice',
          question: 'Where is the stress in "engineer"?',
          options: ['EN-gi-neer', 'en-GI-neer', 'en-gi-NEER'],
          answerIndex: 2,
          explanation: 'Words ending in -eer are stressed on the last syllable: en-gi-NEER, ca-REER, vo-lun-TEER.',
        },
        {
          type: 'multiple-choice',
          question: 'You did not hear someone\'s name. What should you say?',
          options: ['"What?"', '"Sorry, could you say your name again?"', '"Your name is difficult."', 'Say nothing and hope it comes up later.'],
          answerIndex: 1,
          explanation: 'Asking again is polite and shows you care about getting it right.',
        },
        {
          type: 'fill-blank',
          question: 'In a ___, I help companies use their data better.',
          answers: ['nutshell'],
          explanation: '"In a nutshell" means "to summarise in a few words".',
        },
      ],
    },
  },
  {
    id: 2,
    moduleId: 1,
    title: 'Sound Credible: Tone, Pace & Warmth',
    durationMin: 11,
    status: 'available',
    content: {
      goal: 'Use intonation and a steady pace so that you sound sure, friendly and trustworthy.',
      explanation: [
        'Listeners judge you on how you say something, not only on what you say. The same sentence can sound confident or unsure depending on the music of your voice. That music is called intonation.',
        'Falling intonation (the voice goes down at the end) sounds certain and complete. Use it for statements, facts, and wh- questions such as "Where are you based?". Rising intonation (the voice goes up) sounds open or unfinished. Use it for yes/no questions ("Are you ready?") and to show interest ("Really?").',
        'Pace matters too. Many learners speak fast because they are nervous or want to "sound fluent". But fast speech with unclear words is harder to trust. A comfortable pace for presentations and meetings is about 120–160 words per minute. Slow down for the most important words, such as numbers, names and your main point, and pause briefly after them.',
        'Warmth comes from small things: a smile in your voice, the listener\'s name, and softening phrases like "I\'d suggest…" instead of "You must…". In this lesson you will practise falling and rising tones, control your pace, and record yourself giving a short update.',
      ],
      keyPhrases: [
        { phrase: 'The key point is …', example: 'The key point is that we can save two weeks.' },
        { phrase: 'Let me be clear about …', example: 'Let me be clear about the deadline: it is Friday.' },
        { phrase: "I'm confident that …", example: "I'm confident that the new process will work." },
        { phrase: "To put it simply, …", example: 'To put it simply, we need more people on this project.' },
        { phrase: "Here's what I recommend.", example: "Here's what I recommend: we test it with one team first." },
        { phrase: "I'd suggest …", example: "I'd suggest we move the meeting to Thursday.", note: 'Softer than "You should…".' },
        { phrase: 'That\'s a fair point.', example: "That's a fair point. Let me look into it." },
        { phrase: "I hear what you're saying.", example: "I hear what you're saying, and I understand the concern." },
        { phrase: 'Let me walk you through it.', example: 'Let me walk you through the new budget.' },
        { phrase: 'Just to recap, …', example: 'Just to recap, we agreed on three next steps.' },
      ],
      vocabulary: [
        { word: 'credible', meaning: 'easy to believe and trust', example: 'Clear numbers make your argument more credible.' },
        { word: 'tone', meaning: 'the feeling or attitude in your voice', example: 'Her tone was calm but firm.' },
        { word: 'pace', meaning: 'how fast or slowly you speak', example: 'Slow your pace when you give important information.' },
        { word: 'intonation', meaning: 'how your voice goes up and down when you speak', example: 'Falling intonation makes a statement sound certain.' },
        { word: 'to reassure', meaning: 'to make someone feel less worried', example: 'He reassured the client that the delivery was on time.' },
        { word: 'monotone', meaning: 'a flat voice with no change in pitch', example: 'A monotone voice can make listeners lose interest.' },
        { word: 'to emphasise', meaning: 'to give special importance to something', example: 'Emphasise the numbers you want people to remember.' },
        { word: 'sincere', meaning: 'honest and real', example: 'Her apology sounded sincere.' },
      ],
      pronunciation: {
        title: 'Rising vs. falling intonation, and speaking pace',
        explanation:
          '↘ means the voice falls at the end (certain, finished). ↗ means it rises (a yes/no question, or showing interest). Listen to each sentence, notice the arrow, then repeat with the same melody. Speak at a calm, steady speed.',
        drills: [
          { text: 'The project is on schedule.', hint: '↘ falls on "schedule": a confident statement' },
          { text: 'Are you free on Monday?', hint: '↗ rises on "Monday": a yes/no question' },
          { text: 'Where are you based?', hint: '↘ falls on "based": wh- questions usually fall' },
          { text: 'We increased sales by fifteen percent.', hint: '↘ slow down and stress "fifteen percent"' },
          { text: 'Really? That sounds great!', hint: '↗ "Really?" rises, ↘ "great" falls' },
          { text: 'Would you like tea or coffee?', hint: '↗ on "tea", ↘ on "coffee": a choice' },
          { text: "I'm confident that this plan will work.", hint: '↘ steady and falling. Do not rise at the end!' },
        ],
      },
      dialogue: {
        title: 'Giving a project update',
        scene: 'A weekly team meeting. Raj, the team lead, asks Mei for a status update.',
        speakers: ['Raj', 'Mei'],
        lines: [
          { speaker: 'Raj', text: 'Okay Mei, can you give us a quick update on the website project?' },
          { speaker: 'Mei', text: "Sure. The key point is this: we're on schedule for the launch on June the tenth." },
          { speaker: 'Raj', text: "Great. Are there any risks we should know about?" },
          { speaker: 'Mei', text: "One. The payment page still needs testing. To put it simply, if testing slips, the launch slips." },
          { speaker: 'Raj', text: 'I see. What do you recommend?' },
          { speaker: 'Mei', text: "I'd suggest we bring in one extra tester for two weeks. I'm confident that will keep us on track." },
          { speaker: 'Raj', text: "That's a fair point. Let me check the budget this afternoon." },
          { speaker: 'Mei', text: 'Thanks, Raj. Just to recap: on schedule, one risk, and one request, an extra tester.' },
        ],
      },
      shadowing: [
        "The key point is this: we're on schedule.",
        'Are there any risks we should know about?',
        "I'm confident that this plan will work.",
        'To put it simply, we need one more tester.',
        'Let me walk you through the main numbers.',
        'Just to recap, we agreed on three next steps.',
      ],
      rolePlay: {
        title: 'Reassuring a worried client',
        situation: 'You manage a client account. Your client calls because they are worried about a delay. Answer calmly and confidently with falling intonation.',
        turns: [
          {
            prompt: "Hi, I'm a bit worried. I heard the delivery might be late. Is that true?",
            suggestions: [
              "I hear what you're saying, and I understand. Let me be clear: the delivery is still on track for Friday.",
              "Thanks for calling. There was a small delay, but we've already fixed it.",
            ],
          },
          {
            prompt: 'Okay. But what happens if there is another problem?',
            suggestions: [
              "That's a fair point. We have a backup supplier ready, so we can switch within a day.",
              "Here's what I recommend: I'll send you a short update every morning this week.",
            ],
          },
          {
            prompt: 'That would help. Can you summarise what you will do?',
            suggestions: [
              'Just to recap: delivery on Friday, a backup supplier ready, and a daily update from me.',
              'Of course. To put it simply, you will hear from me every day until it arrives.',
            ],
          },
        ],
      },
      freeSpeaking: {
        prompt: 'Give a 45–60 second update on something you are working on (a work project, a study goal or a home project). Include one number, one risk and one recommendation.',
        tips: ['Use falling intonation on your main points.', 'Slow down on the number and pause after it.', 'Use "The key point is…" and "I\'d suggest…".'],
        minSeconds: 45,
        maxSeconds: 75,
      },
      quiz: [
        {
          type: 'multiple-choice',
          question: 'Which intonation usually sounds more certain at the end of a statement?',
          options: ['Rising ↗', 'Falling ↘', 'Flat (monotone)'],
          answerIndex: 1,
          explanation: 'Falling intonation signals that you are sure and that the idea is complete.',
        },
        {
          type: 'multiple-choice',
          question: 'What is a comfortable speaking pace for presentations?',
          options: ['About 60–80 words per minute', 'About 120–160 words per minute', 'About 200–250 words per minute'],
          answerIndex: 1,
          explanation: 'Around 120–160 words per minute is clear and natural for most listeners.',
        },
        {
          type: 'fill-blank',
          question: "Just to ___, we agreed on three next steps.",
          answers: ['recap', 'summarise', 'summarize'],
          explanation: '"Just to recap" introduces a short summary.',
        },
        {
          type: 'multiple-choice',
          question: 'Which phrase sounds softer and warmer?',
          options: ['"You must change the date."', '"I\'d suggest we change the date."', '"Change the date."'],
          answerIndex: 1,
          explanation: '"I\'d suggest…" gives a clear recommendation without sounding like an order.',
        },
        {
          type: 'multiple-choice',
          question: '"Where are you based?" A wh- question usually has…',
          options: ['rising intonation', 'falling intonation'],
          answerIndex: 1,
          explanation: 'Wh- questions (where, what, when, why, how) usually fall at the end.',
        },
      ],
    },
  },
  {
    id: 3,
    moduleId: 1,
    title: 'Speak with Quiet Confidence',
    durationMin: 10,
    status: 'available',
    content: {
      goal: 'Remove weak language and "uptalk" so your ideas sound as strong as they are.',
      explanation: [
        'Confidence in speech is not about being loud. It is about sounding as if you believe what you are saying. Two habits make many speakers sound unsure: weak language and uptalk.',
        'Weak language means extra words that reduce the strength of your message: "I just think maybe…", "This is probably a stupid question, but…", "Sorry, I\'m not sure, but…". Remove them. Say "I think we should…" or simply "We should…". You can still be polite. Politeness comes from your tone and words like "please" and "thanks", not from apologising.',
        'Uptalk is when your voice rises at the end of a statement, so it sounds like a question: "My name is Ana? I work in sales?" Listeners may think you are asking for permission. Practise ending statements with a clear falling tone and a short stop.',
        'Use sentence stress to show what matters. In English we stress the important words, usually nouns, main verbs, adjectives and numbers, and we say the small words (a, the, to, of) quickly. Stressing the right word ("We need it by FRIDAY") makes your message clear and confident. In this lesson you will practise turning weak sentences into strong ones.',
      ],
      keyPhrases: [
        { phrase: 'I believe …', example: 'I believe this is the right approach.' },
        { phrase: 'My recommendation is …', example: 'My recommendation is to launch in two phases.' },
        { phrase: "I'm sure that …", example: "I'm sure that we can finish by Friday." },
        { phrase: 'Based on my experience, …', example: 'Based on my experience, customers prefer a shorter form.' },
        { phrase: 'I have a question about …', example: 'I have a question about the budget.', note: 'Instead of "Sorry, maybe a stupid question…"' },
        { phrase: 'I see it differently.', example: 'I see it differently. I think speed matters more than price here.' },
        { phrase: "Here's my view.", example: "Here's my view: we should hire one senior person, not two juniors." },
        { phrase: 'Let me add one point.', example: 'Let me add one point before we decide.' },
        { phrase: 'I can do that.', example: 'I can do that by Thursday.', note: 'Instead of "I could maybe try…"' },
        { phrase: 'Thanks for waiting.', example: 'Thanks for waiting. Here are the results.', note: 'Instead of "Sorry for being late."' },
      ],
      vocabulary: [
        { word: 'assertive', meaning: 'confident and direct, but still respectful', example: 'Be assertive when you explain what you need.' },
        { word: 'hesitant', meaning: 'slow to speak or act because you are unsure', example: 'He sounded hesitant when he gave the price.' },
        { word: 'to hedge', meaning: 'to avoid giving a clear answer', example: "Don't hedge. Tell them the real deadline." },
        { word: 'uptalk', meaning: 'raising your voice at the end of a statement so it sounds like a question', example: 'Uptalk can make a fact sound like a guess.' },
        { word: 'conviction', meaning: 'a strong belief in something', example: 'She spoke with conviction about the new plan.' },
        { word: 'to undermine', meaning: 'to make something weaker', example: 'Saying "sorry" too often can undermine your message.' },
        { word: 'composed', meaning: 'calm and in control', example: 'He stayed composed during the difficult questions.' },
        { word: 'self-assured', meaning: 'confident in your own abilities', example: 'Her self-assured answer impressed the panel.' },
      ],
      pronunciation: {
        title: 'Sentence stress and avoiding uptalk',
        explanation:
          'Stress the content words (shown in CAPITALS) and say the small words quickly. End every statement with a falling tone ↘. Do not let your voice go up at the end.',
        drills: [
          { text: 'We need the report by Friday.', hint: 'we NEED the REPORT by FRIDAY ↘' },
          { text: 'I believe this is the right decision.', hint: 'i beLIEVE this is the RIGHT deCISion ↘' },
          { text: 'My recommendation is to start next week.', hint: 'my recommenDAtion is to START NEXT WEEK ↘' },
          { text: 'I have a question about the budget.', hint: 'i HAVE a QUEStion about the BUDget ↘ (not ↗)' },
          { text: 'I can finish it by Thursday.', hint: 'i CAN FINish it by THURSday ↘' },
          { text: 'I see it differently.', hint: 'i SEE it DIFFerently ↘' },
          { text: 'This will save us three hours a week.', hint: 'this will SAVE us THREE HOURS a WEEK ↘' },
        ],
      },
      dialogue: {
        title: 'Sharing an idea with your manager',
        scene: 'A one-to-one meeting. Carlos wants to suggest a change to his manager, Grace.',
        speakers: ['Grace', 'Carlos'],
        lines: [
          { speaker: 'Grace', text: 'You said you had an idea about the weekly reports?' },
          { speaker: 'Carlos', text: 'Yes. I believe we can make them much faster. My recommendation is to use one shared template.' },
          { speaker: 'Grace', text: "Hmm. We tried templates before, and people didn't like them." },
          { speaker: 'Carlos', text: "I see it differently. Last time the template had twenty fields. Mine has five." },
          { speaker: 'Grace', text: 'Okay, that is different. How much time would it save?' },
          { speaker: 'Carlos', text: 'Based on my test with my own team, about three hours a week per person.' },
          { speaker: 'Grace', text: "That's significant. Can you show it at Monday's meeting?" },
          { speaker: 'Carlos', text: "I can do that. I'll send you the draft by Friday." },
        ],
      },
      shadowing: [
        'I believe we can make this much faster.',
        'My recommendation is to use one shared template.',
        'I see it differently.',
        'Based on my experience, this will save three hours a week.',
        "I can do that. I'll send it by Friday.",
        'Let me add one point before we decide.',
      ],
      rolePlay: {
        title: 'Making your case',
        situation: 'You want to work from home two days a week. Your manager has some doubts. Answer with strong, clear language: no "just", "maybe" or "sorry".',
        turns: [
          {
            prompt: 'You wanted to talk to me about something?',
            suggestions: [
              "Yes, thanks for your time. I'd like to work from home on Tuesdays and Thursdays.",
              'Yes. My recommendation is that I work from home two days a week.',
            ],
          },
          {
            prompt: "I'm not sure. How do I know the work will get done?",
            suggestions: [
              "That's a fair question. I'll share a short daily update, and my results will stay the same or improve.",
              'Based on the last three months, my output has been highest on quiet days. I can show you the numbers.',
            ],
          },
          {
            prompt: 'What if the team needs you for an urgent meeting?',
            suggestions: [
              "I'll be online all day and can join any call within five minutes.",
              'I can come into the office for anything important. The team can always reach me.',
            ],
          },
          {
            prompt: 'Okay, let us try it for one month.',
            suggestions: [
              "Thank you. I'm sure it will work. Let's review it together at the end of the month.",
              "Great, thanks. I'll send you a short summary after four weeks.",
            ],
          },
        ],
      },
      freeSpeaking: {
        prompt: 'For 30–60 seconds, give your opinion on this question: "Should companies allow a four-day work week?" State your view clearly, give two reasons, and end with a strong final sentence.',
        tips: ['Start with "I believe…" or "My view is…".', 'No "just", "maybe" or "sorry".', 'Make your last sentence fall ↘ and then stop.'],
        minSeconds: 30,
        maxSeconds: 75,
      },
      quiz: [
        {
          type: 'multiple-choice',
          question: 'Which sentence sounds the most confident?',
          options: ['"I just think maybe we could try it?"', '"Sorry, this might be wrong, but…"', '"I think we should try it."'],
          answerIndex: 2,
          explanation: 'Remove weak words like "just" and "maybe". A clear statement sounds more confident.',
        },
        {
          type: 'multiple-choice',
          question: 'What is "uptalk"?',
          options: ['Speaking very loudly', 'Rising intonation at the end of a statement', 'Talking to your manager'],
          answerIndex: 1,
          explanation: 'Uptalk makes a statement sound like a question, which can sound unsure.',
        },
        {
          type: 'fill-blank',
          question: '___ on my experience, customers prefer a shorter form.',
          answers: ['based'],
          explanation: '"Based on my experience" introduces evidence for your opinion.',
        },
        {
          type: 'multiple-choice',
          question: 'Which words do we usually stress in a sentence?',
          options: ['Small words like "a", "the", "to"', 'Content words like nouns, main verbs and numbers', 'Only the first word'],
          answerIndex: 1,
          explanation: 'Content words carry the meaning, so they get the stress.',
        },
        {
          type: 'multiple-choice',
          question: 'Better than "Sorry for being late" is…',
          options: ['"Thanks for waiting."', '"Sorry, sorry, sorry."', '"It wasn\'t my fault."'],
          answerIndex: 0,
          explanation: '"Thanks for waiting" is polite and keeps a positive, confident tone.',
        },
      ],
    },
  },
  {
    id: 4,
    moduleId: 1,
    title: 'Find Your Voice in Meetings',
    durationMin: 10,
    status: 'available',
    content: {
      goal: 'Join the discussion in meetings: add your idea, agree or disagree politely, and interrupt without being rude.',
      explanation: [
        'In many meetings, the people who speak early and clearly have the most influence. If you wait for the "perfect" moment or the perfect sentence, the discussion often moves on without you. Aim to speak in the first ten minutes, even with a short comment. After that, it becomes much easier to speak again.',
        'You don\'t need long speeches. Use short "entry phrases" to take your turn: "Can I add something here?", "Building on what Lisa said…", "Just a quick point…". Then make one clear point and stop.',
        'If someone is speaking for a long time, you can interrupt politely. Use their name, a softening phrase and a short reason: "Sorry to jump in, Mark, but I think that affects the budget." If someone interrupts you, hold your turn calmly: "Let me just finish this point, and then I\'d love to hear your view."',
        'In fast, natural speech, English speakers link words together. "Can I add" sounds like "ca-ni-add", and "Let me just" sounds like "le-me-just". Learning these linked sounds helps you understand native speakers in meetings and sound more natural yourself. In this lesson you will practise meeting phrases and linking.',
      ],
      keyPhrases: [
        { phrase: 'Can I add something here?', example: 'Can I add something here? I think the timeline is too short.' },
        { phrase: 'Building on what [name] said, …', example: 'Building on what Lisa said, we could also ask our customers.' },
        { phrase: 'Sorry to jump in, but …', example: 'Sorry to jump in, but we only have ten minutes left.' },
        { phrase: 'Could I just come in here?', example: 'Could I just come in here? I have some numbers on that.' },
        { phrase: 'Let me just finish this point.', example: "Let me just finish this point, and then I'd love to hear your view." },
        { phrase: 'I agree with … up to a point.', example: 'I agree with Tom up to a point, but the cost is still high.' },
        { phrase: 'I see it slightly differently.', example: 'I see it slightly differently. I think the issue is training, not software.' },
        { phrase: 'Just to clarify, are you saying …?', example: 'Just to clarify, are you saying we should cancel the event?' },
        { phrase: "What's the next step?", example: "Great discussion. So, what's the next step?" },
        { phrase: "I'll take that action.", example: "I'll take that action and report back next week." },
      ],
      vocabulary: [
        { word: 'agenda', meaning: 'the list of topics for a meeting', example: "Let's move to the next item on the agenda." },
        { word: 'to chair (a meeting)', meaning: 'to lead a meeting', example: 'Maria will chair the meeting today.' },
        { word: 'to chime in', meaning: 'to join a conversation with a comment', example: 'Feel free to chime in if you have ideas.' },
        { word: 'to take the floor', meaning: 'to start speaking in a meeting', example: 'After the update, the CEO took the floor.' },
        { word: 'action item', meaning: 'a task someone agrees to do after a meeting', example: 'Each action item needs an owner and a date.' },
        { word: 'to clarify', meaning: 'to make something clearer', example: 'Could you clarify what you mean by "soon"?' },
        { word: 'consensus', meaning: 'agreement by most or all people', example: 'We reached a consensus on the new design.' },
        { word: 'to wrap up', meaning: 'to finish', example: "Let's wrap up. We're almost out of time." },
      ],
      pronunciation: {
        title: 'Linking sounds in meeting phrases',
        explanation:
          'In natural speech, a word ending in a consonant often links to the next word starting with a vowel, and some sounds disappear. The hint shows how it really sounds. Listen, then say each phrase as one smooth chunk.',
        drills: [
          { text: 'Can I add something?', hint: '"ca-ni-ADD something?" ↗' },
          { text: 'Let me just finish this point.', hint: '"le-me-jus FINish this POINT" ↘' },
          { text: 'Could I just come in here?', hint: '"cou-di-jus come-in HERE?" ↗' },
          { text: 'I agree up to a point.', hint: '"I a-GREE u-p-to-a POINT" ↘' },
          { text: 'What is the next step?', hint: '"wha-tsa NEX STEP?": "next step" loses the t' },
          { text: 'Sorry to jump in.', hint: '"SOR-ry-to JUM-pin" ↘' },
          { text: "I'll take that action.", hint: '"I\'ll TAKE tha-TAC-tion" ↘' },
        ],
      },
      dialogue: {
        title: 'A team planning meeting',
        scene: 'A product team plans a new feature. Mark is talking a lot; Aisha wants to make her point.',
        speakers: ['Mark', 'Aisha', 'Lisa'],
        lines: [
          { speaker: 'Lisa', text: "Okay, next on the agenda: the mobile app launch. Mark, you've been looking at the timeline?" },
          { speaker: 'Mark', text: "Yes. I think we can launch in March. The developers are ready, the design is almost done, and marketing wants to start in—" },
          { speaker: 'Aisha', text: "Sorry to jump in, Mark, but could I just add something about testing?" },
          { speaker: 'Mark', text: 'Sure, go ahead.' },
          { speaker: 'Aisha', text: 'I agree with March up to a point. But our last launch had two weeks of testing, and we still found serious bugs.' },
          { speaker: 'Lisa', text: 'Just to clarify, are you saying we should move the date?' },
          { speaker: 'Aisha', text: "Not necessarily. Building on what Mark said, if design finishes this week, we could start testing early and keep March." },
          { speaker: 'Mark', text: "That works for me. I'll talk to the designers today." },
          { speaker: 'Lisa', text: "Great. So, what's the next step?" },
          { speaker: 'Aisha', text: "I'll take that action. I'll send a testing plan by Wednesday." },
        ],
      },
      shadowing: [
        'Can I add something here?',
        'Sorry to jump in, but we only have ten minutes left.',
        'Building on what Lisa said, we could start testing early.',
        'Just to clarify, are you saying we should move the date?',
        "Let me just finish this point, and then I'd love to hear your view.",
        "I'll take that action and send a plan by Wednesday.",
      ],
      rolePlay: {
        title: 'Getting your voice heard',
        situation: 'You are in a team meeting about reducing costs. The app plays your colleagues. Join the discussion with the phrases from this lesson.',
        turns: [
          {
            prompt: 'So I think we should cut the training budget completely. It is the easiest saving, and nobody will notice, and also—',
            suggestions: [
              "Sorry to jump in, but I'm worried about that. Training helps new staff work faster.",
              'Could I just come in here? I see it slightly differently.',
            ],
          },
          {
            prompt: 'Okay, go ahead. What would you suggest instead?',
            suggestions: [
              'Building on the idea of saving money, we could move some training online. It costs much less.',
              'Can I add something here? Our travel costs went up twenty percent. That might be a better place to save.',
            ],
          },
          {
            prompt: 'Hmm, but online training is not very effective, and people never finish the courses, and—',
            suggestions: [
              "Let me just finish this point. If we keep short live sessions, people stay engaged, and it's still cheaper.",
              'I agree up to a point. That\'s why I\'d mix online courses with one live session each month.',
            ],
          },
          {
            prompt: 'Alright, I like that. Who can look into the costs?',
            suggestions: [
              "I'll take that action. I'll compare the options and share them by Friday.",
              "I can do that. Let's review it at next week's meeting.",
            ],
          },
        ],
      },
      freeSpeaking: {
        prompt: 'Imagine a meeting about whether your team should change from weekly meetings to a written update. Record a 30–60 second contribution: use an entry phrase, agree up to a point, add your own idea, and suggest a next step.',
        tips: ['Start with "Can I add something here?" or "Building on what … said…".', 'Make one clear point, not five.', 'Finish with a next step: "I\'ll take that action…".'],
        minSeconds: 30,
        maxSeconds: 75,
      },
      quiz: [
        {
          type: 'multiple-choice',
          question: 'Which is the most polite way to interrupt?',
          options: ['"Stop, I want to talk."', '"Sorry to jump in, but…"', '"You talk too much."'],
          answerIndex: 1,
          explanation: '"Sorry to jump in, but…" is polite and gives a reason.',
        },
        {
          type: 'fill-blank',
          question: '___ on what Lisa said, we could ask our customers.',
          answers: ['building'],
          explanation: '"Building on what [name] said" connects your idea to someone else\'s.',
        },
        {
          type: 'multiple-choice',
          question: 'Someone interrupts you. What can you say?',
          options: ['"Let me just finish this point."', '"Be quiet."', 'Stop and never speak again.'],
          answerIndex: 0,
          explanation: 'Hold your turn calmly and offer to listen afterwards.',
        },
        {
          type: 'multiple-choice',
          question: 'What is an "action item"?',
          options: ['A topic on the agenda', 'A task someone agrees to do after the meeting', 'A short break'],
          answerIndex: 1,
          explanation: 'Action items have an owner and a deadline.',
        },
        {
          type: 'fill-blank',
          question: 'Just to ___, are you saying we should cancel the event?',
          answers: ['clarify', 'check'],
          explanation: '"Just to clarify…" checks that you understood correctly.',
        },
      ],
    },
  },

  // ─────────────── Modules 2–4: coming soon (add content later) ───────────────
  { id: 5, moduleId: 2, title: 'Tell Stories People Remember', durationMin: 13, status: 'coming-soon' },
  { id: 6, moduleId: 2, title: 'Say It Without Words: Posture & Gestures', durationMin: 15, status: 'coming-soon' },
  { id: 7, moduleId: 2, title: 'Pick Up on Unspoken Signals', durationMin: 15, status: 'coming-soon' },
  { id: 8, moduleId: 2, title: 'Deliver Honest Feedback Kindly', durationMin: 17, status: 'coming-soon' },
  { id: 9, moduleId: 3, title: 'Stay Calm with Challenging People', durationMin: 15, status: 'coming-soon' },
  { id: 10, moduleId: 3, title: 'Decline Politely and Keep the Relationship', durationMin: 10, status: 'coming-soon' },
  { id: 11, moduleId: 3, title: 'Jump Into the Conversation Gracefully', durationMin: 10, status: 'coming-soon' },
  { id: 12, moduleId: 3, title: 'Turn Disagreements into Solutions', durationMin: 13, status: 'coming-soon' },
  { id: 13, moduleId: 4, title: 'Active Listening That Builds Trust', durationMin: 11, status: 'coming-soon' },
  { id: 14, moduleId: 4, title: 'Start Conversations with Anyone', durationMin: 12, status: 'coming-soon' },
  { id: 15, moduleId: 4, title: 'Pause for Impact', durationMin: 12, status: 'coming-soon' },
]

export function getLesson(id: number): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

export const availableLessons = lessons.filter((l) => l.status === 'available')
