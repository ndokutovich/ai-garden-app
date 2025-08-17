import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repo = process.env.REPO_NAME || ''

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: repo ? `/${repo}/` : '/',
	server: { host: true, port: 5173 },
	build: { outDir: 'dist' },
})
