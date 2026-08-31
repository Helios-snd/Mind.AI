import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "Careers | Mind.AI" };

const LANGUAGES = [
  "Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu",
  "Gujarati", "Malayalam", "Kannada", "Odia", "Punjabi", "Assamese", "Bodo",
  "Konkani", "Maithili", "Santhali", "Kashmiri", "Nepali", "Sindhi",
  "Manipuri", "Dogri", "Sanskrit",
];

function Text({
  label,
  required,
  type = "text",
  hint,
}: {
  label: string;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      <input
        type={type}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
      />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Upload({ label, required, accept }: { label: string; required?: boolean; accept: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        <p className="font-semibold text-brand">Upload a file</p>
        <p>or drag and drop</p>
        <p className="mt-1 text-xs text-gray-400">{accept}</p>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-gray-200 p-6">
      <legend className="px-2 font-display font-semibold text-gray-900">
        {title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="h-display text-center text-4xl">Careers at Mind.AI</h1>
        <p className="mt-3 text-center text-gray-600">
          Care Beyond Clinics. Impact Beyond Boundaries.
        </p>

        <form className="mt-10 space-y-6">
          <Group title="Personal Information">
            <Text label="Full Name" required />
            <Text label="Age" required type="number" />
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Gender <span className="text-brand">*</span>
              </label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none">
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <Text label="Experience (in years)" required type="number" />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Bio <span className="text-brand">*</span>
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </Group>

          <Group title="Contact Information">
            <Text label="Address" required />
            <Text label="Phone Number" required type="tel" />
            <Text label="Email" required type="email" />
          </Group>

          <Group title="Language Proficiency">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Primary Language <span className="text-brand">*</span>
              </label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none">
                <option>Select Language</option>
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Secondary Language
              </label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none">
                <option>Select Language</option>
                <option>NA</option>
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </Group>

          <Group title="Documents & Certifications">
            <Upload label="Photograph" required accept="JPG, JPEG, PNG up to 10MB" />
            <Text label="Aadhar Number" required />
            <Upload label="Aadhar Document (Front)" required accept="PDF, JPG, PNG up to 10MB" />
            <Upload label="Aadhar Document (Back)" required accept="PDF, JPG, PNG up to 10MB" />
            <Text label="PAN Card Number" required />
            <Upload label="PAN Card Document" required accept="PDF, JPG, PNG up to 10MB" />
            <Upload
              label="Certification"
              required
              accept="PDF up to 10MB — upload all your certificates in a single pdf"
            />
            <Text label="Education" required />
          </Group>

          <Group title="Licenses">
            <Text label="RCI License" />
            <Text label="ISO Certification" />
          </Group>

          <button type="submit" className="btn-primary w-full">
            Submit Profile
          </button>
        </form>
      </div>
    </Section>
  );
}
