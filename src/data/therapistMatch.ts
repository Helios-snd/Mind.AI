// Pre-assessment shown at /find-your-doctor before the user browses experts.
// Answers are collected client-side only; no scoring/matching is wired yet.
// Wording modelled on common therapist-matching intake flows (BetterHelp,
// Mental Health Match, Octave, TherapyMantra/Manastha).

export type MatchQuestion = { q: string; options: string[] };

export const matchQuestions: MatchQuestion[] = [
  {
    q: "Where would you like to meet your therapist?",
    options: ["Online", "In person", "No preference"],
  },
  {
    q: "What would you most like support with right now?",
    options: [
      "Anxiety or constant worry",
      "Low mood or depression",
      "Stress or burnout",
      "Relationship or family difficulties",
      "Grief, trauma or a painful past",
      "Something else / I'm not sure yet",
    ],
  },
  {
    q: "How long have you been feeling this way?",
    options: [
      "Less than a month",
      "1–6 months",
      "6–12 months",
      "More than a year",
      "It comes and goes",
    ],
  },
  {
    q: "How much is it affecting your day-to-day life?",
    options: [
      "Barely",
      "Somewhat — I'm mostly managing",
      "A lot — it's hard to get through the day",
      "It changes from day to day",
    ],
  },
  {
    q: "Have you worked with a therapist before?",
    options: [
      "No, this would be my first time",
      "Yes, in the past",
      "Yes, and I'm looking to switch",
    ],
  },
  {
    q: "Which language would you be most comfortable having sessions in?",
    options: [
      "English",
      "Hindi",
      "Bengali",
      "Another regional language",
      "No preference",
    ],
  },
  {
    q: "Do you have a preference for your therapist's gender?",
    options: ["A woman", "A man", "No preference"],
  },
  {
    q: "What kind of therapist tends to work best for you?",
    options: [
      "Someone who mostly listens and lets me talk it through",
      "Someone who gives practical tools and exercises",
      "Someone structured who sets goals each session",
      "Not sure — help me decide",
    ],
  },
  {
    q: "When are you usually free for sessions?",
    options: [
      "Weekday mornings",
      "Weekday afternoons",
      "Weekday evenings",
      "Weekends",
      "My schedule is flexible",
    ],
  },
  {
    q: "How soon would you like to begin?",
    options: [
      "As soon as possible",
      "Within the next week or two",
      "I'm just exploring for now",
    ],
  },
];
