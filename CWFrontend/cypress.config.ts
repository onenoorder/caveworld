import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://nginx:80',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    // The first visit boots the whole game: TextureService preloads every
    // dwarf animation frame (~350 PNGs served from nginx). Give the initial
    // page load room; per-assertion retries use the default command timeout.
    pageLoadTimeout: 180000,
  },
});
