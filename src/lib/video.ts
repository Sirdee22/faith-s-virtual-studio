/**
 * Turns a pasted video link into something the website can play inline.
 * Supports YouTube, Vimeo, Google Drive and direct video files (.mp4, .webm ...).
 * Returns null for anything else so the page never renders a broken player.
 */
export type VideoSource =
  | { kind: "embed"; src: string; thumb?: string }
  | { kind: "file"; src: string };

const FILE_EXT = /\.(mp4|webm|ogg|mov|m4v)$/i;

export function parseVideo(input?: string | null): VideoSource | null {
  const raw = input?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  // YouTube
  let youtubeId: string | null = null;
  if (host === "youtu.be") {
    youtubeId = url.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      youtubeId = url.searchParams.get("v");
    } else {
      const m = /^\/(?:embed|shorts|live)\/([\w-]+)/.exec(url.pathname);
      youtubeId = m?.[1] ?? null;
    }
  }
  if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
    return {
      kind: "embed",
      src: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`,
      thumb: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  // Vimeo (also handles unlisted links like vimeo.com/123456/abcdef)
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = /\/(\d{6,})(?:\/([a-z0-9]+))?/i.exec(url.pathname);
    if (m) {
      const hash = m[2] ?? url.searchParams.get("h");
      const query = hash ? `?h=${encodeURIComponent(hash)}` : "";
      return { kind: "embed", src: `https://player.vimeo.com/video/${m[1]}${query}` };
    }
  }

  // Google Drive (the file must be shared as "Anyone with the link")
  if (host === "drive.google.com") {
    const m = /\/file\/d\/([\w-]+)/.exec(url.pathname);
    const id = m?.[1] ?? url.searchParams.get("id");
    if (id && /^[\w-]+$/.test(id)) {
      return { kind: "embed", src: `https://drive.google.com/file/d/${id}/preview` };
    }
  }

  // A direct link to a video file
  if (FILE_EXT.test(url.pathname)) {
    return { kind: "file", src: url.toString() };
  }

  return null;
}
