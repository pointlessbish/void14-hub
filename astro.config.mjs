// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Setting this to 'static' ensures lightning fast loads 
  // and avoids the environment variable issues we faced.
  output: 'static',
  
  // We keep the adapter so Cloudflare Pages knows how to 
  // deploy the static files correctly.
  adapter: cloudflare()
});