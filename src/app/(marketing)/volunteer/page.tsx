import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "Volunteer | Mind.AI" };

export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-lg">
        <h1 className="h-display text-center text-4xl">Help Us Improve</h1>
        <p className="mt-3 text-center text-gray-600">
          Volunteer with us in beta testing to help make our platform better.
        </p>

        <form className="mt-10 space-y-4 rounded-2xl border border-gray-200 bg-white p-8">
          <Field label="Name" name="name" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone Number" name="phone" type="tel" />
          <Field label="Age" name="age" type="number" />
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Gender
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none">
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">
            Next
          </button>
        </form>
      </div>
    </Section>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
      />
    </div>
  );
}
