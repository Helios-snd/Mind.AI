import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";

export const metadata: Metadata = { title: "Tobacco Addiction | Mind.AI" };

export default function Page() {
  return (
    <ArticleLayout
      category="Addiction"
      date="2nd May 2023"
      title="The Dangers of Tobacco Addiction: Health Risks and Long-Term Effects"
      intro="Tobacco addiction is hard to beat. Nicotine changes the brain, making it tough to stop. This article looks at what tobacco addiction is, the health risks of smoking, and its long-term effects."
      outline={[
        "What is tobacco addiction?",
        "Health risks of smoking (heart disease, cancer, pregnancy and fertility)",
        "Long-term effects of tobacco use (shorter life, premature aging, tooth and gum disease, eye disease)",
        "Conclusion — ways to quit and available resources",
        "Sources",
      ]}
    />
  );
}
