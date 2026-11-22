describe('OrangeHRM Leave Module - Leave List (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const leaveListUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList';

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
  // SECTION 1: UI RENDERING & VALIDATIONS (4 Tests)
  // ====================================================

  it('TC-01: UI Elements - Leave List filters, default status chip, and table headers render properly', () => {
    cy.visit(leaveListUrl);
    cy.url().should('include', '/leave/viewLeaveList');

    cy.contains('h5', 'Leave List').should('be.visible');
    cy.get('.oxd-date-input input').eq(0).should('have.value', '2026-01-01');
    cy.get('.oxd-date-input input').eq(1).should('have.value', '2026-31-12');
    cy.contains('.oxd-multiselect-chips-selected', 'Pending Approval').should('be.visible');
    cy.contains('button', 'Reset').should('be.visible');
    cy.contains('button', 'Search').should('be.visible');

    // Verify table column headers
    cy.get('.oxd-table-header')
      .should('contain', 'Date')
      .and('contain', 'Employee Name')
      .and('contain', 'Leave Type')
      .and('contain', 'Leave Balance (Days)')
      .and('contain', 'Number of Days')
      .and('contain', 'Status')
      .and('contain', 'Actions');
  });

  it('TC-02: Validation - Removing default status chip triggers "Required" error on Search', () => {
    cy.visit(leaveListUrl);

    cy.get('.oxd-multiselect-chips-selected .oxd-icon').click();
    cy.contains('button', 'Search').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-03: Validation - To Date earlier than From Date shows date range error', () => {
    cy.visit(leaveListUrl);

    // Instance uses yyyy-dd-mm date format
    cy.get('.oxd-date-input input').eq(0).clear().type('2026-15-10');
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-01-01');
    cy.contains('h5', 'Leave List').click();

    cy.contains('button', 'Search').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'To date should be after from date');
  });

  it('TC-04: Validation - Typing invalid Employee Name without autocomplete selection triggers "Invalid"', () => {
    cy.visit(leaveListUrl);

    cy.get('input[placeholder="Type for hints..."]').type('NonExistentEmployee999');
    cy.contains('button', 'Search').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Invalid');
  });

  // ====================================================
  // SECTION 2: FILTERING, ACTIONS & RESET (3 Tests)
  // ====================================================

  it('TC-05: Filter Search - Search leave list with multiple statuses and Leave Type filter', () => {
    cy.visit(leaveListUrl);

    // Add 'Scheduled' to status multiselect
    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'Scheduled').click();

    // Select first available Leave Type
    cy.get('.oxd-select-text').eq(1).click();
    cy.get('[role="option"]').eq(1).click();

    cy.contains('button', 'Search').click();
    cy.get('.orangehrm-horizontal-padding').should('be.visible');
  });

  it('TC-06: Leave Actions - Approve pending leave request if records exist or verify empty state', () => {
    cy.visit(leaveListUrl);
    cy.contains('button', 'Search').click();

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Approve")').length > 0) {
        cy.contains('button', 'Approve').first().click();
        cy.get('.oxd-toast').should('contain', 'Successfully Updated');
      } else {
        cy.contains('No Records Found').should('be.visible');
      }
    });
  });

  it('TC-07: Reset Button - Restores default status chip and resets Include Past Employees switch', () => {
    cy.visit(leaveListUrl);

    // Toggle switch on and remove default status chip
    cy.get('.oxd-switch-wrapper').click();
    cy.get('.oxd-switch-input').should('be.checked');
    cy.get('.oxd-multiselect-chips-selected .oxd-icon').click();

    // Click Reset and verify defaults return
    cy.contains('button', 'Reset').click();
    cy.get('.oxd-switch-input').should('not.be.checked');
    cy.contains('.oxd-multiselect-chips-selected', 'Pending Approval').should('be.visible');
  });

  // ====================================================
  // SECTION 3: SECURITY (1 Test)
  // ====================================================

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(leaveListUrl);
    cy.url().should('include', '/auth/login');
  });
});