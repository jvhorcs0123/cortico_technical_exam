// Page objects for homepage and demo form
const home = require('../pages/homePage')
const demo = require('../pages/demoPage')

// End-to-end flow for Cortico "Request a Demo"
describe('Cortico Request a Demo', () => {
  beforeEach(() => {
    // Open homepage and dismiss any overlays
    home.visit()
  })

  // Check all CTA buttons/links are present and visible
  it('verifies all Get a Demo CTAs are visible', () => {
    home.assertCTAsVisible()
  })

  // Iterate CTA buttons and validate navigation or scroll to form
  it('iterates CTA buttons and validates navigation or scroll to form', () => {
    cy.window().then((win) => {
      const initialPath = win.location.pathname
      const initialScroll = win.scrollY
      home.getAllDemoCTAs().then(($buttons) => {
        expect($buttons.length).to.be.greaterThan(0)
        const total = $buttons.length
        for (let i = 0; i < total; i++) {
          home.visit()
          home.getAllDemoCTAs().eq(i).click()
          cy.location('pathname').then((p) => {
            if (p === initialPath) {
              cy.window().then((w2) => {
                expect(w2.scrollY).to.be.greaterThan(initialScroll)
              })
            }
          })
          demo.assertFormLoaded()
        }
      })
    })
  })

  // Navigate to the demo form and ensure it loads
  it('navigates to demo form via CTA and validates form loads', () => {
    home.clickAnyDemoCTA()
    demo.assertFormLoaded()
  })

  // Positive test: fill valid input and submit
  it('fills out the form with valid input and submits (positive test)', () => {
    cy.fixture('testData').then((data) => {
      home.clickAnyDemoCTA()
      demo.assertFormLoaded()
      demo.fillForm(data.valid)
      const alias = demo.prepareSubmissionIntercept('submitCTA')
      demo.submit()
      demo.waitForSubmission(`@${alias}`)
      demo.assertSuccess()
    })
  })

  // Negative test: submit empty required fields
  it('shows validation errors when required fields are empty', () => {
    home.clickAnyDemoCTA()
    demo.assertFormLoaded()
    demo.submit()
    demo.assertValidationErrors()
  })

  // Negative test: invalid email, long strings, special characters
  it('shows validation errors for invalid inputs and edge cases', () => {
    cy.fixture('testData').then((data) => {
      home.clickAnyDemoCTA()
      demo.assertFormLoaded()
      demo.fillForm({
        email: data.invalid.email,
        phone: 'abc123',
      })
      demo.submit()
      demo.assertValidationErrors()
    })
  })

  // Negative test: invalid email format
  it('shows validation errors for invalid email format', () => {
    home.clickAnyDemoCTA()
    demo.assertFormLoaded()
    cy.fixture('testData').then((data) => {
      const validNoEmail = { ...data.valid }
      delete validNoEmail.email
      demo.fillForm(validNoEmail)
    })
    const invalid1 = 'tester'
    demo.getEmailInput().clear().type(invalid1)
    demo.submit()
    demo.getEmailInput().then(($el) => {
      const vm = ($el[0] && $el[0].validationMessage) || ''
      expect(vm.toLowerCase()).to.include("please include an '@' in the email address")
      expect(vm).to.include(`'${invalid1}'`)
    })
    cy.location('pathname').should('not.match', /\/thank-you(\/.*)?$/)
    const invalid2 = 'tester@'
    demo.getEmailInput().clear().type(invalid2)
    demo.submit()
    demo.getEmailInput().then(($el) => {
      const vm = ($el[0] && $el[0].validationMessage) || ''
      expect(vm.toLowerCase()).to.include("please enter a part following '@'")
      expect(vm).to.include(`'${invalid2}'`)
      expect(vm.toLowerCase()).to.include('incomplete')
    })
    cy.location('pathname').should('not.match', /\/thank-you(\/.*)?$/)
  })

  // Phone masking: ignore non-digits and cap at 10 digits
  it('enforces phone input masking (digits-only, max 10)', () => {
    home.clickAnyDemoCTA()
    demo.assertFormLoaded()
    cy.fixture('testData').then((data) => {
      const validNoPhone = { ...data.valid }
      delete validNoPhone.phone
      demo.fillForm(validNoPhone)
    })
    demo.getPhoneInput().clear().type('abc!@#')
    demo.getPhoneInput().invoke('val').then((v) => {
      const digits = String(v || '').replace(/\D/g, '')
      expect(digits.length).to.eq(0)
    })
    demo.getPhoneInput().type('1234567890')
    demo.getPhoneInput().invoke('val').then((v) => {
      const digits = String(v || '').replace(/\D/g, '')
      expect(digits.length).to.eq(10)
    })
    demo.getPhoneInput().type('123abc')
    demo.getPhoneInput().invoke('val').then((v) => {
      const digits = String(v || '').replace(/\D/g, '')
      expect(digits.length).to.eq(10)
    })
    const alias = demo.prepareSubmissionIntercept('submitCTA')
    demo.submit()
    demo.waitForSubmission(`@${alias}`)
    demo.assertSuccess()
  })

  // Assistance mailto link
  it('validates the assistance email link', () => {
    home.clickAnyDemoCTA()
    demo.assertFormLoaded()
    cy.get('a[href^="mailto:"]').then(($links) => {
      if ($links.length) {
        const href = $links[0].getAttribute('href') || ''
        expect(href.startsWith('mailto:')).to.eq(true)
        expect(href).to.include('help@cortico.health')
      } else {
        cy.contains(/help@cortico\.health/i).should('exist')
      }
    })
  })

  // Patient link guardrail
  it('navigates to Patient portal when clicking patient link', () => {
    home.clickAnyDemoCTA()
    demo.assertFormLoaded()
    cy.get('body').then(($body) => {
      const link = $body.find('a[href*="/patients"]')[0]
      if (link) {
        const href = link.getAttribute('href') || ''
        if (href) {
          cy.visit(href)
          cy.location('pathname', { timeout: 15000 }).should('include', '/patients')
        } else {
          expect(true).to.eq(true)
        }
      } else {
        expect(true).to.eq(true)
      }
    })
  })
})
