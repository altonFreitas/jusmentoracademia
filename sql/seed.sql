-- JusMentor Academia — seed content
-- Run this in the Supabase SQL Editor after sql/schema.sql.

insert into public.site_settings (
  id, name, short_name, hero_label, hero_title, hero_description, tagline, email, phone, whatsapp,
  address, founded, mission, vision, focus, about, facebook, instagram, youtube, tiktok
)
values (
  1,
  'JusMentor Academia',
  'JMA',
  'Legal education institute · Díli, Timor-Leste',
  'Empowering communities through legal education, advocacy, and modern learning.',
  'JusMentor Academia is a legal education institute in Díli, Timor-Leste. Through courses, seminars, and advocacy, we help students, youth, and communities understand their rights and build a stronger culture of justice.',
  'Legal Education · Advocacy · Training · Community Empowerment',
  'jusmentoracademia@gmail.com',
  '+670 7511 4252',
  '67075114252',
  'Surikmas, Díli, Timor-Leste',
  '2024',
  'To make quality legal education, practical training, and advocacy available to the people who need it most, turning legal knowledge into everyday confidence.',
  'A Timor-Leste where every person understands their rights, and where a new generation of ethical, well-trained leaders carries justice forward.',
  'Courses and short training, public seminars, youth leadership, and community advocacy across Timor-Leste.',
  'JusMentor Academia was founded to close the distance between people and the law. Through clear teaching, open seminars, and community advocacy, we help students and citizens understand their rights, think critically, and act with confidence. We believe education is the foundation of responsible leadership and a fairer society.',
  'https://www.facebook.com/profile.php?id=61571016560363',
  'https://www.instagram.com/jusmentoracademia/',
  'https://www.youtube.com/@JusMentorAcademia',
  'https://www.tiktok.com/@jusmentor.academia'
)
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  hero_label = excluded.hero_label,
  hero_title = excluded.hero_title,
  hero_description = excluded.hero_description,
  tagline = excluded.tagline,
  email = excluded.email,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  address = excluded.address,
  founded = excluded.founded,
  mission = excluded.mission,
  vision = excluded.vision,
  focus = excluded.focus,
  about = excluded.about,
  facebook = excluded.facebook,
  instagram = excluded.instagram,
  youtube = excluded.youtube,
  tiktok = excluded.tiktok,
  updated_at = now();

truncate table public.services, public.programs, public.team, public.events, public.testimonials, public.faqs, public.partners, public.gallery restart identity;

insert into public.services (title, description, sort_order) values
('Legal Education', 'Clear, structured lessons that turn complex legal ideas into knowledge you can use in daily life, study, and work.', 0),
('Courses & Training', 'Short courses and skills-based training that build practical capability for students, youth, and community organisations.', 1),
('Talks & Seminars', 'Public seminars and academic discussions on the legal and social issues that matter most to our communities.', 2),
('Advocacy & Community Support', 'Awareness campaigns and grassroots initiatives that promote justice, civic responsibility, and equal access to the law.', 3);

insert into public.programs (title, format, description, sort_order) values
('Online Lessons', 'Learn from anywhere', 'Live and recorded sessions that let you study legal topics from any device, at a pace that fits your schedule.', 0),
('Legal Terms & Concepts', 'Foundations', 'Plain-language explanations of the legal terms and ideas everyone should understand, with no prior background needed.', 1),
('Community Seminar Series', 'In your community', 'Interactive seminars that bring legal education and open discussion directly to schools, groups, and neighbourhoods.', 2);

insert into public.team (name, role, bio, sort_order) values
('Academic & Curriculum', 'Teaching & program quality', 'Designs the curriculum, keeps teaching standards high, and develops new courses and learning materials.', 0),
('Advocacy & Outreach', 'Community engagement', 'Builds relationships with communities and partners and leads awareness campaigns across Timor-Leste.', 1),
('Training & Events', 'Workshops & seminars', 'Plans and runs the workshops, seminars, and public events that bring our programs to life.', 2);

insert into public.events (title, date_label, location, summary, sort_order) values
('Legal Awareness Seminar', 'Monthly', 'Díli, Timor-Leste', 'An open, public seminar on rights, responsibilities, and the everyday law that shapes our communities.', 0),
('Youth Leadership Training', 'Quarterly', 'In-person & online', 'A hands-on program that pairs legal understanding with leadership skills and real community action.', 1),
('Online Learning Session', 'Weekly', 'Online', 'A short, focused lesson that makes a single legal concept clear, then opens the floor for questions.', 2);

insert into public.testimonials (name, role, quote, sort_order) values
('Course participant', 'Díli', 'The lessons made legal ideas feel simple and useful. For the first time, I understood rights I never knew I had.', 0),
('Seminar attendee', 'Community member', 'Engaging, modern, and genuinely relevant for young people. The seminars start real conversations.', 1),
('Training participant', 'Youth leader', 'Professional, inspiring, and practical. I left ready to take action in my own community.', 2);

insert into public.faqs (question, answer, sort_order) values
('Who can join JusMentor Academia programs?', 'Anyone with an interest in the law and their community, from students and youth leaders to professionals and members of the public. Most programs need no prior legal background.', 0),
('Are programs online, in person, or both?', 'Both. We run online lessons you can join from anywhere, along with in-person seminars and training across Timor-Leste.', 1),
('Do the programs cost anything?', 'Many of our seminars and awareness activities are open to the public at no cost. For specific courses and training, contact us and we will share the current details.', 2),
('How can an organisation partner with us?', 'Schools, NGOs, and institutions are welcome to collaborate on seminars, training, and advocacy. Reach out by email or WhatsApp and we will take it from there.', 3);

insert into public.partners (name, tag, url, sort_order) values
('Universities & Schools', 'Academic collaboration', '', 0),
('Community Organisations', 'Outreach & advocacy', '', 1),
('Youth Networks', 'Leadership & training', '', 2);

insert into public.gallery (title, category, image, sort_order) values
('Seminar in session', 'Education', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 0),
('Hands-on training', 'Training', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', 1),
('Community dialogue', 'Advocacy', 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80', 2);
