describe('OrangeHRM Leave Module - My Leave Entitlements (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const myEntitlementsUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewMyLeaveEntitlements';

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

  it('TC-01: UI Elements - My Leave Entitlements filters, + Add button, and table headers render properly', () => {
    cy.visit(myEntitlementsUrl);
    cy.url().should('include', '/leave/viewMyLeaveEntitlements');

    cy.contains('h5', 'My Leave Entitlements').should('be.visible');
    cy.get('.oxd-select-text').eq(0).should('contain', '-- Select --');
    cy.get('.oxd-select-text').eq(1).should('contain', '2026-01-01 - 2026-31-12');
    cy.contains('button', 'Search').should('be.visible');
    cy.contains('button', 'Add').should('be.visible');

    // Verify table column headers
    cy.get('.oxd-table-header')
      .should('contain', 'Leave Type')
      .and('contain', 'Entitlement Type')
      .and('contain', 'Valid From')
      .and('contain', 'Valid To')
      .and('contain', 'Days')
      .and('contain', 'Actions');
  });

  it('TC-02: Empty State - Displays "No Records Found" and "Total 0.00 Day(s)" when no entitlements exist', () => {
    cy.visit(myEntitlementsUrl);
    cy.contains('button', 'Search').click();

    cy.get('body').then(($body) => {
      if ($body.text().includes('No Records Found')) {
        cy.contains('No Records Found').should('be.visible');
        cy.contains('Total 0.00 Day(s)').should('be.visible');
      } else {
        cy.get('.oxd-table-body .oxd-table-card').should('have.length.at.least', 1);
      }
    });
  });

  // ====================================================
  // SECTION 2: NAVIGATION & FILTER SEARCH (4 Tests)
  // ====================================================

  it('TC-03: Navigation - Clicking "+ Add" button navigates to Add Leave Entitlement page', () => {
    cy.visit(myEntitlementsUrl);
    cy.contains('button', 'Add').click();

    cy.url().should('include', '/leave/addLeaveEntitlement');
    cy.contains('h6', 'Add Leave Entitlement').should('be.visible');
  });

  it('TC-04: Filter Search - Filter My Leave Entitlements by Leave Type', () => {
    cy.visit(myEntitlementsUrl);

    cy.get('.oxd-select-text').eq(0).click();
    cy.get('[role="option"]').eq(1).click(); // Select first available leave type
    cy.contains('button', 'Search').click();

    cy.get('.orangehrm-horizontal-padding').should('be.visible');
  });

  it('TC-05: Filter Search - Select Leave Period option and execute search', () => {
    cy.visit(myEntitlementsUrl);

    cy.get('.oxd-select-text').eq(1).click();
    cy.get('[role="option"]').first().click();
    cy.contains('button', 'Search').click();

    cy.get('.orangehrm-horizontal-padding').should('be.visible');
  });

  it('TC-06: Summary Counter - Total Day(s) summary label displays in valid format', () => {
    cy.visit(myEntitlementsUrl);
    cy.contains(/Total \d+\.\d{2} Day\(s\)/).should('be.visible');
  });

  // ====================================================
  // SECTION 3: COLLAPSE TOGGLE & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: UI Toggle - Filter panel collapses and expands via chevron button', () => {
    cy.visit(myEntitlementsUrl);

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('be.visible');
  });

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(myEntitlementsUrl);
    cy.url().should('include', '/auth/login');
  });
});