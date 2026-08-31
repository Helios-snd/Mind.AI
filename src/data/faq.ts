// Question list captured from /faq. Answers are collapsed on the live site and
// were not captured — fill from the Mind.AI content team.

export type FaqCategory = { category: string; questions: string[] };

export const faqCategories: FaqCategory[] = [
  {
    category: "Generic",
    questions: [
      "What is Mind.AI?",
      "How do I sign up on the Mind.AI platform?",
      "How old do I need to be to use Mind.AI’s services?",
      "What makes Mind.AI different from other mental health platforms?",
    ],
  },
  {
    category: "Therapy",
    questions: [
      "What types of therapy are available?",
      "How do I book a therapy session?",
      "Are therapy sessions confidential?",
    ],
  },
  {
    category: "Community",
    questions: [
      "How can I join the community events?",
      "What is the Mind.AI community feed?",
      "Can I remain anonymous in the community?",
    ],
  },
  {
    category: "Technical",
    questions: [
      "How do I reset my password?",
      "What should I do if I encounter a technical issue?",
      "Is Mind.AI compatible with mobile devices?",
    ],
  },
];
