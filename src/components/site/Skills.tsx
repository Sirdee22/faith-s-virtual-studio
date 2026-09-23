import { Reveal, SectionHeading } from "./Reveal";
import { ContentIcon } from "./icons";
import { str, type Block, type Skill, type SkillCategory } from "@/lib/site-types";

export function Skills({
  block,
  categories,
  skills,
}: {
  block?: Block;
  categories: SkillCategory[];
  skills: Skill[];
}) {
  const grouped = categories
    .map((category) => ({
      category,
      items: skills.filter((skill) => skill.category_id === category.id),
    }))
    .filter((group) => group.items.length > 0);

  const ungrouped = skills.filter(
    (skill) => !skill.category_id || !categories.some((c) => c.id === skill.category_id),
  );

  const hasContent = grouped.length > 0 || ungrouped.length > 0;

  return (
    <section id="skills" className="bg-cream py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={str(block, "eyebrow", "SKILLS")}
          title={str(block, "title")}
          subtitle={str(block, "subtitle")}
        />

        {!hasContent ? (
          <Reveal className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Skills will appear here once they are added in the dashboard.
          </Reveal>
        ) : (
          <div className="mt-12 space-y-10">
            {grouped.map((group, groupIndex) => (
              <Reveal key={group.category.id} delay={groupIndex * 60}>
                <h3 className="text-sm font-semibold tracking-wide">{group.category.name}</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </ul>
              </Reveal>
            ))}

            {ungrouped.length > 0 ? (
              <Reveal>
                {grouped.length > 0 ? (
                  <h3 className="text-sm font-semibold tracking-wide">More</h3>
                ) : null}
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ungrouped.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <li className="lift group rounded-xl border border-border bg-background p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <ContentIcon name={skill.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-medium">{skill.name}</p>
          {skill.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{skill.description}</p>
          ) : null}
          {typeof skill.proficiency === "number" ? (
            <div className="mt-3">
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-cream"
                role="progressbar"
                aria-valuenow={skill.proficiency}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${skill.name} proficiency`}
              >
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, skill.proficiency))}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
