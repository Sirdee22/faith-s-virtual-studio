import { createServerFn } from "@tanstack/react-start";
import { COLLECTIONS, type CollectionName, type Json, type SitePayload } from "./site-types";
import { withDefaults } from "./defaults";

function assertCollection(value: string): CollectionName {
  if (!(COLLECTIONS as readonly string[]).includes(value)) {
    throw new Error("Unknown content type");
  }
  return value as CollectionName;
}

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isAdmin } = await import("./admin-session.server");
  return { authenticated: await isAdmin() };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({ password: String(data?.password ?? "") }))
  .handler(async ({ data }) => {
    const { passwordMatches, sessionConfig } = await import("./admin-session.server");
    const { useSession } = await import("@tanstack/react-start/server");
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected) {
      return { ok: false as const, reason: "not-configured" as const };
    }
    if (!data.password || !(await passwordMatches(data.password, expected))) {
      return { ok: false as const, reason: "invalid" as const };
    }
    const session = await useSession<{ admin?: boolean }>(sessionConfig());
    await session.update({ admin: true });
    return { ok: true as const, reason: null };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { sessionConfig } = await import("./admin-session.server");
  const { useSession } = await import("@tanstack/react-start/server");
  const session = await useSession<{ admin?: boolean }>(sessionConfig());
  await session.clear();
  return { ok: true };
});

/** Everything, including unpublished rows. Admin only. */
export const adminGetContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SitePayload> => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { adminClient } = await import("./supabase.server");
    const sb = adminClient();

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
  },
);

export const adminSaveBlock = createServerFn({ method: "POST" })
  .inputValidator((data: { key: string; data: Record<string, Json> }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { adminClient } = await import("./supabase.server");
    const { error } = await adminClient()
      .from("content_blocks")
      .upsert({ key: data.key, data: data.data }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSaveRow = createServerFn({ method: "POST" })
  .inputValidator((data: { table: string; row: Record<string, Json> }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const table = assertCollection(data.table);
    const { adminClient } = await import("./supabase.server");
    const row = { ...data.row };
    if (!row["id"]) delete row["id"];
    const { data: saved, error } = await adminClient()
      .from(table)
      .upsert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: saved?.id as string };
  });

export const adminDeleteRow = createServerFn({ method: "POST" })
  .inputValidator((data: { table: string; id: string }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const table = assertCollection(data.table);
    const { adminClient } = await import("./supabase.server");
    const { error } = await adminClient().from(table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReorder = createServerFn({ method: "POST" })
  .inputValidator((data: { table: string; ids: string[] }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const table = assertCollection(data.table);
    const { adminClient } = await import("./supabase.server");
    const sb = adminClient();
    await Promise.all(
      data.ids.map((id, index) => sb.from(table).update({ sort_order: index }).eq("id", id)),
    );
    return { ok: true };
  });

export const adminUploadImage = createServerFn({ method: "POST" })
  .inputValidator((data: { filename: string; dataUrl: string }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();

    const match = /^data:([\w/+.-]+);base64,(.+)$/.exec(data.dataUrl);
    if (!match) throw new Error("Unsupported file");
    const contentType = match[1]!;
    if (!contentType.startsWith("image/")) throw new Error("Only images can be uploaded");
    const binary = Uint8Array.from(atob(match[2]!), (c) => c.charCodeAt(0));
    if (binary.byteLength > 8 * 1024 * 1024) throw new Error("Image must be under 8MB");

    const safeName = data.filename.replace(/[^\w.-]/g, "-").slice(-60) || "image";
    const path = `uploads/${Date.now()}-${safeName}`;

    const { adminClient } = await import("./supabase.server");
    const { error } = await adminClient()
      .storage.from("media")
      .upload(path, binary, { contentType, upsert: false });
    if (error) throw new Error(error.message);
    return { path };
  });
