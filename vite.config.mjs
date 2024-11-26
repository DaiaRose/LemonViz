import { defineConfig } from 'vite';

export default defineConfig({
	base: process.env.CI ? '/LemonViz/' : '/',
	build: {
		target: 'esnext',
	},
});
