import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Unocss from "unocss/vite";
import presetWind from "@unocss/preset-wind";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/ionian-basic-demo/",
  plugins: [
    react(),
    Unocss({
      safelist: [],
      variants: [],
      shortcuts: [],
      rules: [],
      pressets: [presetWind()],
    }),
  ],
});
