import { useMemo, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reveal, SectionHeading } from "./Reveal";
import { mediaUrl, str, type Block, type Project } from "@/lib/site-types";
import { parseVideo, type VideoSource } from "@/lib/video";
import { cn } from "@/lib/utils";

export function Portfolio({ block, projects }: { block?: Block; projects: Project[] }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const project of projects) if (project.category) set.add(project.category);
    return ["All", ...Array.from(set)];
  }, [projects]);

  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="portfolio" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={str(block, "eyebrow", "PORTFOLIO")}
          title={str(block, "title")}
          subtitle={str(block, "subtitle")}
        />

        {projects.length === 0 ? (
          <Reveal className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-medium">Projects coming soon</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Selected work will be shared here. In the meantime, get in touch to talk through what
              you need.
            </p>
            <a
              href="#contact"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Start a conversation
            </a>
          </Reveal>
        ) : (
          <>
            {categories.length > 2 ? (
              <Reveal className="mt-10 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFilter(category)}
                    aria-pressed={filter === category}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors duration-300",
                      filter === category
                        ? "border-foreground bg-primary text-primary-foreground"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    {category}
                  </button>
                ))}
              </Reveal>
            ) : null}

            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {visible.map((project, index) => {
                const video = parseVideo(project.video_url);
                const image =
                  mediaUrl(project.image_url) ?? (video?.kind === "embed" ? video.thumb : undefined);
                return (
                  <Reveal as="li" key={project.id} delay={index * 60}>
                    <button
                      type="button"
                      onClick={() => setActive(project)}
                      className="lift group block w-full overflow-hidden rounded-2xl border border-border bg-background text-left"
                    >
                      <div className="relative overflow-hidden bg-cream">
                        {image ? (
                          <img
                            src={image}
                            alt={project.title}
                            loading="lazy"
                            className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid aspect-[16/10] w-full place-items-center text-sm text-muted-foreground">
                            {video ? "" : "No image"}
                          </div>
                        )}
                        {video ? (
                          <span
                            aria-hidden
                            className="absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-lg transition-transform duration-300 group-hover:scale-110"
                          >
                            <Play className="h-5 w-5 translate-x-0.5 fill-current" />
                          </span>
                        ) : null}
                      </div>
                      <div className="p-7">
                        {project.category ? <p className="eyebrow">{project.category}</p> : null}
                        <h3 className="mt-2 flex items-center gap-2 text-xl font-semibold">
                          {project.title}
                          <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </h3>
                        {project.summary ? (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {project.summary}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  </Reveal>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {active ? (
            <>
              <DialogHeader>
                {active.category ? <p className="eyebrow">{active.category}</p> : null}
                <DialogTitle className="text-2xl">{active.title}</DialogTitle>
                {active.summary ? (
                  <DialogDescription>{active.summary}</DialogDescription>
                ) : null}
              </DialogHeader>

              {parseVideo(active.video_url) ? (
                <VideoPlayer
                  video={parseVideo(active.video_url) as VideoSource}
                  title={active.title}
                  poster={mediaUrl(active.image_url)}
                />
              ) : mediaUrl(active.image_url) ? (
                <img
                  src={mediaUrl(active.image_url)}
                  alt={active.title}
                  className="w-full rounded-xl object-cover"
                />
              ) : null}

              {active.body ? (
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {active.body}
                </p>
              ) : null}

              {active.gallery?.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {active.gallery.map((src) => (
                    <img
                      key={src}
                      src={mediaUrl(src)}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              ) : null}

              {active.tools?.length ? (
                <div className="flex flex-wrap gap-2">
                  {active.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              ) : null}

              {active.link_url ? (
                <a
                  href={active.link_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  View project
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function VideoPlayer({
  video,
  title,
  poster,
}: {
  video: VideoSource;
  title: string;
  poster?: string | undefined;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      {video.kind === "embed" ? (
        <iframe
          src={video.src}
          title={`${title} video`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video
          src={video.src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full"
        >
          Your browser cannot play this video.
        </video>
      )}
    </div>
  );
}
