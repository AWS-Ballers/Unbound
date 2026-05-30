type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl";

  const classes =
    tone === "light"
      ? {
          eyebrow: "text-violet-200/80",
          title: "text-white",
          description: "text-white/70",
        }
      : {
          eyebrow: "text-violet-700/80",
          title: "text-zinc-950",
          description: "text-zinc-600",
        };

  return (
    <div className={alignment}>
      <p
        className={`text-xs font-semibold uppercase tracking-[0.28em] ${classes.eyebrow}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-display text-4xl leading-tight sm:text-5xl ${classes.title}`}
      >
        {title}
      </h2>
      <p className={`mt-5 text-base leading-7 sm:text-lg ${classes.description}`}>
        {description}
      </p>
    </div>
  );
}
