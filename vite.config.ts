// Standalone Vite config — no Lovable dependency. Nitro (bundled with
// @tanstack/react-start) auto-detects the deployment target from the
// hosting platform's own build environment, so no preset is set here:
// it picks Vercel automatically when built on Vercel.
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
    // Compiles the server build into Vercel Functions. No preset is set —
    // Nitro detects Vercel automatically from Vercel's own build environment.
    nitro(),
    viteReact(),
  ],
});
