export type Language = "en" | "bn";

export type CrisisPlan = {
  whoIdCall: string;
  whatHelps: string;
  whatMakesItWorse: string;
};

export type TrustedContact = {
  name: string;
  relationship: string;
  phone: string;
};

export type BaselineAnswer = {
  itemId: string;
  value: 0 | 1 | 2 | 3;
};

export type OnboardingStep = 1 | 2 | 3 | 4;

export type OnboardingProgress = {
  step: OnboardingStep;
  language?: Language;
  baseline?: BaselineAnswer[];
  consentAt?: string;
  crisisPlan?: CrisisPlan;
  contact?: TrustedContact;
  completedAt?: string;
};
