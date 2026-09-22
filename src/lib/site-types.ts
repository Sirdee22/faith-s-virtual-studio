export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  image_url: string | null;
  items: string[];
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
  published: boolean;
};

export type SkillCategory = {
  id: string;
  name: string;
  sort_order: number;
  published: boolean;
};

export type Skill = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  proficiency: number | null;
  category_id: string | null;
  sort_order: number;
  published: boolean;
};

export type Project = {
  id: string;
  title: string;
  category: string | null;
  summary: string | null;
  body: string | null;
  image_url: string | null;
  gallery: string[];
  tools: string[];
  link_url: string | null;
  sort_order: number;
  published: boolean;
};

export type Testimonial = {
  id: string;
  client_name: string;
  client_role: string | null;
  quote: string;
  image_url: string | null;
  sort_order: number;
  published: boolean;
};

export type ProcessStep = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  published: boolean;
};

export type PlatformLink = {
  id: string;
  name: string;
  url: string;
  icon: string | null;
  kind: string;
  sort_order: number;
  published: boolean;
};

export type Blocks = Record<string, Record<string, unknown>>;

export type SitePayload = {
  blocks: Blocks;
  services: Service[];
  skillCategories: SkillCategory[];
  skills: Skill[];
  projects: Project[];
  testimonials: Testimonial[];
  processSteps: ProcessStep[];
  links: PlatformLink[];
};

export const COLLECTIONS = [
  "services",
  "skill_categories",
  "skills",
  "projects",
  "testimonials",
  "process_steps",
  "platform_links",
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

/** Turns a stored image value into a browser URL. */
export function mediaUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return `/api/public/media/${value}`;
}
