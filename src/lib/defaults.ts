// Default content migrated from vladimir-fasij.com (see scripts/import-source.mjs).
// Used by `npm run seed` and as a fallback when the database is not configured or unreachable.
import source from "./source-content.json";
import type { ProjectData, ServiceData, SiteContentData } from "./types";

export const defaultSiteContent: SiteContentData = {
  brandName: "Vladimir - Fasij",
  tagline: "3D Visualisation & Design Studio",
  heroStages: [
    {
      eyebrow: "London · Since 2014",
      title: "Every great interior begins as an empty room",
      text: "Scroll to watch a blank canvas become a home.",
    },
    {
      eyebrow: "01 — Concept",
      title: "Ideas take shape",
      text: "Space planning, proportions and flow are sculpted before a single piece is chosen.",
    },
    {
      eyebrow: "02 — Furniture & FF&E",
      title: "Form becomes furniture",
      text: "Bespoke joinery and pieces from the world's best brands, selected and composed around the way you live.",
    },
    {
      eyebrow: "03 — Materials & Light",
      title: "Texture, tone and light",
      text: "Curtains, stone, timber and layered lighting bring warmth and depth to every surface.",
    },
    {
      eyebrow: "04 — Complete",
      title: "Your space, designed",
      text: "Photo-real before it is built. Exactly as imagined once it is.",
    },
    {
      eyebrow: "05 — Step inside",
      title: "Walk through it before it exists",
      text: "3D animation and virtual reality let you explore and engage with a space before it even exists.",
    },
    {
      eyebrow: "06 — Bespoke joinery",
      title: "Crafted in detail",
      text: "A made-to-measure media wall, back-lit shelving and a marble fireplace — every detail drawn, rendered and approved.",
    },
    {
      eyebrow: "07 — Live in it",
      title: "Let's bring your vision to life",
      text: "From the first concept to the final realisation, one studio carries your project all the way home.",
    },
  ],
  aboutTitle: "3D Visualisation & Design Studio",
  aboutText:
    "We are a London based design studio, comprised of architects, interior designers and 3D visualisers. Since 2014, we have successfully completed various projects and had the privilege of contributing to numerous luxurious multi-million developments across the UK, France, Monaco, Switzerland and the UAE.\n\nWe offer architectural 3D visualisation, animation and interior design services to private individuals, construction firms, architects, interior designers, as well as property developers.",
  portfolioIntro:
    "Over the past decade, our team has worked collaboratively with some of the finest designers and construction firms on a multitude of luxurious projects across the globe. Our portfolio showcases grand residential projects from Abu Dhabi, Saudi Arabia and the French Riviera — from Monaco to Cannes — alongside expansive office spaces and luxurious residential apartments in Mayfair, Belgravia and Chelsea.",
  showreel: source.showreel ? `youtube:${source.showreel}` : "",
  team: source.team,
  stats: [
    { value: "2014", label: "Studio founded" },
    { value: "15+", label: "Years of experience" },
    { value: "5", label: "Countries delivered" },
    { value: "12", label: "Featured projects" },
  ],
  process: [
    { title: "Brief & survey", text: "We carefully consider your aspirations and budget and understand how the space needs to work." },
    { title: "Concept & planning", text: "Space planning, zoning, materials and colours, refined together with you." },
    { title: "3D visualisation", text: "Photo-realistic renders, animation or VR so you can see it before it is built." },
    { title: "Drawings & delivery", text: "CAD packages, FF&E schedules and coordination with contractors through to completion." },
  ],
  contact: {
    email: "design@vladimir-fasij.com",
    phone: "+44 (0) 79 3148 6888",
    address: "London, United Kingdom",
  },
  socials: {
    instagram: "https://www.instagram.com/vladimir_fasij/",
    linkedin: "https://www.linkedin.com/in/vladimir-fasij-39038146/",
    youtube: "https://www.youtube.com/@akaFLASHone1",
  },
  seo: {
    title: "Vladimir Fasij — 3D Visualisation & Interior Design, London",
    description:
      "Interior design and photo-real 3D visualisation from London — renders, animation and VR for luxury homes and developments in the UK, France, Monaco and the UAE.",
    keywords:
      "interior design London, 3D visualisation, architectural rendering, 3D animation, virtual reality, FF&E, bespoke furniture, CAD drawings, luxury villa design",
    ogImage: "/og-image.jpg",
  },
};

