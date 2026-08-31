// Content captured from the live mind.ai service pages (/depression, /anxiety, /adhd).

export type SignCluster = { title: string; points: string[] };
export type ServiceType = { name: string; blurb: string };

export type ServiceContent = {
  slug: "depression" | "anxiety" | "adhd";
  nav: string;
  heroTitle: string;
  heroLead: string;
  typesHeading: string;
  types: ServiceType[];
  signsHeading: string;
  signs: SignCluster[];
  faqHeading: string;
  faqs: string[];
};

export const services: Record<string, ServiceContent> = {
  depression: {
    slug: "depression",
    nav: "Depression",
    heroTitle: "When the weight feels unbearable,",
    heroLead:
      "when even getting out of bed feels like a battle — you deserve someone in your corner. At Mind.AI, we offer more than therapy. We offer understanding, patience, and a path forward. Let’s walk through the darkness together — towards light, peace, and the version of you that still exists beneath the pain.",
    typesHeading: "Types of Depression",
    types: [
      {
        name: "Major Depressive Disorder",
        blurb:
          "A severe form of depression with intense symptoms lasting at least two weeks, impacting daily life.",
      },
      {
        name: "Persistent Depressive Disorder (Dysthymia)",
        blurb:
          "A chronic, milder form of depression with symptoms persisting for at least two years.",
      },
      {
        name: "Disruptive Mood Dysregulation Disorder",
        blurb:
          "A condition in children involving frequent, severe temper outbursts and chronic irritability.",
      },
    ],
    signsHeading: "Recognizing Signs of Depression",
    signs: [
      {
        title: "Feeling Low",
        points: [
          "Persistent sadness or emptiness",
          "Loss of interest in favorite activities",
          "Feeling hopeless or helpless",
        ],
      },
      {
        title: "Drained All the Time",
        points: [
          "Fatigue even after rest",
          "Struggling to get through the day",
          "Tasks feel heavier than usual",
        ],
      },
      {
        title: "Emotionally Numb",
        points: [
          "Feeling detached or indifferent",
          "Loss of emotional connection with others",
          "Flat or dulled emotional reactions",
        ],
      },
      {
        title: "Sleep All Over the Place",
        points: [
          "Trouble falling asleep or staying asleep",
          "Sleeping too much or too little",
          "Feeling tired despite sleep",
        ],
      },
    ],
    faqHeading: "Depression: Your Top Questions, Answered",
    faqs: [
      "What is the difference between sadness and depression?",
      "What are the different symptoms of depression?",
      "How to overcome depression?",
      "What are the causes of depression?",
      "What is the difference between therapy, psychiatry, and self-care for depression?",
    ],
  },

  anxiety: {
    slug: "anxiety",
    nav: "Anxiety",
    heroTitle: "Anxiety Feels Heavy",
    heroLead:
      "But you don’t have to carry it alone — we are here. Anxiety can make the smallest things feel overwhelming. The racing thoughts, the restlessness, the “what ifs” that don’t stop — we’ve been there. You don’t have to carry it all on your own. At Mind.AI, you’ll find someone who listens, understands, and walks with you through it. No pressure. No judgment. Just real support, at your pace.",
    typesHeading: "Types of Anxiety Disorders",
    types: [
      {
        name: "Separation Anxiety Disorder",
        blurb:
          "Excessive fear or anxiety about separation from home or attachment figures.",
      },
      {
        name: "Selective Mutism",
        blurb:
          "Consistent inability to speak in specific social situations despite normal language skills.",
      },
      {
        name: "Specific Phobia",
        blurb:
          "Intense, irrational fear of a specific object or situation, leading to avoidance.",
      },
      {
        name: "Social Anxiety Disorder (Social Phobia)",
        blurb:
          "Extreme fear of social situations due to worry about judgment or embarrassment.",
      },
      {
        name: "Panic Disorder",
        blurb:
          "Recurrent, unexpected panic attacks with intense fear and physical symptoms.",
      },
      {
        name: "Agoraphobia",
        blurb:
          "Fear of situations where escape or help may be unavailable, leading to avoidance.",
      },
    ],
    signsHeading: "Recognizing Signs of Anxiety",
    signs: [
      {
        title: "Racing Mind",
        points: [
          "Constant worrying or overthinking",
          "Difficulty focusing on tasks",
          "Thoughts spiraling out of control",
        ],
      },
      {
        title: "Body Reacts",
        points: [
          "Heart pounding or chest tightness",
          "Shaking, sweating, or feeling lightheaded",
          "Restlessness or physical tension",
        ],
      },
      {
        title: "Avoiding the World",
        points: [
          "Fear of judgment in social settings",
          "Avoiding conversations or gatherings",
          "Pulling away from friends or responsibilities",
        ],
      },
      {
        title: "Wired but Tired",
        points: [
          "Trouble falling or staying asleep",
          "Waking up feeling unrefreshed",
          "Sleep disrupted by anxious thoughts",
        ],
      },
    ],
    faqHeading: "Your questions about Anxiety, answered",
    faqs: [
      "What is an anxiety disorder?",
      "What are the types of anxiety disorders?",
      "What causes anxiety disorders?",
      "Is it possible to prevent an anxiety disorder?",
      "What is the difference between therapy, psychiatry, and self-care for anxiety?",
    ],
  },

  adhd: {
    slug: "adhd",
    nav: "ADHD",
    heroTitle: "Manage ADHD Together",
    heroLead:
      "Facing challenges with ADHD? You're not alone. Our platform provides guidance and tools to help you manage symptoms and take back control of your life. Let's work together toward a balanced mind and healthier habits.",
    typesHeading: "Types of ADHD and Related Disorders",
    types: [
      {
        name: "Generalized Anxiety Disorder",
        blurb: "Persistent, excessive worry about various aspects of daily life.",
      },
      {
        name: "ADHD, Predominantly Inattentive Presentation",
        blurb:
          "Difficulty sustaining attention and organizing tasks, often appearing forgetful.",
      },
      {
        name: "ADHD, Predominantly Hyperactive-Impulsive Presentation",
        blurb:
          "Excessive restlessness and impulsive behaviors, with less inattention.",
      },
      {
        name: "ADHD, Combined Presentation",
        blurb:
          "A mix of significant inattention and hyperactive-impulsive symptoms.",
      },
    ],
    signsHeading:
      "Recognizing Signs of Attention-Deficit/Hyperactivity Disorder (ADHD)",
    signs: [
      {
        title: "Easily Distracted & Forgetful",
        points: [
          "Easily distracted by things around you",
          "Forgetful in daily activities",
          "Sometimes seems not to listen when spoken to",
        ],
      },
      {
        title: "Trouble Staying Focused",
        points: [
          "Difficulty keeping attention on tasks or play",
          "Frequent careless mistakes in schoolwork or activities",
          "Disorganized and struggles with planning",
        ],
      },
      {
        title: "Fidgety & Restless",
        points: [
          "Fidgets or squirms in seat",
          "Difficulty staying seated when expected",
          "Runs about or climbs in inappropriate situations",
        ],
      },
      {
        title: "Impulsive Actions",
        points: [
          "Blurts out answers before questions are finished",
          'Acts as if "driven by a motor"',
          "Difficulty playing or relaxing quietly",
        ],
      },
    ],
    faqHeading: "Frequently Asked Questions About ADHD",
    faqs: [
      "What is ADHD?",
      "What are the main types of ADHD?",
      "Can ADHD be diagnosed in adults?",
      "What treatments are available for ADHD?",
      "How can I support someone with ADHD?",
    ],
  },
};
