import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  adminDeleteRow,
  adminReorder,
  adminSaveBlock,
  adminSaveRow,
} from "@/lib/admin.functions";
import type { Block, CollectionName, Json } from "@/lib/site-types";
import { mediaUrl } from "@/lib/site-types";
import { Field, cleanValue, type FieldDef } from "./fields";

export function useRefresh() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-content"] }),
      qc.invalidateQueries({ queryKey: ["site-content"] }),
    ]);
}

export function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5 sm:p-7">
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SaveButton({ busy, label = "Save changes" }: { busy: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

/* ---------------- Page text blocks ---------------- */

export function BlockEditor({
  blockKey,
  block,
  fields,
  title,
  description,
}: {
  blockKey: string;
  block?: Block | undefined;
  fields: FieldDef[];
  title: string;
  description?: string;
}) {
  const [form, setForm] = useState<Block>(block ?? {});
  const [busy, setBusy] = useState(false);
  const save = useServerFn(adminSaveBlock);
  const refresh = useRefresh();

  useEffect(() => setForm(block ?? {}), [block]);

  return (
    <Panel title={title} description={description}>
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const data: Block = { ...form };
            for (const f of fields) data[f.name] = cleanValue(f, form[f.name]);
            await save({ data: { key: blockKey, data } });
            await refresh();
            toast.success("Saved — your website is updated");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save");
          } finally {
            setBusy(false);
          }
        }}
      >
        {fields.map((def) => (
          <Field
            key={def.name}
            def={def}
            idPrefix={blockKey}
            value={form[def.name]}
            onChange={(v) => setForm((prev) => ({ ...prev, [def.name]: v }))}
          />
        ))}
        <SaveButton busy={busy} />
      </form>
    </Panel>
  );
}

/* ---------------- Repeating list inside a block (e.g. Why Work With Me) ---------------- */

type ListItem = { title?: string; description?: string };

