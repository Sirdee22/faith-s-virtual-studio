import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import type { SitePayload } from "./site-types";
import { EMPTY_PAYLOAD, withDefaults } from "./defaults";

/** Public, read-only site content. Safe for SSR and anonymous visitors. */
export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SitePayload> => {
    const { publicClient } = await import("./supabase.server");
    const sb = publicClient();
    try {
      const [blocks, services, skillCategories, skills, projects, testimonials, processSteps, links] =
        await Promise.all([
          sb.from("content_blocks").select("key, data"),
          sb.from("services").select("*").order("sort_order"),
          sb.from("skill_categories").select("*").order("sort_order"),
          sb.from("skills").select("*").order("sort_order"),
          sb.from("projects").select("*").order("sort_order"),
          sb.from("testimonials").select("*").order("sort_order"),
          sb.from("process_steps").select("*").order("sort_order"),
          sb.from("platform_links").select("*").order("sort_order"),
        ]);

      const blockMap: SitePayload["blocks"] = {};
      for (const row of blocks.data ?? []) {
        blockMap[row.key as string] = (row.data ?? {}) as SitePayload["blocks"][string];
      }

      return withDefaults({
        blocks: blockMap,
        services: (services.data ?? []) as SitePayload["services"],
        skillCategories: (skillCategories.data ?? []) as SitePayload["skillCategories"],
        skills: (skills.data ?? []) as SitePayload["skills"],
        projects: (projects.data ?? []) as SitePayload["projects"],
        testimonials: (testimonials.data ?? []) as SitePayload["testimonials"],
        processSteps: (processSteps.data ?? []) as SitePayload["processSteps"],
        links: (links.data ?? []) as SitePayload["links"],
      });
    } catch {
      return withDefaults(EMPTY_PAYLOAD);
    }
  },
);

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
});
