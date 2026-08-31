// Captured from /Ourexperts on the live site (demo data).

export type Expert = {
  name: string;
  experience: string;
  price: string;
  expertise: string;
  speaks: string;
  nextSlot: string;
};

export const experts: Expert[] = [
  {
    name: "Dr. Abraham Kareem",
    experience: "15 years of experience",
    price: "Starts @ ₹1200 per session",
    expertise: "Clinical Psychology, Anxiety disorders",
    speaks: "English, Hindi",
    nextSlot: "1 May 10:00 AM",
  },
  {
    name: "Dr. Rajesh Kumar",
    experience: "12 years of experience",
    price: "Starts @ ₹1200 per session",
    expertise: "Psychiatry",
    speaks: "Hindi, English, Bengali",
    nextSlot: "3 May 3:00 PM",
  },
  {
    name: "Dr. Priya Sharma",
    experience: "8 years of experience",
    price: "Starts @ ₹1200 per session",
    expertise: "Child Psychology, Anxiety disorders",
    speaks: "Hindi, English, Marathi",
    nextSlot: "4 May 4:00 PM",
  },
  {
    name: "Dr. Mukesh Jha",
    experience: "10 years of experience",
    price: "Starts @ ₹1200 per session",
    expertise: "Cognitive Behavioral Therapy",
    speaks: "English, Mandarin",
    nextSlot: "5 May 5:00 PM",
  },
  {
    name: "Dr. Anjali Patel",
    experience: "9 years of experience",
    price: "Starts @ ₹1200 per session",
    expertise: "Family Therapy, Anxiety disorders",
    speaks: "English, Gujarati, Hindi",
    nextSlot: "9 May 6:00 PM",
  },
];