export function BlockListEditor({
  blockKey,
  block,
  listKey,
  title,
  description,
}: {
  blockKey: string;
  block?: Block | undefined;
  listKey: string;
  title: string;
  description?: string;
}) {
  const initial = Array.isArray(block?.[listKey]) ? (block![listKey] as ListItem[]) : [];
  const [items, setItems] = useState<ListItem[]>(initial);
  const [busy, setBusy] = useState(false);
  const save = useServerFn(adminSaveBlock);
  const refresh = useRefresh();

  useEffect(() => {
    setItems(Array.isArray(block?.[listKey]) ? (block![listKey] as ListItem[]) : []);
  }, [block, listKey]);

  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    setItems(next);
  };

  return (
    <Panel
      title={title}
      description={description}
      action={
        <button
          type="button"
          onClick={() => setItems([...items, { title: "", description: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const clean = items
              .filter((it) => (it.title ?? "").trim())
              .map((it) => ({ title: it.title ?? "", description: it.description ?? "" }));
            await save({ data: { key: blockKey, data: { ...(block ?? {}), [listKey]: clean as Json } } });
            await refresh();
            toast.success("Saved — your website is updated");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save");
          } finally {
            setBusy(false);
          }
        }}
      >
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here yet. Click Add to create one.</p>
        ) : null}
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-border p-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-3">
                <input
                  aria-label="Title"
                  value={item.title ?? ""}
                  placeholder="Title"
                  onChange={(e) =>
                    setItems(items.map((it, k) => (k === i ? { ...it, title: e.target.value } : it)))
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
                />
                <textarea
                  aria-label="Description"
                  rows={2}
                  value={item.description ?? ""}
                  placeholder="Short description"
                  onChange={(e) =>
                    setItems(
                      items.map((it, k) => (k === i ? { ...it, description: e.target.value } : it)),
                    )
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
                />
              </div>
              <div className="flex flex-col gap-1">
                <IconBtn label="Move up" onClick={() => move(i, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </IconBtn>
                <IconBtn label="Move down" onClick={() => move(i, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </IconBtn>
                <IconBtn label="Remove" onClick={() => setItems(items.filter((_, k) => k !== i))}>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            </div>
          </div>
        ))}
        <SaveButton busy={busy} />
      </form>
    </Panel>
  );
}

function IconBtn({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/* ---------------- Collections (services, skills, projects…) ---------------- */

type Row = Record<string, Json> & { id: string; published: boolean; sort_order: number };

export function CollectionManager({
  table,
  rows,
  fields,
  title,
  description,
  singular,
  primaryField,
  secondary,
  imageField,
  defaults = {},
  openNew,
  onOpenNewHandled,
  emptyText,
}: {
  table: CollectionName;
  rows: Row[];
  fields: FieldDef[];
  title: string;
  description?: string;
  singular: string;
  primaryField: string;
  secondary?: (row: Row) => string | null | undefined;
  imageField?: string;
  defaults?: Record<string, Json>;
  openNew?: boolean;
  onOpenNewHandled?: () => void;
  emptyText?: string;
}) {
  const [editing, setEditing] = useState<Record<string, Json> | null>(null);
  const [confirm, setConfirm] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const saveRow = useServerFn(adminSaveRow);
  const deleteRow = useServerFn(adminDeleteRow);
  const reorder = useServerFn(adminReorder);
  const refresh = useRefresh();

  const startNew = () => setEditing({ ...defaults, published: true });

  useEffect(() => {
    if (openNew) {
      startNew();
      onOpenNewHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNew]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await fn();
      await refresh();
      toast.success(success);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const ids = rows.map((r) => r.id);
    [ids[index], ids[j]] = [ids[j]!, ids[index]!];
    void run(() => reorder({ data: { table, ids } }), "Order updated");
  };

  return (
    <Panel
      title={title}
      description={description}
      action={
        <button
          type="button"
          onClick={startNew}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add {singular}
        </button>
      }
    >
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {emptyText ?? `No ${singular}s yet. Click “Add ${singular}” to create your first one.`}
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {rows.map((row, index) => {
            const img = imageField ? mediaUrl(row[imageField] as string | null) : undefined;
            const sub = secondary?.(row);
            return (
              <li key={row.id} className="flex items-center gap-3 p-3 sm:p-4">
                {imageField ? (
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {String(row[primaryField] ?? "") || "Untitled"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.published ? "Visible on website" : "Hidden (draft)"}
                    {sub ? ` · ${sub}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  <IconBtn label="Move up" onClick={() => move(index, -1)} disabled={busy || index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    label="Move down"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === rows.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    label={row.published ? "Hide from website" : "Show on website"}
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => saveRow({ data: { table, row: { ...row, published: !row.published } } }),
                        row.published ? "Hidden from website" : "Now visible on website",
                      )
                    }
                  >
                    {row.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn label="Edit" onClick={() => setEditing(row)}>
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Delete" onClick={() => setConfirm(row)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.["id"] ? `Edit ${singular}` : `Add ${singular}`}</DialogTitle>
            <DialogDescription>Changes appear on your website as soon as you save.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!String(editing[primaryField] ?? "").trim()) {
                  toast.error("Please fill in the first field");
                  return;
                }
                const row: Record<string, Json> = {};
                if (editing["id"]) row["id"] = editing["id"];
                for (const f of fields) row[f.name] = cleanValue(f, editing[f.name]);
                row["published"] = editing["published"] !== false;
                if (!editing["id"]) row["sort_order"] = rows.length;
                const ok = await run(() => saveRow({ data: { table, row } }), "Saved — your website is updated");
                if (ok) setEditing(null);
              }}
            >
              {fields.map((def) => (
                <Field
                  key={def.name}
                  def={def}
                  idPrefix={table}
                  value={editing[def.name]}
                  onChange={(v) => setEditing((prev) => ({ ...(prev ?? {}), [def.name]: v }))}
                />
              ))}
              <Field
                def={{ name: "published", label: "Show on website", type: "checkbox" }}
                idPrefix={table}
                value={editing["published"] !== false}
                onChange={(v) => setEditing((prev) => ({ ...(prev ?? {}), published: v }))}
              />
              <div className="flex gap-2">
                <SaveButton busy={busy} label="Save" />
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              “{String(confirm?.[primaryField] ?? "")}” will be removed permanently. To keep it but
              hide it, use the eye button instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm) void run(() => deleteRow({ data: { table, id: confirm.id } }), "Deleted");
                setConfirm(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
