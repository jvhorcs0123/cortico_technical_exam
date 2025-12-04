# Cortico Technical Exam – Cypress E2E Tests

## Project Overview
- End-to-end Cypress tests for Cortico’s “Request a Demo” flow at `https://cortico.health`.
- Focuses on CTA visibility and navigation, form fill and submission, success page verification, and validation behaviors.

## Prerequisites
- Node.js 18+ installed
- Git installed

## Install
- `npm install`

## Run Tests
- Open runner: `npm run cy:open`
- Headless run: `npm run cy:run`

## Key Specs
- `cypress/e2e/demoFlow.cy.js`
  - Verifies “Get a Demo” CTAs are visible and functional
  - Positive submission using fixture data and network intercept of `POST /api/cta`
  - Negative cases: empty required fields, invalid email formats, and phone input masking

## Configuration
- Base URL: `cypress.config.js` sets `baseUrl` to `https://cortico.health`
- Video disabled; viewport `1920x1080`; Chrome web security disabled for cross-origin tolerance

## Fixtures
- `cypress/fixtures/testData.json`
  - `valid`: fullName, clinicName, numberOfProviders, email, phone, clinicSoftware, heardAboutUs
  - `invalid`: email, longString, specialChars

## How Submission Is Verified
- Network intercept: `POST **/api/cta*` is stubbed to return 200
- Success page: asserts path matches `/thank-you` (allowing trailing segments) and thank-you message

## Limitations & Improvements
- To keep tests reliable, we pretend to send the form to the server instead of actually doing it. If needed, we can switch to use the real server.
- Error message bubbles from native HTML5 validation are not in the DOM; tests read `validationMessage` instead of `cy.contains`
- Selectors rely on stable ids provided (`#clinicName`, `#numberOfProviders`, `#fullName`, `#clinicSoftware`, `#email`, `#mobilePhone`, `#heardAboutUs`); if these change, update `cypress/pages/demoPage.js:getField`

## Repository
- GitHub: `https://github.com/jvhorcs0123/cortico_technical_exam`
