import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";

export const metadata: Metadata = { title: "Counseling vs Psychotherapy | Mind.AI" };

export default function Page() {
  return (
    <ArticleLayout
      category="Article | 4 min"
      title="Do I Need Counseling or Psychotherapy?"
      intro="Counseling and psychotherapy are two types of mental health treatment that can help with emotional and psychological issues. This guide explains the difference and how to figure out what you might need."
      outline={[
        "What’s the difference between counseling and psychotherapy?",
        "Signs you might benefit from counseling or psychotherapy",
        "Making the decision",
        "Conclusion",
        "About the author",
      ]}
    />
  );
}
