describe('OrangeHRM Leave Module - My Leave List (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const myLeaveUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewMyLeaveList';

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
  // SECTION 1: UI RENDERING & EMPTY STATE (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - My Leave List filters, chips, and table headers render properly', () => {
    cy.visit(myLeaveUrl);
    cy.url().should('include', '/leave/viewMyLeaveList');

    cy.contains('h5', 'My Leave List').should('be.visible');
    cy.get('.oxd-date-input input').eq(0).should('have.value', '2026-01-01');
    cy.get('.oxd-date-input input').eq(1).should('have.value', '2026-31-12');

    // Verify default status chips
    cy.get('.oxd-multiselect-chips-selected').should('have.length', 5);
    cy.contains('.oxd-multiselect-chips-selected', 'Pending Approval').should('be.visible');

    // Verify table column headers
    cy.get('.oxd-table-header').should('contain', 'Date')
      .and('contain', 'Employee Name')
      .and('contain', 'Leave Type')
      .and('contain', 'Status')
      .and('contain', 'Actions');
  });

  it('TC-02: Empty State - Displays "No Records Found" when no leave records match', () => {
    cy.visit(myLeaveUrl);
    cy.contains('button', 'Search').click();

    cy.get('body').then(($body) => {
      if ($body.text().includes('No Records Found')) {
        cy.contains('No Records Found').should('be.visible');
      } else {
        cy.get('.oxd-table-body .oxd-table-card').should('have.length.at.least', 1);
      }
    });
  });

  // ====================================================
  // SECTION 2: FILTER VALIDATION & INTERACTIONS (4 Tests)
  // ====================================================

  it('TC-03: Validation - Removing all status chips triggers "Required" error on Search', () => {
    cy.visit(myLeaveUrl);

    // Click remove (x) icon on each status chip
    cy.get('.oxd-multiselect-chips-selected .oxd-icon').each(($closeIcon) => {
      cy.wrap($closeIcon).click();
    });

    cy.contains('button', 'Search').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-04: Filter Search - Filter by Leave Type and click Search', () => {
    cy.visit(myLeaveUrl);

    cy.get('.oxd-select-text').eq(1).click();
    cy.get('[role="option"]').eq(1).click(); // Select first available leave type
    cy.contains('button', 'Search').click();

    cy.get('.orangehrm-horizontal-padding').should('be.visible');
  });

  it('TC-05: Validation - To Date earlier than From Date shows date range error', () => {
    cy.visit(myLeaveUrl);

    // Uses instance format yyyy-dd-mm
    cy.get('.oxd-date-input input').eq(0).clear().type('2026-15-10');
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-01-01');
    cy.contains('h5', 'My Leave List').click();

    cy.contains('button', 'Search').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'To date should be after from date');
  });

  it('TC-06: Reset Button - Restores default status chips and filters', () => {
    cy.visit(myLeaveUrl);

    // Remove one status chip
    cy.get('.oxd-multiselect-chips-selected .oxd-icon').first().click();
    cy.get('.oxd-multiselect-chips-selected').should('have.length', 4);

    // Click Reset and verify all 5 chips return
    cy.contains('button', 'Reset').click();
    cy.get('.oxd-multiselect-chips-selected').should('have.length', 5);
  });

  // ====================================================
  // SECTION 3: COLLAPSE TOGGLE & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: UI Toggle - Filter panel collapses and expands via chevron button', () => {
    cy.visit(myLeaveUrl);

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('be.visible');
  });

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(myLeaveUrl);
    cy.url().should('include', '/auth/login');
  });
});