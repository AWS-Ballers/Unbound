export const templateCatalog = [
  {
    key: "launch-cinematic",
    name: "Launch Cinematic",
    category: "Hero",
    description: "Premium reveal with dramatic movement, mood lighting, and a sharp product payoff.",
    style: "Cinematic camera sweeps, dark polished environments, premium contrast, emotionally charged pacing.",
  },
  {
    key: "tvc",
    name: "TVC",
    category: "Brand",
    description: "Commercial-style storytelling built for broad appeal and polished brand positioning.",
    style: "Fast-cut scenes, aspirational imagery, high-end production polish, headline-driven messaging.",
  },
  {
    key: "product-demo",
    name: "Product Demo",
    category: "Utility",
    description: "Feature-led flow that makes product interactions feel tangible and desirable.",
    style: "UI closeups, precise transitions, contextual overlays, crisp framing.",
  },
  {
    key: "brand-story",
    name: "Brand Story",
    category: "Narrative",
    description: "A founder-energy narrative arc with market tension, mission, and momentum.",
    style: "Editorial storytelling, emotional pacing, human-centric framing, warm narrative beats.",
  },
  {
    key: "feature-highlight",
    name: "Feature Highlight",
    category: "Utility",
    description: "Short, punchy video focused on a standout capability or workflow.",
    style: "Focused framing, dynamic callouts, clean environment, confident tempo.",
  },
  {
    key: "explainer",
    name: "Explainer",
    category: "Education",
    description: "Clear concept-driven story for products that need teaching before selling.",
    style: "Readable pacing, visual metaphors, structured progression, grounded clarity.",
  },
  {
    key: "investor-clip",
    name: "Investor Clip",
    category: "Investor",
    description: "High-signal pitch video emphasizing market size, traction, and defensibility.",
    style: "Authority-driven visuals, macro market cues, bold metrics, restrained drama.",
  },
  {
    key: "social-ad",
    name: "Social Ad",
    category: "Growth",
    description: "Mobile-friendly punch with fast value framing and immediate call to action.",
    style: "High contrast, rapid hooks, compact scenes, direct CTA framing.",
  },
  {
    key: "event-teaser",
    name: "Event Teaser",
    category: "Launch",
    description: "Build hype around a launch moment, reveal, or upcoming campaign.",
    style: "Pulse-driven motion, anticipation cuts, dramatic typography, countdown energy.",
  },
  {
    key: "testimonial-reel",
    name: "Testimonial Reel",
    category: "Trust",
    description: "Social-proof-led montage that turns validation into momentum.",
    style: "Human moments, quote-driven structure, soft cinematic light, grounded credibility.",
  },
] as const;

export type TemplateCatalogItem = (typeof templateCatalog)[number];
