import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { adminLogin, adminStatus } from "@/lib/admin.functions";
import { AdminApp } from "@/components/admin/AdminApp";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Website editor" },
      { name: "description", content: "Private area for editing the portfolio." },
      { property: "og:title", content: "Admin — Website editor" },
      { property: "og:description", content: "Private area for editing the portfolio." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const status = useServerFn(adminStatus);
  const { data, isLoading } = useQuery({ queryKey: ["admin-status"], queryFn: () => status() });

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return data?.authenticated ? <AdminApp /> : <Login />;
}

function Login() {
  const login = useServerFn(adminLogin);
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const res = await login({ data: { email, password } });
            if (res.ok) {
              await qc.invalidateQueries({ queryKey: ["admin-status"] });
            } else {
              setError("That email or password isn't right. Please try again.");
            }
          } catch {
            setError("Something went wrong. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-background p-8"
      >
        <p className="eyebrow">PRIVATE</p>
        <h1 className="mt-2 text-2xl font-semibold">Website editor</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to continue.</p>
        <label htmlFor="admin-email" className="mt-6 block text-sm font-medium">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
          required
        />
        <label htmlFor="admin-password" className="mt-4 block text-sm font-medium">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
          required
        />
        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Log in
        </button>
        <a href="/" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground">
          Back to website
        </a>
      </form>
    </main>
  );
}
