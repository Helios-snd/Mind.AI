// Header and footer navigation structure. Route slugs are kebab-case.

export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; items: NavLink[]; href?: string };

export const primaryNav: NavGroup[] = [
  {
    label: "About Us",
    items: [
      { label: "Home", href: "/" },
      { label: "FAQs", href: "/faq" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
  {
    label: "Services",
    items: [
      { label: "Depression", href: "/depression" },
      { label: "Anxiety", href: "/anxiety" },
      { label: "ADHD", href: "/adhd" },
      { label: "Students Well-being Programme", href: "/students-wellbeing" },
      { label: "For Corporates", href: "/for-corporates" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "All Resources", href: "/all-resources" },
      { label: "Blogs", href: "/all-resources#blogs" },
      { label: "Music", href: "/all-resources#music" },
      { label: "Videos", href: "/all-resources#videos" },
      { label: "Assessment", href: "/all-resources#assessment" },
    ],
  },
];

export const standaloneNav: NavLink[] = [
  { label: "Our Experts", href: "/our-experts" },
];

export const footerNav: NavGroup[] = [
  {
    label: "About Mind.AI",
    items: [
      { label: "About Us", href: "/faq" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    label: "Offerings",
    items: [
      { label: "Diagnosis and Therapy", href: "/#offerings" },
      { label: "Self-care and Progress", href: "/#offerings" },
      { label: "Community", href: "/#offerings" },
    ],
  },
  {
    label: "Services",
    items: [
      { label: "Depression", href: "/depression" },
      { label: "Anxiety", href: "/anxiety" },
      { label: "ADHD", href: "/adhd" },
    ],
  },
];

export const EMERGENCY_HELPLINE = "1-800 891 4416";
export const CONTACT_EMAIL = "contact@mind.ai";
