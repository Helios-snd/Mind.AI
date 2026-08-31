import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { services } from "@/data/services";

export const metadata: Metadata = { title: "ADHD | Mind.AI" };

export default function Page() {
  return <ServicePage data={services.adhd} />;
}
