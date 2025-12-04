// Interactions for the Cortico homepage
class HomePage {
  visit() {
    cy.visit('/')
    // Dismiss cookie/consent banners if present
    this.dismissOverlays()
  }

  getAllDemoCTAs() {
    // Match only "Get a Demo" buttons
    const textRe = /(^|\s)get\s*a\s*demo(\s|$)/i
    return cy.get('button, [role="button"]').filter((i, el) => {
      const text = (el.innerText || el.textContent || '').trim()
      const aria = (el.getAttribute('aria-label') || '').trim()
      return textRe.test(text) || textRe.test(aria)
    })
  }

  assertCTAsVisible() {
    this.getAllDemoCTAs().then(($els) => {
      if ($els.length === 0) {
        return cy.contains('button', 'Get a Demo').should('exist')
      }
      expect($els.length).to.be.greaterThan(0)
      cy.wrap($els)
    }).each(($el) => {
      cy.wrap($el).should('be.visible')
    })
  }

  clickAnyDemoCTA() {
    // Click the first CTA found
    return this.getAllDemoCTAs().first().click()
  }

  dismissOverlays() {
    // Try common selectors for cookie/consent modals
    cy.get('body').then(($body) => {
      const selectors = [
        'button[aria-label*="Accept"]',
        'button[aria-label*="agree"]',
        'button:contains("Accept")',
        'button:contains("I Agree")',
        '[id*="cookie"] button',
        '.cookie button',
      ]
      for (const sel of selectors) {
        if ($body.find(sel).length) {
          cy.get(sel).first().click({ force: true })
          break
        }
      }
    })
  }
}

module.exports = new HomePage()
