import type { AssessmentInstrument } from "@/api/types";

type Definition = { title: string; code: string; description: string; timeframe: string; options: string[]; questions: string[] };

const four = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
const five = ["Never", "Rarely", "Sometimes", "Often", "Very often"];

export const assessmentContent: Record<AssessmentInstrument, Definition> = {
  phq9: { title: "Depression check-in", code: "PHQ-9", description: "Explore recent patterns in mood and interest.", timeframe: "Over the last 2 weeks", options: four, questions: ["Interest or pleasure", "Feeling down", "Sleep", "Energy", "Appetite", "Feeling bad about yourself", "Concentration", "Moving or speaking slowly", "Thoughts of self-harm"] },
  gad7: { title: "Anxiety check-in", code: "GAD-7", description: "Explore common anxiety symptoms.", timeframe: "Over the last 2 weeks", options: four, questions: ["Feeling nervous", "Not being able to stop worrying", "Worrying too much", "Trouble relaxing", "Restlessness", "Becoming easily annoyed", "Feeling afraid"] },
  asrs_v1_1: { title: "Attention check-in", code: "ASRS v1.1", description: "Explore attention and activity patterns.", timeframe: "Over the past 6 months", options: five, questions: ["Finishing details", "Getting things in order", "Remembering appointments", "Avoiding sustained thought", "Fidgeting when seated", "Feeling overly active"] },
};

export const assessmentSlug: Record<string, AssessmentInstrument> = { depression: "phq9", anxiety: "gad7", adhd: "asrs_v1_1" };
