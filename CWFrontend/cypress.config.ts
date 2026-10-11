import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://nginx:80',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
  },
});
