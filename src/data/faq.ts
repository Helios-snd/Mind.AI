// FAQ questions grouped by category. Answers are pending.

export type FaqCategory = { category: string; questions: string[] };

export const faqCategories: FaqCategory[] = [
  {
    category: "Getting started",
    questions: [
      "What is Mind.AI?",
      "How does Mind.AI help students?",
      "Is Mind.AI a therapist?",
      "Can I use Mind.AI anonymously?",
    ],
  },
  {
    category: "Privacy & support",
    questions: [
      "Is my information private?",
      "When should I seek human support?",
      "How does crisis support work?",
    ],
  },
  {
    category: "Your information",
    questions: [
      "What happens to my information?",
      "Who can see what I share?",
      "Can I change or delete my information?",
    ],
  },
];
