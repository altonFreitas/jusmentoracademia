export type SiteSettings = {
  name: string;
  shortName: string;
  heroLabel: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  addressUrl: string;
  founded: string;
  mission: string;
  vision: string;
  focus: string;
  about: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;

  // Portuguese translations (optional — fall back to the base text when empty)
  heroLabelPt: string;
  heroTitlePt: string;
  heroDescriptionPt: string;
  taglinePt: string;
  missionPt: string;
  visionPt: string;
  focusPt: string;
  aboutPt: string;

  // Editable section headings — About
  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutEyebrowPt: string;
  aboutTitlePt: string;
  aboutDescriptionPt: string;

  // Editable section headings for "What we do" (services)
  servicesEyebrow: string;
  servicesTitle: string;
  servicesDescription: string;
  servicesEyebrowPt: string;
  servicesTitlePt: string;
  servicesDescriptionPt: string;

  // Editable section headings for "In their words" (testimonials)
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonialsDescription: string;
  testimonialsEyebrowPt: string;
  testimonialsTitlePt: string;
  testimonialsDescriptionPt: string;

  // Editable section headings — Programs
  programsEyebrow: string;
  programsTitle: string;
  programsDescription: string;
  programsEyebrowPt: string;
  programsTitlePt: string;
  programsDescriptionPt: string;

  // Editable section headings — Our Team
  teamEyebrow: string;
  teamTitle: string;
  teamDescription: string;
  teamEyebrowPt: string;
  teamTitlePt: string;
  teamDescriptionPt: string;

  // Editable section headings — Events & Activities
  eventsEyebrow: string;
  eventsTitle: string;
  eventsDescription: string;
  eventsEyebrowPt: string;
  eventsTitlePt: string;
  eventsDescriptionPt: string;

  // Editable section headings — Gallery
  galleryEyebrow: string;
  galleryTitle: string;
  galleryDescription: string;
  galleryEyebrowPt: string;
  galleryTitlePt: string;
  galleryDescriptionPt: string;

  // Editable section headings — Partners
  partnersEyebrow: string;
  partnersTitle: string;
  partnersDescription: string;
  partnersEyebrowPt: string;
  partnersTitlePt: string;
  partnersDescriptionPt: string;

  // Editable section headings — FAQ
  faqEyebrow: string;
  faqTitle: string;
  faqDescription: string;
  faqEyebrowPt: string;
  faqTitlePt: string;
  faqDescriptionPt: string;

  // Editable section headings — Contact
  contactEyebrow: string;
  contactTitle: string;
  contactDescription: string;
  contactEyebrowPt: string;
  contactTitlePt: string;
  contactDescriptionPt: string;
};

export type ServiceItem = {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  title_pt?: string;
  description_pt?: string;
  sort_order?: number;
};

export type ProgramItem = {
  id?: string;
  title: string;
  format: string;
  description: string;
  title_pt?: string;
  format_pt?: string;
  description_pt?: string;
  sort_order?: number;
};

export type TeamItem = {
  id?: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  name_pt?: string;
  role_pt?: string;
  bio_pt?: string;
  sort_order?: number;
};

export type EventItem = {
  id?: string;
  title: string;
  date_label: string;
  location: string;
  summary: string;
  image?: string;
  link?: string;
  title_pt?: string;
  date_label_pt?: string;
  location_pt?: string;
  summary_pt?: string;
  sort_order?: number;
};

export type TestimonialItem = {
  id?: string;
  name: string;
  role: string;
  quote: string;
  name_pt?: string;
  role_pt?: string;
  quote_pt?: string;
  sort_order?: number;
};

export type FaqItem = {
  id?: string;
  question: string;
  answer: string;
  question_pt?: string;
  answer_pt?: string;
  sort_order?: number;
};

export type PartnerItem = {
  id?: string;
  name: string;
  tag: string;
  url: string;
  image?: string;
  tag_pt?: string;
  sort_order?: number;
};

export type GalleryItem = {
  id?: string;
  title: string;
  category: string;
  image: string;
  title_pt?: string;
  category_pt?: string;
  sort_order?: number;
};

export type SocialItem = {
  id?: string;
  label: string;
  url: string;
  sort_order?: number;
};

export type SiteContent = {
  settings: SiteSettings;
  services: ServiceItem[];
  programs: ProgramItem[];
  team: TeamItem[];
  events: EventItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  partners: PartnerItem[];
  gallery: GalleryItem[];
  socials: SocialItem[];
};

export type AdminCollectionKey =
  | "services"
  | "programs"
  | "team"
  | "events"
  | "testimonials"
  | "faqs"
  | "partners"
  | "gallery"
  | "socials";

export type Lang = "en" | "pt";
export type Theme = "light" | "dark";
