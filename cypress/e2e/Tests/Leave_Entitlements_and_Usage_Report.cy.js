describe('OrangeHRM Leave Module - Leave Entitlements and Usage Report (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const reportUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveBalanceReport';

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
  // SECTION 1: UI RENDERING & RADIO TOGGLE (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - Leave Entitlements and Usage Report filters and button render properly', () => {
    cy.visit(reportUrl);
    cy.url().should('include', '/leave/viewLeaveBalanceReport');

    cy.contains('h5', 'Leave Entitlements and Usage Report').should('be.visible');
    cy.get('input[type="radio"]').eq(0).should('be.checked'); // Leave Type default
    cy.get('.oxd-select-text').eq(1).should('contain', '2026-01-01 - 2026-31-12');
    cy.get('.oxd-switch-input').should('exist');
    cy.contains('button', 'Generate').should('be.visible');
  });

  it('TC-02: Radio Toggle - Switching to Employee mode updates filter fields dynamically', () => {
    cy.visit(reportUrl);

    // Switch to Employee mode
    cy.contains('label', 'Employee').click();
    cy.get('input[placeholder="Type for hints..."]').should('be.visible');
    cy.contains('label', 'Location').should('not.exist');
    cy.contains('label', 'Sub Unit').should('not.exist');

    // Switch back to Leave Type mode
    cy.contains('label', 'Leave Type').click();
    cy.contains('label', 'Location').should('be.visible');
    cy.contains('label', 'Sub Unit').should('be.visible');
  });

  // ====================================================
  // SECTION 2: REPORT GENERATION & VALIDATIONS (4 Tests)
  // ====================================================

  it('TC-03: Positive - Generate Leave Entitlements and Usage Report by Leave Type', () => {
    cy.visit(reportUrl);

    cy.contains('button', 'Generate').click();
    cy.get('.oxd-report-table, .orangehrm-paper-container').should('have.length.at.least', 2);
  });

  it('TC-04: Validation - Empty and invalid Employee Name in Employee mode shows errors', () => {
    cy.visit(reportUrl);
    cy.contains('label', 'Employee').click();

    // Empty submission
    cy.contains('button', 'Generate').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');

    // Invalid autocomplete text
    cy.get('input[placeholder="Type for hints..."]').type('NonExistentEmployee999');
    cy.contains('button', 'Generate').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Invalid');
  });

  it('TC-05: Positive - Generate Leave Balance Report for a specific employee', () => {
    cy.visit(reportUrl);
    cy.contains('label', 'Employee').click();

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();
    cy.contains('button', 'Generate').click();

    cy.get('.oxd-report-table, .orangehrm-paper-container').should('have.length.at.least', 2);
  });

  it('TC-06: Toggle Switch - Include Past Employees switch toggles on and generates report', () => {
    cy.visit(reportUrl);

    cy.get('.oxd-switch-wrapper').click();
    cy.get('.oxd-switch-input').should('be.checked');
    cy.contains('button', 'Generate').click();
  });

  // ====================================================
  // SECTION 3: COLLAPSE TOGGLE & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: UI Toggle - Filter panel collapses and expands via chevron button', () => {
    cy.visit(reportUrl);

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('be.visible');
  });

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(reportUrl);
    cy.url().should('include', '/auth/login');
  });
});