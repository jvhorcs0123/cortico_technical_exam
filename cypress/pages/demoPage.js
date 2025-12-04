// Interactions for the Request a Demo form
class DemoPage {
  findExisting(selectors) {
    // Return the first selector that exists in the DOM
    return cy.get('body').then(($body) => {
      for (const sel of selectors) {
        if ($body.find(sel).length) {
          return cy.get(sel)
        }
      }
      throw new Error(`No selector found: ${selectors.join(', ')}`)
    })
  }

  getField(field) {
    // Candidate selectors for common fields
    const map = {
      clinicName: [
        '#clinicName',
      ],
      numberOfProviders: [
        '#numberOfProviders',
      ],
      fullName: [
        '#fullName',
      ],
      email: [
        '#email',
      ],
      clinicSoftware: [
        '#clinicSoftware',
      ],
      phone: [
        '#mobilePhone',
      ],
      role: [
        'select[name*="role"]',
        'input[name*="role"]',
      ],
      heardAboutUs: [
        '#heardAboutUs',
      ],
      message: [
        'textarea[name*="message"]',
        'textarea[placeholder*="Message"]',
        'textarea[id*="message"]',
      ],
    }
    const selectors = map[field] || []
    return this.findExisting(selectors)
  }

  getSubmitButton() {
    // Try common submit element types, then fall back to matching text
    return cy.get('body').then(($body) => {
      const candidates = ['button[type="submit"]', 'input[type="submit"]']
      for (const sel of candidates) {
        if ($body.find(sel).length) {
          return cy.get(sel).first()
        }
      }
      const buttons = $body.find('button')
      const match = Array.from(buttons).find((b) => /book a demo/i.test((b.innerText || '').toLowerCase()))
      if (match) {
        return cy.wrap(match)
      }
      throw new Error('Submit button not found')
    })
  }

  assertFormLoaded() {
    // Basic presence checks for form
    this.getField('email').should('exist')
    this.getSubmitButton().should('exist')
  }

  fillForm(data) {
    const pairs = [
      { key: 'clinicName', value: data.clinicName },
      { key: 'numberOfProviders', value: data.numberOfProviders },
      { key: 'fullName', value: data.fullName },
      { key: 'email', value: data.email },
      { key: 'phone', value: data.phone },
      { key: 'clinicSoftware', value: data.clinicSoftware ?? data.emr },
      { key: 'heardAboutUs', value: data.heardAboutUs ?? data.howHeard },
    ]

    pairs.forEach(({ key, value }) => {
      if (value === undefined) return
      this.getField(key).then(($el) => {
        const tag = $el[0].tagName.toLowerCase()
        if (tag === 'select') {
          cy.wrap($el).select(String(value))
        } else {
          const type = ($el.attr('type') || '').toLowerCase()
          const finalVal = key === 'phone' || type === 'tel' ? String(value).replace(/\D/g, '') : value
          cy.wrap($el).clear({ force: true }).type(finalVal, { force: true })
        }
      })
    })
  }

  submit() {
    // Click the submit control
    this.getSubmitButton().click()
  }

  prepareSubmissionIntercept(alias = 'submitCTA') {
    cy.intercept('POST', '**/api/cta*', {
      statusCode: 200,
      body: { ok: true },
    }).as(alias)
    cy.intercept('GET', '**/api/cta*', {
      statusCode: 200,
      body: { ok: true },
    }).as(`${alias}-get`)
    return alias
  }

  waitForSubmission(alias = '@submitCTA') {
    return cy.wait(alias, { timeout: 20000 }).then((interception) => {
      const status = interception.response && interception.response.statusCode
      expect(status).to.be.within(200, 299)
    })
  }

  assertFormValid() {
    // HTML5 validity check on the form
    cy.get('form').first().then(($form) => {
      expect($form[0].checkValidity()).to.eq(true)
    })
  }

  assertSuccess() {
    cy.location('pathname', { timeout: 20000 }).should((p) => {
      expect(/\/thank-you(\/.*)?$/.test(p)).to.eq(true)
    })
    cy.contains(/thanks\s*for\s*requesting\s*(a\s*cortico\s*)?demo/i, { timeout: 20000 }).should('be.visible')
  }

  assertValidationErrors() {
    // Check for any signs of invalid input or error messages
    cy.get('form').first().then(($form) => {
      const formEl = $form[0]
      const invalidEls = $form.find('input:invalid, textarea:invalid, select:invalid')
      const ariaInvalidEls = $form.find('[aria-invalid="true"]')
      const hasErrorClasses = $form.find('.error, .hs-error-msg, [role="alert"], .error-message').length > 0
      const notValid = formEl.checkValidity() === false

      if (invalidEls.length || ariaInvalidEls.length || hasErrorClasses || notValid) {
        expect(true).to.eq(true)
      } else {
        cy.contains(/required|enter a valid|invalid|please/i).should('exist')
      }
    })
  }

  

  getEmailInput() {
    return this.getField('email')
  }

  getPhoneInput() {
    return this.getField('phone')
  }

  
}
module.exports = new DemoPage()
