export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  category: "flyers" | "certificates" | "signs-banners";
}
export const myHometownPromotionalItems: CatalogItem[] = [
  {
    id: "car-magnets",
    title: "Car Magnets",
    description: "Custom car magnets for community promotion",
    image: "/mht/design-hub/car-magnets.webp",
    category: "signs-banners",
  },
  {
    id: "tents",
    title: "Tents",
    description: "Promotional tents for outdoor events and activities",
    image: "/mht/design-hub/tents.webp",
    category: "signs-banners",
  },
  {
    id: "table-cloths",
    title: "Table Cloths",
    description: "Branded table cloths for events and displays",
    image: "/mht/design-hub/table-cloths.webp",
    category: "signs-banners",
  },
  {
    id: "flags",
    title: "Flags",
    description: "Custom flags for community events and locations",
    image: "/mht/design-hub/flags.webp",
    category: "signs-banners",
  },
];
export const flyersCatalogItems: CatalogItem[] = [
  {
    id: "class-schedules",
    title: "Class Schedules",
    description: '8.5" x 11" or 11" x 17" class fliers with online jpegs',
    image: "/placeholder.svg?height=200&width=300",
    category: "flyers",
  },
  {
    id: "web-posts",
    title: "Web Posts",
    description: "Social media and web graphics for online promotion",
    image: "/placeholder.svg?height=200&width=300",
    category: "flyers",
  },
  {
    id: "posters",
    title: "Posters",
    description: "Custom poster designs for announcements and events",
    image: "/placeholder.svg?height=200&width=300",
    category: "flyers",
  },
];

export const certificatesCatalogItems: CatalogItem[] = [
  {
    id: "volunteer-certificates",
    title: "Volunteer Certificates",
    description: "Custom certificates for volunteers and participants",
    image: "/placeholder.svg?height=200&width=300",
    category: "certificates",
  },
  {
    id: "achievement-certificates",
    title: "Achievement Certificates",
    description: "Certificates for achievements and recognitions",
    image: "/placeholder.svg?height=200&width=300",
    category: "certificates",
  },
];

export const signsBannersCatalogItems: CatalogItem[] = [
  {
    id: "welcome-banners",
    title: "Welcome Banners",
    description: "Professional welcome banners for your community events",
    image: "/placeholder.svg?height=200&width=300",
    category: "signs-banners",
  },
  {
    id: "outdoor-flags",
    title: "Outdoor Flags",
    description: '24" x 36" poster options with various templates',
    image: "/placeholder.svg?height=200&width=300",
    category: "signs-banners",
  },
  {
    id: "popup-banners",
    title: "Pop-up Banners",
    description: "Portable banner displays for events and promotions",
    image: "/placeholder.svg?height=200&width=300",
    category: "signs-banners",
  },
];
