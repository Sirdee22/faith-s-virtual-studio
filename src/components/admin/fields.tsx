import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { adminUploadImage } from "@/lib/admin.functions";
import { mediaUrl, type Json } from "@/lib/site-types";
import { ICON_NAMES, ContentIcon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export type FieldDef = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "image"
    | "gallery"
    | "lines"
    | "number"
    | "select"
    | "icon"
    | "checkbox";
  help?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground";

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function useUpload() {
  const upload = useServerFn(adminUploadImage);
  return async (file: File) => {
    if (file.size > 8 * 1024 * 1024) throw new Error("Image must be under 8MB");
    const dataUrl = await readFile(file);
    const { path } = await upload({ data: { filename: file.name, dataUrl } });
    return path;
  };
}

function ImagePicker({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = useUpload();
  const src = mediaUrl(value);

  return (
    <div className="flex items-center gap-4">
      <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-cream">
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {src ? "Change image" : "Upload image"}
        </button>
        {src ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Remove
          </button>
        ) : null}
      </div>
      <input
        id={id}
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onChange(await upload(file));
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

function GalleryPicker({
  value,
  onChange,
  id,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  id: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = useUpload();

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((path) => (
          <div key={path} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
            <img src={mediaUrl(path)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onChange(value.filter((p) => p !== path))}
              className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-background"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="grid h-20 w-20 place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-foreground"
          aria-label="Add images"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        </button>
      </div>
      <input
        id={id}
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          try {
            const paths: string[] = [];
            for (const file of files) paths.push(await upload(file));
            onChange([...value, ...paths]);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

export function Field({
  def,
  value,
  onChange,
  idPrefix,
}: {
  def: FieldDef;
  value: Json | undefined;
  onChange: (v: Json) => void;
  idPrefix: string;
}) {
  const id = `${idPrefix}-${def.name}`;
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  let control: React.ReactNode;
  switch (def.type) {
    case "textarea":
      control = (
        <textarea
          id={id}
          rows={5}
          value={str}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      );
      break;
    case "image":
      control = <ImagePicker id={id} value={str} onChange={onChange} />;
      break;
    case "gallery":
      control = (
        <GalleryPicker
          id={id}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );
      break;
    case "lines":
      control = (
        <textarea
          id={id}
          rows={4}
          value={Array.isArray(value) ? (value as string[]).join("\n") : ""}
          placeholder="One per line"
          onChange={(e) => onChange(e.target.value.split("\n"))}
          className={inputCls}
        />
      );
      break;
    case "number":
      control = (
        <input
          id={id}
          type="number"
          min={0}
          max={100}
          value={value == null || value === "" ? "" : String(value)}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className={inputCls}
        />
      );
      break;
    case "select":
      control = (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value || null)} className={inputCls}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "icon":
      control = (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={`${id}-label`}>
          {ICON_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={str === name}
              aria-label={name}
              onClick={() => onChange(name)}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-lg border transition-colors",
                str === name
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground",
              )}
            >
              <ContentIcon name={name} className="h-4 w-4" />
            </button>
          ))}
        </div>
      );
      break;
    case "checkbox":
      return (
        <label htmlFor={id} className="flex items-center gap-3 text-sm">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-foreground"
          />
          {def.label}
        </label>
      );
    default:
      control = (
        <input
          id={id}
          type="text"
          value={str}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      );
  }

  return (
    <div className="space-y-2">
      <label id={`${id}-label`} htmlFor={id} className="block text-sm font-medium">
        {def.label}
      </label>
      {control}
      {def.help ? <p className="text-xs text-muted-foreground">{def.help}</p> : null}
    </div>
  );
}

/** Cleans a form value before saving (e.g. trims empty lines). */
export function cleanValue(def: FieldDef, value: Json | undefined): Json {
  if (def.type === "lines") {
    return Array.isArray(value)
      ? (value as string[]).map((s) => String(s).trim()).filter(Boolean)
      : [];
  }
  if (def.type === "gallery") return Array.isArray(value) ? value : [];
  if (def.type === "checkbox") return value === true;
  if (def.type === "number") return typeof value === "number" ? value : null;
  if (value === undefined) return null;
  return value;
}
