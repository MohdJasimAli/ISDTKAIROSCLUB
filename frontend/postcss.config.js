import { fileURLToPath } from 'node:url';

// Pin the config with an absolute path so Tailwind works regardless of
// the process working directory (npm workspace scripts may run vite from repo root).
const tailwindConfig = fileURLToPath(new URL('./tailwind.config.js', import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: tailwindConfig },
    autoprefixer: {},
  },
};
