export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  category:
    | "flyers"
    | "certificates"
    | "signs-banners"
    | "promotional"
    | "myhometown";
}

export const flyersCatalogItems: CatalogItem[] = [
  {
    id: "class-schedules",
    title: "Class Schedules",
    description: "Customizable class schedule flyers",
    image: "/placeholderWhite.svg",
    category: "flyers",
  },
  {
    id: "web-posts",
    title: "Web Posts",
    description: "Social media and web graphics for online promotion",
    image: "/placeholderWhite.svg",
    category: "flyers",
  },
  {
    id: "posters",
    title: "Posters",
    description: "Custom poster designs for announcements and events",
    image: "/placeholderWhite.svg",
    category: "flyers",
  },
];

export const certificatesCatalogItems: CatalogItem[] = [
  {
    id: "volunteer-certificates",
    title: "Volunteer Certificates",
    description: "Custom certificates for volunteers and participants",
    image: "/placeholderWhite.svg",
    category: "certificates",
  },
  {
    id: "achievement-certificates",
    title: "Achievement Certificates",
    description: "Certificates for achievements and recognitions",
    image: "/placeholderWhite.svg",
    category: "certificates",
  },
];

export const signsBannersCatalogItems: CatalogItem[] = [
  {
    id: "welcome-banners",
    title: "Welcome Banners",
    description: "Professional welcome banners for your community events",
    image: "/placeholderWhite.svg",
    category: "signs-banners",
  },
  {
    id: "outdoor-flags",
    title: "Outdoor Flags",
    description: "Custom outdoor flags for community promotion",
    image: "/placeholderWhite.svg",
    category: "signs-banners",
  },
  {
    id: "popup-banners",
    title: "Pop-up Banners",
    description: "Portable banner displays for events and promotions",
    image: "/placeholderWhite.svg",
    category: "signs-banners",
  },
];

export const promotionalItems: CatalogItem[] = [
  {
    id: "tents",
    title: "Tents",
    description: "Promotional tents for outdoor events and activities",
    image: "/design-hub/tent.webp?height=200&width=300",
    category: "promotional",
  },
  {
    id: "flags",
    title: "Flags",
    description: "Custom flags for community events and locations",
    image: "/design-hub/Flags.webp?height=200&width=300",
    category: "promotional",
  },
  {
    id: "car-magnets",
    title: "Car Magnets",
    description: "Custom car magnets for community promotion",
    image: "/design-hub/car magnets.webp?height=200&width=300",
    category: "promotional",
  },
  {
    id: "table-cloths",
    title: "Table Cloths",
    description: "Branded table cloths for events and displays",
    image: "/design-hub/Green_TableCloth.webp?height=200&width=300",
    category: "promotional",
  },
  {
    id: "safety-vests",
    title: "Safety Vests",
    description: "Custom safety vests with community branding",
    image: "/placeholderWhite.svg",
    category: "promotional",
  },
  {
    id: "volunteer-badges",
    title: "Volunteer Badges",
    description: "Custom volunteer identification badges",
    image: "/placeholderWhite.svg",
    category: "promotional",
  },
];

export const myHometownItems: CatalogItem[] = [
  {
    id: "hats",
    title: "Hats",
    description: "MHT branded hats",
    image: "/design-hub/black hats.webp?height=200&width=300",
    category: "myhometown",
  },
  {
    id: "notebooks",
    title: "Note Books",
    description: 'MHT branded notebooks (5" x 7")',
    image: "/design-hub/notebook.webp?height=200&width=300",
    category: "myhometown",
  },
  {
    id: "t-shirts",
    title: "T-Shirts",
    description: "MHT branded t-shirts",
    image: "/design-hub/t shirts.webp?height=200&width=300",
    category: "myhometown",
  },
  {
    id: "hoodies",
    title: "Hoodies",
    description: "MHT branded hoodies",
    image: "/design-hub/hoodies.webp?height=200&width=300",
    category: "myhometown",
  },
  {
    id: "white-hats",
    title: "White Hats",
    description: "MHT branded white hats",
    image: "/design-hub/white hats.webp?height=200&width=300",
    category: "myhometown",
  },
  {
    id: "tote-bags",
    title: "Tote Bags",
    description: "MHT branded tote bags",
    image: "/design-hub/tote bag .webp?height=200&width=300",
    category: "myhometown",
  },
];

export interface FlyerFormData {
  purpose: string;
  theme: string;
  dueDate: string;
  englishText: string;
  spanishText: string;
  qrCodes: string;
  size: "8.5x11" | "poster" | "door-hanger" | "other";
  otherSize?: string;
}

export interface CertificateFormData {
  purpose: string;
  theme: string;
  dueDate: string;
  englishText: string;
  spanishText: string;
}

export interface SignBannerFormData {
  purpose: string;
  theme: string;
  dueDate: string;
  englishText: string;
  spanishText: string;
  qrCodes: string;
  size: string;
}
