import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const krogerProxy = {
  '/kroger-api': {
    target: 'https://api.kroger.com/v1',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/kroger-api/, ''),
    secure: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server:  { proxy: krogerProxy },
  preview: { proxy: krogerProxy },
})
