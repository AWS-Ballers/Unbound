import {
  Bot,
  BrainCircuit,
  Clapperboard,
  FileText,
  Github,
  LayoutTemplate,
  Link2,
  MessageSquareText,
  ScanSearch,
  Video,
  WandSparkles,
} from "lucide-react";

export const integrations = [
  { label: "GitHub", icon: Github },
  { label: "Product docs", icon: FileText },
  { label: "Website URLs", icon: Link2 },
  { label: "PixVerse", icon: Video },
  { label: "AI workspace", icon: BrainCircuit },
];

export const problems = [
  "Product context lives in too many places: repos, docs, screenshots, decks, and random notes.",
  "Video creation still starts with manual briefs, fragmented prompts, and slow creative handoffs.",
  "Teams need multiple launch formats, but rebuilding the story for each cut wastes time.",
  "Most workflows stop at generation instead of giving you one place to edit, save, and publish assets.",
];

export const steps = [
  {
    index: "01",
    title: "Build a workspace",
    description:
      "Start with a product workspace that can absorb GitHub repos, URLs, docs, screenshots, slides, and free text.",
  },
  {
    index: "02",
    title: "Let AI map the product",
    description:
      "Launchly summarizes every source into a structured brief with positioning, audience, features, proof points, and CTA.",
  },
  {
    index: "03",
    title: "Choose a format or skip",
    description:
      "Review cinematic templates with visual thumbnails, pick one, or skip template selection and generate directly from the brief.",
  },
  {
    index: "04",
    title: "Generate, edit, and save",
    description:
      "Create videos and images, refine them with PixVerse-powered edits, then save every asset into the workspace library.",
  },
];

export const features = [
  {
    title: "Universal workspace intake",
    description:
      "Bring GitHub repos, websites, PDFs, slides, screenshots, logos, and raw descriptions into one workspace.",
    icon: ScanSearch,
  },
  {
    title: "Source-aware AI brief",
    description:
      "OpenAI turns scattered inputs into a clean product brief your team can refine before creation starts.",
    icon: Bot,
  },
  {
    title: "Repo copilot chat",
    description:
      "Use a right-side chatbot to inspect the repo context, suggest missing sources, and strengthen the brief.",
    icon: MessageSquareText,
  },
  {
    title: "Template-first generation",
    description:
      "Show rich template cards with visuals, aspect ratios, timing, and best-fit hints before generating a video.",
    icon: LayoutTemplate,
  },
  {
    title: "Video + image creation",
    description:
      "Generate launch videos, social cuts, and supporting imagery from the same workspace understanding.",
    icon: Clapperboard,
  },
  {
    title: "Edit and library loop",
    description:
      "Modify, extend, restyle, download, and save every asset back into a single searchable library.",
    icon: WandSparkles,
  },
];

export const templates = [
  {
    title: "Launch Cinematic",
    description:
      "High-drama interface reveals for flagship launches and homepage hero moments.",
    meta: "16:9 • 45s",
    tone: "Hero reveal",
    theme: "from-[#17152b] via-[#5f47f5] to-[#8ce7ff]",
  },
  {
    title: "TVC",
    description:
      "Fast commercial pacing for broader awareness, sharper hooks, and memorable brand framing.",
    meta: "16:9 • 30s",
    tone: "Commercial cut",
    theme: "from-[#261510] via-[#b05c2f] to-[#f5cb84]",
  },
  {
    title: "Product Demo",
    description:
      "UI-led storytelling for showing real flows, feature depth, and product clarity.",
    meta: "16:9 • 60s",
    tone: "Workflow focus",
    theme: "from-[#12253b] via-[#2f79d9] to-[#b2ebff]",
  },
  {
    title: "Brand Story",
    description:
      "Narrative pacing with mood, typography, and category positioning.",
    meta: "16:9 • 75s",
    tone: "Narrative mood",
    theme: "from-[#2e1127] via-[#8f4279] to-[#f3b7cb]",
  },
  {
    title: "Feature Highlight",
    description: "Tight clips around one hero capability with stronger CTA focus.",
    meta: "1:1 • 20s",
    tone: "Single feature",
    theme: "from-[#10251b] via-[#2fa866] to-[#c9efc7]",
  },
  {
    title: "Explainer",
    description:
      "Calm, trust-building structure for products that need category education.",
    meta: "16:9 • 60s",
    tone: "Clear framing",
    theme: "from-[#122231] via-[#4f90bc] to-[#d8eef8]",
  },
  {
    title: "Social Ad",
    description:
      "Vertical, fast-cut motion for ads, teasers, and launch week clips.",
    meta: "9:16 • 15s",
    tone: "Vertical social",
    theme: "from-[#260f2d] via-[#d047da] to-[#ffc7f3]",
  },
  {
    title: "Investor Clip",
    description:
      "Signal, traction, and category framing tuned for updates, decks, and fundraising.",
    meta: "16:9 • 40s",
    tone: "Executive signal",
    theme: "from-[#1b1f2c] via-[#5d6784] to-[#dbe0eb]",
  },
];

export const useCases = [
  {
    title: "SaaS / Devtools",
    description:
      "Turn release notes, product surfaces, and docs into feature launches, demos, and upgrade campaigns.",
  },
  {
    title: "Finance / Fintech",
    description:
      "Create trust-first explainers and polished product spotlights without agency turnaround times.",
  },
  {
    title: "E-commerce / D2C",
    description:
      "Generate promo videos, social variants, and product showcases from one reusable workspace brief.",
  },
];

export const pricing = [
  {
    name: "Free",
    price: "$0",
    description: "Best for hackathon demos and first product launches.",
    features: ["1 workspace", "3 video generations", "Basic templates"],
  },
  {
    name: "Starter",
    price: "$19",
    description: "For small teams building repeatable launch workflows.",
    features: ["10 videos / month", "All templates", "Launchly Studio"],
    featured: true,
  },
  {
    name: "Pro",
    price: "$49",
    description:
      "For teams shipping launches, updates, and campaigns continuously.",
    features: ["Unlimited videos", "Priority generation", "Team collaboration"],
  },
];

export const faqs = [
  {
    question: "What sources can I add into Launchly?",
    answer:
      "You can start with GitHub repositories, website URLs, product docs, PDFs, slides, screenshots, logos, and free-text descriptions.",
  },
  {
    question: "Do I need to write prompts myself?",
    answer:
      "No. Launchly creates PixVerse-optimized prompts from your workspace brief, then lets you refine them if you want more control.",
  },
  {
    question: "Can I skip template selection?",
    answer:
      "Yes. You can review the template gallery, go back, or hit skip to generate directly from the product brief and selected output settings.",
  },
  {
    question: "How does editing work after generation?",
    answer:
      "Generated clips can be modified, extended, or restyled through the Edit workflow, and finished assets are saved back into your library.",
  },
  {
    question: "Can Launchly generate images too?",
    answer:
      "Yes. The same workspace can power supporting image generation for thumbnails, campaign stills, and social launch assets.",
  },
];
