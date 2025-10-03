import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    // โฟลเดอร์ที่ Vercel ใช้เป็น Output Directory
    outDir: "dist",
  },
});