const img = (slug: string) => (source.serviceImages as Record<string, string>)[slug] ?? "";

const s = (
  slug: string,
  title: string,
  icon: string,
  summary: string,
  content: string,
  features: string[],
  order: number,
): ServiceData => ({ id: slug, slug, title, icon, image: img(slug), summary, content, features, order, published: true, seo: {} });

export const defaultServices: ServiceData[] = [
  s("3d-visualisation", "3D Visualisation", "cube",
    "Cutting-edge computer graphics that bring interiors and architecture to life in vibrant, photo-realistic images.",
    "3D visualisation is a powerful tool which utilises cutting-edge computer graphics to bring your interiors and architectural projects to life in vibrant, photo-realistic images.\n\nFrom conceptual sketches to a final presentation, 3D visualisation provides a common language that facilitates clear communication among all stakeholders involved in the project.",
    ["Photo-realistic interior and exterior renders", "A common language for clients, architects and contractors", "From concept sketches to final presentation"],
    1),
  s("3d-animation", "3D Animation", "play",
    "A dynamic, immersive way to experience designed spaces before they are built.",
    "Our 3D animation services provide a dynamic and immersive way to visualise and experience designed spaces before they are built. These animations take architectural visualisation to the next level, creating a virtual tour of the interior or exterior.",
    ["Designers and architects can design their projects faster", "It becomes easier to present and discuss ideas", "Enhance the speed and effectiveness of selling your project"],
    2),
  s("360-virtual-reality", "360 & Virtual Reality", "vr",
    "Explore and engage with a space before it even exists.",
    "360 visualisation and virtual reality (VR) are cutting-edge technologies that are revolutionising interior design and architecture. We offer experiences that give clients a unique opportunity to explore and engage with a space before it even exists.",
    ["Virtually, yet fully experience and feel the spaces", "Make your presentations or demos interactive and fun"],
    3),
  s("architecture-landscaping", "Architecture & Landscaping", "building",
    "Conceptual designs for houses, villas and extensions with complementary landscape design.",
    "Our expertise lies in architectural and landscape design. We carefully consider your aspirations and budget to create conceptual designs for your house, villa or house extension, accompanied by complementary landscape designs that enhance their surroundings.\n\nDuring the design process, we collaborate with relevant consultants to ensure that our designs are in full compliance with local regulations and standards. We furnish detailed drawings and visualisations to provide a comprehensive and professional overview of the proposed design.",
    ["Concept design for houses, villas and extensions", "Landscape design integrated with the architecture", "Coordination with consultants and local regulations"],
    4),
  s("interior-design", "Interior Design", "sofa",
    "Aesthetically pleasing, functional interiors — from layout and flow to finishes and lighting.",
    "Interior design and interior architecture often entail modifying the internal structure and layout to enhance the flow and functionality of a space. This process involves creating both aesthetically pleasing and functional environments.",
    ["Space planning and layout design / zoning", "Selection of furniture, fabrics, finishes and colours", "Lighting design", "Coordination with contractors and other professionals", "Detailed technical drawings, specifications & finishes schedules"],
    5),
  s("furniture-ffe", "Furniture & FF&E", "chair",
    "Furniture, fixtures and equipment tailored to your needs, vision and budget — plus bespoke pieces.",
    "As part of our interior design services, we offer FF&E (furniture, fixtures and equipment) services to tailor a client's space to their unique needs, design vision and budget. We also design bespoke furniture, walk-in wardrobes, tables, credenzas and more.",
    ["Furniture supplied from the world's best brands", "Bespoke joinery and furniture tailored to each client", "Selection and supply of premium lighting fixtures", "Equipment that enhances the aesthetic of your space"],
    6),
  s("cad-drawings", "CAD Drawings", "ruler",
    "Detailed drawings for budgeting, construction and production of every design element.",
    "CAD drawings serve as a crucial tool for designers and architects, enabling them to bring their visions to life while ensuring functionality, compliance and client satisfaction.\n\nOur projects are supported by detailed drawings, which are essential documents for calculating the budget, construction and production of all design elements.",
    ["Floor plan layouts, new-build walls, floor finishes", "Wall elevations and detailed drawings", "Lighting & electrical layouts, RCP and MEP plans", "Bespoke furniture, joinery and built-ins"],
    7),
];

