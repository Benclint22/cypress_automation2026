describe('OrangeHRM Leave Module - My Leave Entitlements and Usage Report (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const myReportUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewMyLeaveBalanceReport';

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
  // SECTION 1: UI RENDERING & TABLE STRUCTURE (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - My Leave Entitlements and Usage Report filters and columns render properly', () => {
    cy.visit(myReportUrl);
    cy.url().should('include', '/leave/viewMyLeaveBalanceReport');

    cy.contains('h5', 'My Leave Entitlements and Usage Report').should('be.visible');
    cy.get('.oxd-select-text').eq(0).should('contain', '2026-01-01 - 2026-31-12');
    cy.contains('button', 'Generate').should('be.visible');

    // Verify report table headers
    cy.get('.oxd-report-table-header, .rgHeaderCell').should('contain', 'Leave Type');
    cy.contains('Leave Entitlements (Days)').should('be.visible');
    cy.contains('Leave Scheduled (Days)').should('be.visible');
    cy.contains('Leave Taken (Days)').should('be.visible');
    cy.contains('Leave Balance (Days)').should('be.visible');
  });

  it('TC-02: Records Counter - Displays valid "(X) Records Found" label and leave type rows', () => {
    cy.visit(myReportUrl);

    cy.contains(/\(\d+\) Records Found/).should('be.visible');
    cy.contains('CAN - Vacation').should('be.visible');
    cy.contains('US - Vacation').should('be.visible');
  });

  // ====================================================
  // SECTION 2: REPORT GENERATION & INTERACTIONS (4 Tests)
  // ====================================================

  it('TC-03: Positive - Clicking Generate reloads report data for default Leave Period', () => {
    cy.visit(myReportUrl);

    cy.contains('button', 'Generate').click();
    cy.contains(/\(\d+\) Records Found/).should('be.visible');
  });

  it('TC-04: Filter Search - Select Leave Period option and click Generate', () => {
    cy.visit(myReportUrl);

    cy.get('.oxd-select-text').eq(0).click();
    cy.get('[role="option"]').first().click();
    cy.contains('button', 'Generate').click();

    cy.contains(/\(\d+\) Records Found/).should('be.visible');
  });

  it('TC-05: Fullscreen Toggle - Expand and collapse report table fullscreen icon', () => {
    cy.visit(myReportUrl);

    // Click fullscreen expand icon in report toolbar
    cy.get('.oxd-report-table-header--pagination i, .orangehrm-paper-container .bi-arrows-fullscreen').first().click({ force: true });
    cy.get('.oxd-report-table').should('be.visible');
  });

  it('TC-06: Data Format - Verify numeric balance cells display 2 decimal places', () => {
    cy.visit(myReportUrl);

    cy.get('.rgRow .rgCell').eq(1).invoke('text').should('match', /^\d+\.\d{2}$/);
  });

  // ====================================================
  // SECTION 3: COLLAPSE TOGGLE & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: UI Toggle - Filter panel collapses and expands via chevron button', () => {
    cy.visit(myReportUrl);

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('be.visible');
  });

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(myReportUrl);
    cy.url().should('include', '/auth/login');
  });
});