function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchWebsiteSource(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to fetch website content");
  }

  const html = await response.text();
  const text = stripHtml(html).slice(0, 12000);
  const imageMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].slice(0, 6);

  return {
    html,
    text,
    images: imageMatches.map((match) => match[1]),
  };
}