// Location, cleaned title/subtitle and SEO copy per imported project.
const projectMeta: Record<string, { title?: string; subtitle?: string; location: string; year?: string }> = {
  "albert-mews": { title: "House at Albert Mews", subtitle: "A neoclassical family house · 600 sq.m", location: "Romford, London, UK" },
  "villa-la-belle": { subtitle: "Neoclassical villa on the Cap Ferrat peninsula", location: "Saint-Jean-Cap-Ferrat, France" },
  "villa-at-saadiyat-island": { title: "Villa at Saadiyat Island", subtitle: "Family villa in paradise", location: "Saadiyat Island, Abu Dhabi, UAE" },
  "villa-nudra": { subtitle: "1,350 sq.m private villa clad in Jerusalem stone", location: "Nudra, Saadiyat Island, UAE" },
  "persian-gulf-coast-villa": { title: "Persian Gulf Coast Villa", subtitle: "Beachfront villa in the UAE capital", location: "Saadiyat Island, Abu Dhabi, UAE" },
  "villa-luna-cap-martin": { subtitle: "Villa with views over the whole of Monaco", location: "Cap Martin, France" },
  "cap-d-ail": { subtitle: "Two villas with views over the Mediterranean", location: "Cap d'Ail, France" },
  cannes: { subtitle: "Luxurious villa between Nice and Cannes", location: "Cannes, France" },
  "cap-ferrat": { title: "Villa La Fadarello", subtitle: "Multi-million mega mansion in the South of France", location: "Cap Ferrat, France" },
  belgravia: { subtitle: "A luxurious home in Belgravia's heart", location: "Belgravia, London, UK" },
  windsor: { title: "Windsor Estate", subtitle: "Elegant refinement meets modern luxury", location: "Windsor, UK" },
  chelsea: { title: "Chelsea Apartment", subtitle: "Modern apartment in the heart of London", location: "Chelsea, London, UK" },
};

const featuredSlugs = ["chelsea", "cap-ferrat", "villa-la-belle", "belgravia", "windsor", "villa-at-saadiyat-island"];

export const defaultProjects: ProjectData[] = source.projects
  .map((p) => {
    const meta = projectMeta[p.slug] ?? { location: "" };
    const subtitle = meta.subtitle ?? p.subtitle;
    const featuredIdx = featuredSlugs.indexOf(p.slug);
    return {
      id: p.slug,
      slug: p.slug,
      title: meta.title ?? p.title,
      subtitle,
      location: meta.location,
      category: p.category,
      year: meta.year ?? "",
      summary: p.content.split("\n\n")[0].split(/(?<=\.)\s/).slice(0, 2).join(" "),
      content: p.content,
      coverImage: p.coverImage,
      gallery: p.gallery,
      videos: p.videos,
      featured: featuredIdx !== -1,
      published: true,
      order: featuredIdx !== -1 ? featuredIdx + 1 : 10 + p.order,
      seo: {},
      highlights: [],
      publishAt: "",
      previewToken: "",
      createdAt: "",
    } satisfies ProjectData;
  })
  .sort((a, b) => a.order - b.order);
