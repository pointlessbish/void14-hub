import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server', // This makes the site dynamic
  adapter: cloudflare() // This tells it to run on Cloudflare's edge
});