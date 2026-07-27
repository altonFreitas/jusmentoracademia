import type {
  AdminCollectionKey,
  EventItem,
  FaqItem,
  GalleryItem,
  PartnerItem,
  ProgramItem,
  ServiceItem,
  SocialItem,
  SiteContent,
  SiteSettings,
  TeamItem,
  TestimonialItem,
} from "@/lib/types";

export const logoSrc = "/logo.png";

export const defaultSettings: SiteSettings = {
  name: "JusMentor Academia",
  shortName: "JMA",
  heroLabel: "Legal education institute · Dili, Timor-Leste",
  heroTitle: "Making the law understandable, practical, and within reach for every community.",
  heroDescription:
    "JusMentor Academia is a legal education institute in Dili, Timor-Leste. Through courses, seminars, and advocacy, we help students, youth, and communities understand their rights and build a stronger culture of justice.",
  heroImage: "",
  tagline: "Legal Education · Advocacy · Training · Community Empowerment",
  email: "jusmentoracademia@gmail.com",
  phone: "+670 7511 4252",
  whatsapp: "67075114252",
  address: "Surikmas, Dili, Timor-Leste",
  addressUrl: "",
  founded: "2024",
  mission:
    "To make quality legal education, practical training, and advocacy available to the people who need it most, turning legal knowledge into everyday confidence.",
  vision:
    "A Timor-Leste where every person understands their rights, and where a new generation of ethical, well-trained leaders carries justice forward.",
  focus:
    "Courses and short training, public seminars, youth leadership, and community advocacy across Timor-Leste.",
  about:
    "JusMentor Academia was founded to close the distance between people and the law. Through clear teaching, open seminars, and community advocacy, we help students and citizens understand their rights, think critically, and act with confidence. We believe education is the foundation of responsible leadership and a fairer society.",
  facebook: "https://www.facebook.com/profile.php?id=61571016560363",
  instagram: "https://www.instagram.com/jusmentoracademia/",
  youtube: "https://www.youtube.com/@JusMentorAcademia",
  // Optional overrides — left blank so the site uses its built-in copy and
  // translations unless an admin fills these in.
  heroLabelPt: "",
  heroTitlePt: "",
  heroDescriptionPt: "",
  taglinePt: "",
  missionPt: "",
  visionPt: "",
  focusPt: "",
  aboutPt: "",
  servicesEyebrow: "",
  servicesTitle: "",
  servicesDescription: "",
  servicesEyebrowPt: "",
  servicesTitlePt: "",
  servicesDescriptionPt: "",
  testimonialsEyebrow: "",
  testimonialsTitle: "",
  testimonialsDescription: "",
  testimonialsEyebrowPt: "",
  testimonialsTitlePt: "",
  testimonialsDescriptionPt: "",
  tiktok: "https://www.tiktok.com/@jusmentor.academia",
};

export const defaultServices: ServiceItem[] = [
  {
    title: "Legal Education",
    icon: "⚖",
    description:
      "Clear, structured lessons that turn complex legal ideas into knowledge you can use in daily life, study, and work.",
  },
  {
    title: "Courses & Training",
    icon: "🎓",
    description:
      "Short courses and skills-based training that build practical capability for students, youth, and community organisations.",
  },
  {
    title: "Talks & Seminars",
    icon: "🗣",
    description:
      "Public seminars and academic discussions on the legal and social issues that matter most to our communities.",
  },
  {
    title: "Advocacy & Community Support",
    icon: "🤝",
    description:
      "Awareness campaigns and grassroots initiatives that promote justice, civic responsibility, and equal access to the law.",
  },
];

export const defaultPrograms: ProgramItem[] = [
  {
    title: "Online Lessons",
    format: "Learn from anywhere",
    description:
      "Live and recorded sessions that let you study legal topics from any device, at a pace that fits your schedule.",
  },
  {
    title: "Legal Terms & Concepts",
    format: "Foundations",
    description:
      "Plain-language explanations of the legal terms and ideas everyone should understand, with no prior background needed.",
  },
  {
    title: "Community Seminar Series",
    format: "In your community",
    description:
      "Interactive seminars that bring legal education and open discussion directly to schools, groups, and neighbourhoods.",
  },
];

