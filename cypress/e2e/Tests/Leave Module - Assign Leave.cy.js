describe('OrangeHRM Leave Module - Assign Leave (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const assignLeaveUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/assignLeave';

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
  // SECTION 1: UI RENDERING & BALANCE LOOKUP (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - Assign Leave fields, balance label, and Assign button render properly', () => {
    cy.visit(assignLeaveUrl);
    cy.url().should('include', '/leave/assignLeave');

    cy.contains('h6', 'Assign Leave').should('be.visible');
    cy.get('input[placeholder="Type for hints..."]').should('be.visible');
    cy.get('.oxd-select-text').eq(0).should('contain', '-- Select --');
    cy.contains('label', 'Leave Balance').should('be.visible');
    cy.contains('0.00 Day(s)').should('be.visible');
    cy.get('.oxd-date-input input').should('have.length', 2);
    cy.get('textarea').should('be.visible');
    cy.contains('button', 'Assign').should('be.visible');
  });

  it('TC-02: Dynamic Balance - Selecting employee and leave type updates Leave Balance display', () => {
    cy.visit(assignLeaveUrl);

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();

    cy.get('.oxd-select-text').eq(0).click();
    cy.get('[role="option"]').eq(1).click();

    cy.get('.orangehrm-leave-balance-text').should('contain', 'Day(s)');
  });

  // ====================================================
  // SECTION 2: FORM VALIDATIONS (3 Tests)
  // ====================================================

  it('TC-03: Validation - Required errors trigger when submitting empty Assign Leave form', () => {
    cy.visit(assignLeaveUrl);
    cy.contains('button', 'Assign').click();

    cy.get('.oxd-input-field-error-message').should('have.length.at.least', 4);
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-04: Validation - Typing invalid Employee Name without autocomplete selection triggers "Invalid"', () => {
    cy.visit(assignLeaveUrl);

    cy.get('input[placeholder="Type for hints..."]').type('NonExistentEmployee999');
    cy.contains('button', 'Assign').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Invalid');
  });

  it('TC-05: Validation - To Date earlier than From Date shows date range error', () => {
    cy.visit(assignLeaveUrl);

    // Instance uses yyyy-dd-mm format
    cy.get('.oxd-date-input input').eq(0).clear().type('2026-15-12');
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-10-12');
    cy.contains('h6', 'Assign Leave').click();

    cy.contains('button', 'Assign').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'To date should be after from date');
  });

  // ====================================================
  // SECTION 3: MULTI-DAY & POSITIVE ASSIGNMENT (2 Tests)
  // ====================================================

  it('TC-06: Dynamic Fields - Multi-day date range reveals Partial Days dropdown', () => {
    cy.visit(assignLeaveUrl);

    cy.get('.oxd-date-input input').eq(0).clear().type('2026-22-12');
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-24-12');
    cy.contains('h6', 'Assign Leave').click();

    cy.contains('label', 'Partial Days').should('be.visible');
  });

  it('TC-07: Positive - Assign leave to employee (confirming insufficient balance modal if shown)', () => {
    cy.visit(assignLeaveUrl);

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();

    cy.get('.oxd-select-text').eq(0).click();
    cy.get('[role="option"]').eq(1).click();

    // Single-day leave in yyyy-dd-mm format
    cy.get('.oxd-date-input input').eq(0).clear().type('2026-28-12');
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-28-12');
    cy.contains('h6', 'Assign Leave').click();

    cy.get('textarea').type('Automated Cypress leave assignment');
    cy.contains('button', 'Assign').click();

    // Confirm insufficient balance popup if triggered
    cy.get('body').then(($body) => {
      if ($body.find('.oxd-dialog-container-default').length > 0) {
        cy.contains('.oxd-dialog-container-default button', 'Ok').click();
      }
    });

    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
  });

  // ====================================================
  // SECTION 4: SECURITY (1 Test)
  // ====================================================

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(assignLeaveUrl);
    cy.url().should('include', '/auth/login');
  });
});