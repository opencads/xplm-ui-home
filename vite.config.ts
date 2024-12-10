import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
const env = loadEnv('production', process.cwd());
export default defineConfig({
  plugins: [react()],
  base: `${env.VITE_PUBLIC_URL}/`
})

console.log(`VITE_PUBLIC_URL: ${env.VITE_PUBLIC_URL}`);
