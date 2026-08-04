import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://eml-lab.github.io",

  integrations: [react()],
});