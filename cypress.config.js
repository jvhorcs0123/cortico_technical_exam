// Cypress configuration
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // Base site under test
    baseUrl: 'https://cortico.health',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
  },
  defaultCommandTimeout: 10000,
  video: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  chromeWebSecurity: false,
  retries: {
    runMode: 2,
    openMode: 0,
  },
})
