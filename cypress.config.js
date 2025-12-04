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
  viewportWidth: 1280,
  viewportHeight: 800,
  chromeWebSecurity: false,
  retries: {
    runMode: 2,
    openMode: 0,
  },
})