export const defaultTeam: TeamItem[] = [
  {
    name: "Academic & Curriculum",
    role: "Teaching & program quality",
    bio: "Designs the curriculum, keeps teaching standards high, and develops new courses and learning materials.",
  },
  {
    name: "Advocacy & Outreach",
    role: "Community engagement",
    bio: "Builds relationships with communities and partners and leads awareness campaigns across Timor-Leste.",
  },
  {
    name: "Training & Events",
    role: "Workshops & seminars",
    bio: "Plans and runs the workshops, seminars, and public events that bring our programs to life.",
  },
];

export const defaultEvents: EventItem[] = [
  {
    title: "Legal Awareness Seminar",
    date_label: "Monthly",
    location: "Dili, Timor-Leste",
    summary:
      "An open, public seminar on rights, responsibilities, and the everyday law that shapes our communities.",
  },
  {
    title: "Youth Leadership Training",
    date_label: "Quarterly",
    location: "In-person & online",
    summary:
      "A hands-on program that pairs legal understanding with leadership skills and real community action.",
  },
  {
    title: "Online Learning Session",
    date_label: "Weekly",
    location: "Online",
    summary:
      "A short, focused lesson that makes a single legal concept clear, then opens the floor for questions.",
  },
];

export const defaultTestimonials: TestimonialItem[] = [
  {
    name: "Course participant",
    role: "Dili",
    quote:
      "The lessons made legal ideas feel simple and useful. For the first time, I understood rights I never knew I had.",
  },
  {
    name: "Seminar attendee",
    role: "Community member",
    quote:
      "Engaging, modern, and genuinely relevant for young people. The seminars start real conversations.",
  },
  {
    name: "Training participant",
    role: "Youth leader",
    quote:
      "Professional, inspiring, and practical. I left ready to take action in my own community.",
  },
];

export const defaultFaqs: FaqItem[] = [
  {
    question: "Who can join JusMentor Academia programs?",
    answer:
      "Anyone with an interest in the law and their community, from students and youth leaders to professionals and members of the public. Most programs need no prior legal background.",
  },
  {
    question: "Are programs online, in person, or both?",
    answer:
      "Both. We run online lessons you can join from anywhere, along with in-person seminars and training across Timor-Leste.",
  },
  {
    question: "Do the programs cost anything?",
    answer:
      "Many of our seminars and awareness activities are open to the public at no cost. For specific courses and training, contact us and we will share the current details.",
  },
  {
    question: "How can an organisation partner with us?",
    answer:
      "Schools, NGOs, and institutions are welcome to collaborate on seminars, training, and advocacy. Reach out by email or WhatsApp and we will take it from there.",
  },
];

export const defaultPartners: PartnerItem[] = [
  { name: "Universities & Schools", tag: "Academic collaboration", url: "" },
  { name: "Community Organisations", tag: "Outreach & advocacy", url: "" },
  { name: "Youth Networks", tag: "Leadership & training", url: "" },
];

export const defaultGallery: GalleryItem[] = [
  {
    title: "Seminar in session",
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Hands-on training",
    category: "Training",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Community dialogue",
    category: "Advocacy",
    image:
      "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
  },
];

export const defaultSocials: SocialItem[] = [
  { label: "Facebook", url: "https://www.facebook.com/profile.php?id=61571016560363" },
  { label: "Instagram", url: "https://www.instagram.com/jusmentoracademia/" },
  { label: "YouTube", url: "https://www.youtube.com/@JusMentorAcademia" },
  { label: "TikTok", url: "https://www.tiktok.com/@jusmentor.academia" },
];

export const defaultContent: SiteContent = {
  settings: defaultSettings,
  services: defaultServices,
  programs: defaultPrograms,
  team: defaultTeam,
  events: defaultEvents,
  testimonials: defaultTestimonials,
  faqs: defaultFaqs,
  partners: defaultPartners,
  gallery: defaultGallery,
  socials: defaultSocials,
};

export const collectionLabels: Record<AdminCollectionKey, string> = {
  services: "Services",
  programs: "Programs",
  team: "Team",
  events: "Events",
  testimonials: "Testimonials",
  faqs: "FAQs",
  partners: "Partners",
  gallery: "Gallery",
  socials: "Social links",
};

