describe('OrangeHRM Time Module - Attendance Punch In/Out (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const punchInUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/attendance/punchIn';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  // ====================================================
  // SECTION 1: UI RENDERING & VALIDATIONS (3 Tests)
  // ====================================================

  it('TC-01: UI Elements - Punch In/Out form fields, note box, and submit button render properly', () => {
    cy.visit(punchInUrl);
    cy.url().should('match', /\/attendance\/punch(In|Out)/);

    cy.get('h6').should('contain.text', 'Punch');
    cy.get('.oxd-date-input input').should('be.visible').and('not.have.value', '');
    cy.get('.oxd-time-input input').should('be.visible').and('not.have.value', '');
    cy.get('textarea').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('TC-02: Validation - Clearing Date and Time triggers "Required" errors on submit', () => {
    cy.visit(punchInUrl);

    cy.get('.oxd-date-input input').clear();
    cy.get('.oxd-time-input input').clear();
    cy.get('h6').first().click();

    cy.get('button[type="submit"]').click();
    cy.get('.oxd-input-field-error-message').should('have.length.at.least', 2);
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-03: Validation - Invalid Date and Time formats trigger format error messages', () => {
    cy.visit(punchInUrl);

    cy.get('.oxd-date-input input').clear().type('2026-99-99');
    cy.get('.oxd-time-input input').clear().type('99:99 XM');
    cy.get('h6').first().click();

    cy.get('button[type="submit"]').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Should be a valid date');
    cy.get('.oxd-input-field-error-message').should('contain', 'Should be a valid time');
  });

  // ====================================================
  // SECTION 2: PUNCH IN / PUNCH OUT WORKFLOW (4 Tests)
  // ====================================================

  it('TC-04: Positive (Punch In) - Record Punch In with note and transition to Punch Out', () => {
    cy.visit(punchInUrl);

    cy.get('body').then(($body) => {
      // If already in Punch Out state from a prior run, punch out first so Punch In can be tested cleanly
      if ($body.text().includes('Punched in Time')) {
        cy.get('textarea').clear().type('Closing previous open shift');
        cy.get('button[type="submit"]').click();
        cy.get('.oxd-toast').should('contain', 'Successfully Saved');
      }
    });

    // Now perform Punch In using yyyy-dd-mm format
    cy.get('.oxd-date-input input').clear().type('2026-21-11');
    cy.get('.oxd-time-input input').clear().type('09:00 AM');
    cy.get('h6').first().click();

    cy.get('textarea').clear().type('Automated Cypress Punch In');
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
    cy.contains('Punched in Time').should('be.visible');
  });

  it('TC-05: Validation - Punch Out time earlier than Punch In time shows validation error', () => {
    cy.visit(punchInUrl);

    cy.get('body').then(($body) => {
      if ($body.text().includes('Punched in Time')) {
        cy.get('.oxd-date-input input').clear().type('2026-21-11');
        cy.get('.oxd-time-input input').clear().type('08:00 AM'); // Earlier than 09:00 AM
        cy.get('h6').first().click();

        cy.get('button[type="submit"]').click();
        cy.get('.oxd-input-field-error-message').should(
          'contain',
          'Punch out Time Should Be Later Than Punch in Time'
        );
      }
    });
  });

  it('TC-06: Positive (Punch Out) - Record valid Punch Out and return to Punch In screen', () => {
    cy.visit(punchInUrl);

    cy.get('body').then(($body) => {
      if ($body.text().includes('Punched in Time')) {
        cy.get('.oxd-date-input input').clear().type('2026-21-11');
        cy.get('.oxd-time-input input').clear().type('05:00 PM');
        cy.get('h6').first().click();

        cy.get('textarea').clear().type('Automated Cypress Punch Out');
        cy.get('button[type="submit"]').click();

        cy.get('.oxd-toast').should('contain', 'Successfully Saved');
      }
    });
  });

  it('TC-07: Validation - Overlapping attendance time triggers "Overlapping Records Found" error', () => {
    cy.visit(punchInUrl);

    // Attempt to Punch In inside the 09:00 AM - 05:00 PM window just saved
    cy.get('.oxd-date-input input').clear().type('2026-21-11');
    cy.get('.oxd-time-input input').clear().type('11:00 AM');
    cy.get('h6').first().click();

    cy.get('button[type="submit"]').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Overlapping Records Found');
  });

  // ====================================================
  // SECTION 3: SECURITY (1 Test)
  // ====================================================

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(punchInUrl);
    cy.url().should('include', '/auth/login');
  });
});