describe('OrangeHRM Leave Module - View Leave Entitlements (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const viewEntitlementsUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveEntitlements';

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

  it('TC-01: UI Elements - Leave Entitlements search filters and button render properly', () => {
    cy.visit(viewEntitlementsUrl);
    cy.url().should('include', '/leave/viewLeaveEntitlements');

    cy.contains('h5', 'Leave Entitlements').should('be.visible');
    cy.get('input[placeholder="Type for hints..."]').should('be.visible');
    cy.get('.oxd-select-text').eq(0).should('contain', '-- Select --');
    cy.get('.oxd-select-text').eq(1).should('contain', '2026-01-01 - 2026-31-12');
    cy.contains('button', 'Search').should('be.visible');
  });

  it('TC-02: Validation - Submitting Search without Employee Name triggers "Required" error', () => {
    cy.visit(viewEntitlementUrl);
    cy.contains('button', 'Search').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-03: Validation - Typing invalid employee name without selecting autocomplete triggers "Invalid"', () => {
    cy.visit(viewEntitlementsUrl);

    cy.get('input[placeholder="Type for hints..."]').type('NonExistentEmployee999');
    cy.contains('button', 'Search').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Invalid');
  });

  // ====================================================
  // SECTION 2: POSITIVE SEARCH & FILTERING (3 Tests)
  // ====================================================

  it('TC-04: Positive - Search leave entitlements for a valid employee', () => {
    cy.visit(viewEntitlementsUrl);

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();
    cy.contains('button', 'Search').click();

    // Results container loads with either records or "No Records Found"
    cy.get('.orangehrm-paper-container').should('have.length.at.least', 2);
  });

  it('TC-05: Filter Search - Filter employee entitlements by Leave Type', () => {
    cy.visit(viewEntitlementsUrl);

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();

    cy.get('.oxd-select-text').eq(0).click();
    cy.get('[role="option"]').eq(1).click(); // Select first available leave type
    cy.contains('button', 'Search').click();

    cy.get('.orangehrm-paper-container').should('have.length.at.least', 2);
  });

  it('TC-06: Filter Search - Select Leave Period option and execute search', () => {
    cy.visit(viewEntitlementsUrl);

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();

    cy.get('.oxd-select-text').eq(1).click();
    cy.get('[role="option"]').first().click();
    cy.contains('button', 'Search').click();

    cy.get('.orangehrm-paper-container').should('have.length.at.least', 2);
  });

  // ====================================================
  // SECTION 3: COLLAPSE TOGGLE & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: UI Toggle - Filter panel collapses and expands via chevron button', () => {
    cy.visit(viewEntitlementsUrl);

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('be.visible');
  });

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(viewEntitlementsUrl);
    cy.url().should('include', '/auth/login');
  });
});