export function dbSettingsToSiteSettings(
  row: Record<string, unknown> | null | undefined,
): SiteSettings {
  if (!row) return defaultSettings;
  return {
    name: String(row.name ?? defaultSettings.name),
    shortName: String(row.short_name ?? defaultSettings.shortName),
    heroLabel: String(row.hero_label ?? defaultSettings.heroLabel),
    heroTitle: String(row.hero_title ?? defaultSettings.heroTitle),
    heroDescription: String(row.hero_description ?? defaultSettings.heroDescription),
    heroImage: String(row.hero_image ?? ""),
    tagline: String(row.tagline ?? defaultSettings.tagline),
    email: String(row.email ?? defaultSettings.email),
    phone: String(row.phone ?? defaultSettings.phone),
    whatsapp: String(row.whatsapp ?? defaultSettings.whatsapp),
    address: String(row.address ?? defaultSettings.address),
    addressUrl: String(row.address_url ?? ""),
    founded: String(row.founded ?? defaultSettings.founded),
    mission: String(row.mission ?? defaultSettings.mission),
    vision: String(row.vision ?? defaultSettings.vision),
    focus: String(row.focus ?? defaultSettings.focus),
    about: String(row.about ?? defaultSettings.about),
    facebook: String(row.facebook ?? defaultSettings.facebook),
    instagram: String(row.instagram ?? defaultSettings.instagram),
    youtube: String(row.youtube ?? defaultSettings.youtube),
    tiktok: String(row.tiktok ?? defaultSettings.tiktok),
    heroLabelPt: String(row.hero_label_pt ?? ""),
    heroTitlePt: String(row.hero_title_pt ?? ""),
    heroDescriptionPt: String(row.hero_description_pt ?? ""),
    taglinePt: String(row.tagline_pt ?? ""),
    missionPt: String(row.mission_pt ?? ""),
    visionPt: String(row.vision_pt ?? ""),
    focusPt: String(row.focus_pt ?? ""),
    aboutPt: String(row.about_pt ?? ""),
    servicesEyebrow: String(row.services_eyebrow ?? ""),
    servicesTitle: String(row.services_title ?? ""),
    servicesDescription: String(row.services_description ?? ""),
    servicesEyebrowPt: String(row.services_eyebrow_pt ?? ""),
    servicesTitlePt: String(row.services_title_pt ?? ""),
    servicesDescriptionPt: String(row.services_description_pt ?? ""),
    testimonialsEyebrow: String(row.testimonials_eyebrow ?? ""),
    testimonialsTitle: String(row.testimonials_title ?? ""),
    testimonialsDescription: String(row.testimonials_description ?? ""),
    testimonialsEyebrowPt: String(row.testimonials_eyebrow_pt ?? ""),
    testimonialsTitlePt: String(row.testimonials_title_pt ?? ""),
    testimonialsDescriptionPt: String(row.testimonials_description_pt ?? ""),
  };
}

export function siteSettingsToDbRow(settings: SiteSettings) {
  return {
    id: 1,
    name: settings.name,
    short_name: settings.shortName,
    hero_label: settings.heroLabel,
    hero_title: settings.heroTitle,
    hero_description: settings.heroDescription,
    hero_image: settings.heroImage,
    tagline: settings.tagline,
    email: settings.email,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    address: settings.address,
    address_url: settings.addressUrl,
    founded: settings.founded,
    mission: settings.mission,
    vision: settings.vision,
    focus: settings.focus,
    about: settings.about,
    facebook: settings.facebook,
    instagram: settings.instagram,
    youtube: settings.youtube,
    tiktok: settings.tiktok,
    hero_label_pt: settings.heroLabelPt,
    hero_title_pt: settings.heroTitlePt,
    hero_description_pt: settings.heroDescriptionPt,
    tagline_pt: settings.taglinePt,
    mission_pt: settings.missionPt,
    vision_pt: settings.visionPt,
    focus_pt: settings.focusPt,
    about_pt: settings.aboutPt,
    services_eyebrow: settings.servicesEyebrow,
    services_title: settings.servicesTitle,
    services_description: settings.servicesDescription,
    services_eyebrow_pt: settings.servicesEyebrowPt,
    services_title_pt: settings.servicesTitlePt,
    services_description_pt: settings.servicesDescriptionPt,
    testimonials_eyebrow: settings.testimonialsEyebrow,
    testimonials_title: settings.testimonialsTitle,
    testimonials_description: settings.testimonialsDescription,
    testimonials_eyebrow_pt: settings.testimonialsEyebrowPt,
    testimonials_title_pt: settings.testimonialsTitlePt,
    testimonials_description_pt: settings.testimonialsDescriptionPt,
  };
}
