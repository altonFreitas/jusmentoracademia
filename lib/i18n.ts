import type { Lang } from "@/lib/types";

// All fixed, structural text of the public site, in English and Portuguese.
// Admin-entered content (services, events, etc.) is translated separately
// through optional "_pt" fields, with a graceful fall back to the base text.
export const ui = {
  en: {
    // navigation
    navAbout: "About",
    navServices: "Services",
    navPrograms: "Programs",
    navEvents: "Events",
    navGallery: "Gallery",
    navContact: "Contact",

    // controls
    themeToLight: "Light mode",
    themeToDark: "Dark mode",
    langLabel: "Português",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    skipToContent: "Skip to content",

    // hero
    heroExplore: "Explore programs",
    heroGetInTouch: "Get in touch",
    heroFounded: "Founded",
    heroBasedIn: "Based in",
    heroBasedInValue: "Díli",
    heroFocus: "Focus",
    heroFocusValue: "Legal education",
    instituteProfile: "Institute profile",
    labelEmail: "Email",
    labelPhone: "Phone / WhatsApp",
    labelAddress: "Address",

    // about
    aboutEyebrow: "About JMA",
    aboutTitle: "Legal knowledge belongs to everyone, not just the courtroom.",
    aboutDescription:
      "We founded JusMentor Academia to close the gap between people and the law. Here is who we are and what drives our work.",
    ourStory: "Our story",
    mission: "Mission",
    vision: "Vision",
    focus: "Focus",
    standForTitle: "What we stand for",
    stand1Strong: "Clarity over jargon.",
    stand1: "Plain language that anyone can follow.",
    stand2Strong: "Practical learning.",
    stand2: "Knowledge you can use in real life.",
    stand3Strong: "Open to all.",
    stand3: "No background or prior study required.",
    stand4Strong: "Rooted in community.",
    stand4: "Education that strengthens Timor-Leste.",
    reachUs: "Reach us directly",
    emailInstitute: "Email the institute",
    chatWhatsApp: "Chat on WhatsApp",
    seeEvents: "See upcoming events",

    // services (defaults; admin can override in Settings)
    servicesEyebrow: "What we do",
    servicesTitle: "Four ways we bring the law closer to people.",
    servicesDescription:
      "From structured courses to community advocacy, each program is built to make legal knowledge practical and accessible.",

    // programs
    programsEyebrow: "Programs",
    programsTitle: "Flexible learning for students, youth, and communities.",
    programsDescription:
      "Join online or in person. Every program is designed to fit real lives and build real understanding.",

    // team
    teamEyebrow: "Our team",
    teamTitle: "The people and units behind our programs.",
    teamDescription:
      "A small, dedicated team working across teaching, outreach, and events.",

    // events
    eventsEyebrow: "Events & activities",
    eventsTitle: "What's happening at the institute.",
    eventsDescription:
      "Seminars, training, and learning sessions you can take part in throughout the year.",
    eventLearnMore: "Learn more",

    // gallery
    galleryEyebrow: "Gallery",
    galleryTitle: "Moments from our seminars, training, and community work.",
    galleryDescription:
      "A look at the people and conversations that make our work meaningful.",

    // testimonials (defaults; admin can override in Settings)
    testimonialsEyebrow: "In their words",
    testimonialsTitle: "What participants take away.",
    testimonialsDescription:
      "Voices from the students, youth, and community members who learn with us.",

    // partners
    partnersEyebrow: "Partners",
    partnersTitle: "Stronger together.",
    partnersDescription:
      "We collaborate with schools, organisations, and youth networks to widen access to legal education.",
    visitLink: "Visit link",

    // faq
    faqEyebrow: "FAQ",
    faqTitle: "Questions, answered.",
    faqDescription:
      "Everything you need to know about joining or working with JusMentor Academia.",

    // contact
    contactEyebrow: "Contact",
    contactTitle: "Get in touch with JusMentor Academia.",
    contactDescription:
      "Have a question, want to join a program, or interested in partnering? We would love to hear from you.",
    sendMessage: "Send a message",
    replyTime: "We usually reply within a couple of days.",
    formIntro: "Fill in the form and we'll get your message. Prefer WhatsApp?",
    messageAnytime: "Message us anytime",
    yourName: "Your name",
    yourEmail: "Your email",
    subjectOptional: "Subject (optional)",
    yourMessage: "Your message",
    sendCta: "Send message",
    sending: "Sending…",
    formErrorFields: "Please add your name, email, and a short message.",
    formSending: "Sending your message…",
    formSuccess:
      "Thank you. Your message has been sent — we'll be in touch soon.",
    formMailto: "Opening your email app with the message ready to send.",
    whatsappAria: "Message us on WhatsApp",

    // footer
    navPrivacy: "Privacy Policy",
    navCookies: "Cookie Policy",
    navTerms: "Terms of Service",
    navCookiePrefs: "Cookie preferences",
    footerRights: "All rights reserved.",
  },
  pt: {
    navAbout: "Sobre",
    navServices: "Serviços",
    navPrograms: "Programas",
    navEvents: "Eventos",
    navGallery: "Galeria",
    navContact: "Contacto",

    themeToLight: "Modo claro",
    themeToDark: "Modo escuro",
    langLabel: "English",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    skipToContent: "Ir para o conteúdo",

    heroExplore: "Ver programas",
    heroGetInTouch: "Fale connosco",
    heroFounded: "Fundada em",
    heroBasedIn: "Sediada em",
    heroBasedInValue: "Díli",
    heroFocus: "Foco",
    heroFocusValue: "Educação jurídica",
    instituteProfile: "Perfil do instituto",
    labelEmail: "Email",
    labelPhone: "Telefone / WhatsApp",
    labelAddress: "Endereço",

    aboutEyebrow: "Sobre a JMA",
    aboutTitle: "O conhecimento jurídico pertence a todos, não apenas ao tribunal.",
    aboutDescription:
      "Fundámos a JusMentor Academia para aproximar as pessoas da lei. Aqui está quem somos e o que orienta o nosso trabalho.",
    ourStory: "A nossa história",
    mission: "Missão",
    vision: "Visão",
    focus: "Foco",
    standForTitle: "Os nossos valores",
    stand1Strong: "Clareza acima do jargão.",
    stand1: "Linguagem simples que qualquer pessoa entende.",
    stand2Strong: "Aprendizagem prática.",
    stand2: "Conhecimento que pode usar na vida real.",
    stand3Strong: "Aberto a todos.",
    stand3: "Sem necessidade de formação ou estudo prévio.",
    stand4Strong: "Enraizado na comunidade.",
    stand4: "Educação que fortalece Timor-Leste.",
    reachUs: "Fale connosco diretamente",
    emailInstitute: "Enviar email ao instituto",
    chatWhatsApp: "Conversar no WhatsApp",
    seeEvents: "Ver próximos eventos",

    servicesEyebrow: "O que fazemos",
    servicesTitle: "Quatro formas de aproximar a lei das pessoas.",
    servicesDescription:
      "De cursos estruturados à advocacia comunitária, cada programa torna o conhecimento jurídico prático e acessível.",

    programsEyebrow: "Programas",
    programsTitle: "Aprendizagem flexível para estudantes, jovens e comunidades.",
    programsDescription:
      "Participe online ou presencialmente. Cada programa foi pensado para a vida real e para construir compreensão verdadeira.",

    teamEyebrow: "A nossa equipa",
    teamTitle: "As pessoas e áreas por trás dos nossos programas.",
    teamDescription:
      "Uma equipa pequena e dedicada, a trabalhar no ensino, na divulgação e nos eventos.",

    eventsEyebrow: "Eventos e atividades",
    eventsTitle: "O que está a acontecer no instituto.",
    eventsDescription:
      "Seminários, formações e sessões de aprendizagem em que pode participar ao longo do ano.",
    eventLearnMore: "Saber mais",

    galleryEyebrow: "Galeria",
    galleryTitle: "Momentos dos nossos seminários, formações e trabalho comunitário.",
    galleryDescription:
      "Um olhar sobre as pessoas e as conversas que dão sentido ao nosso trabalho.",

    testimonialsEyebrow: "Nas suas palavras",
    testimonialsTitle: "O que os participantes levam consigo.",
    testimonialsDescription:
      "Vozes dos estudantes, jovens e membros da comunidade que aprendem connosco.",

    partnersEyebrow: "Parceiros",
    partnersTitle: "Mais fortes juntos.",
    partnersDescription:
      "Colaboramos com escolas, organizações e redes de jovens para alargar o acesso à educação jurídica.",
    visitLink: "Visitar site",

    faqEyebrow: "Perguntas frequentes",
    faqTitle: "Perguntas respondidas.",
    faqDescription:
      "Tudo o que precisa de saber para participar ou colaborar com a JusMentor Academia.",

    contactEyebrow: "Contacto",
    contactTitle: "Fale com a JusMentor Academia.",
    contactDescription:
      "Tem uma pergunta, quer participar num programa ou tem interesse numa parceria? Teremos todo o gosto em ouvi-lo.",
    sendMessage: "Enviar mensagem",
    replyTime: "Normalmente respondemos em poucos dias.",
    formIntro:
      "Preencha o formulário e receberemos a sua mensagem. Prefere o WhatsApp?",
    messageAnytime: "Fale connosco a qualquer momento",
    yourName: "O seu nome",
    yourEmail: "O seu email",
    subjectOptional: "Assunto (opcional)",
    yourMessage: "A sua mensagem",
    sendCta: "Enviar mensagem",
    sending: "A enviar…",
    formErrorFields:
      "Por favor, indique o seu nome, email e uma mensagem breve.",
    formSending: "A enviar a sua mensagem…",
    formSuccess:
      "Obrigado. A sua mensagem foi enviada — entraremos em contacto em breve.",
    formMailto: "A abrir a sua aplicação de email com a mensagem pronta a enviar.",
    whatsappAria: "Fale connosco no WhatsApp",

    navPrivacy: "Política de Privacidade",
    navCookies: "Política de Cookies",
    navTerms: "Termos de Serviço",
    navCookiePrefs: "Preferências de cookies",
    footerRights: "Todos os direitos reservados.",
  },
} as const;

export type UiKey = keyof typeof ui.en;

export function tr(lang: Lang, key: UiKey): string {
  return ui[lang][key] ?? ui.en[key];
}

// Pick a Portuguese value for a dynamic item field when available, otherwise
// fall back to the base (English) value so the site never shows a blank.
export function loc(
  item: Record<string, unknown>,
  key: string,
  lang: Lang,
): string {
  const base = item[key];
  if (lang === "pt") {
    const pt = item[`${key}_pt`];
    if (pt !== undefined && pt !== null && String(pt).trim() !== "") {
      return String(pt);
    }
  }
  return base === undefined || base === null ? "" : String(base);
}
