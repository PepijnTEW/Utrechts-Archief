import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      "/login": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
      "/info-points": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
    },
  },
})
