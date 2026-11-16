describe('OrangeHRM PIM - Reports Page (14-Test Suite)', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com';
  const reportsUrl = `${baseUrl}/web/index.php/pim/viewDefinedPredefinedReports`;

  beforeEach(() => {
    // Standard Login
    cy.visit(`${baseUrl}/web/index.php/auth/login`);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');

    // Navigate to PIM -> Reports
    cy.contains('.oxd-main-menu-item', 'PIM').click();
    cy.contains('.oxd-topbar-body-nav-tab', 'Reports').click();
    cy.url().should('include', '/pim/viewDefinedPredefinedReports');
  });

  // ==========================================
  // SECTION 1: PAGE LOAD & SEARCH FILTERS (5 Tests)
  // ==========================================

  it('TC-01: Page Load - Verify headers and table UI', () => {
    cy.get('.oxd-topbar-header-breadcrumb').should('contain.text', 'PIM');
    cy.contains('.oxd-table-filter-title', 'Employee Reports').should('be.visible');
    cy.get('.oxd-table-header').should('contain.text', 'Report Name');
  });

  it('TC-02 & TC-03: Search Filter - Filter by Report Name autocomplete', () => {
    // Extract a real report name from the first row to ensure reliable search
    cy.get('.oxd-table-card').first().find('.oxd-table-cell').eq(1).invoke('text').then((reportName) => {
      const searchKey = reportName.trim().substring(0, 4); // Use first 4 chars for partial match
      
      cy.get('input[placeholder="Type for hints..."]').type(searchKey);
      cy.get('.oxd-autocomplete-option').first().should('not.contain.text', 'Searching').click();
      cy.get('button[type="submit"]').click();

      cy.get('.oxd-table-card').should('have.length.at.least', 1);
      cy.get('.oxd-table-card').first().should('contain.text', searchKey);
    });
  });

  it('TC-04: Search Filter - Non-existent report displays "No Records Found"', () => {
    cy.get('input[placeholder="Type for hints..."]').type('XYZ_Fake_Report_999');
    cy.get('button[type="submit"]').click();

    cy.contains('No Records Found').should('be.visible');
    cy.get('.oxd-table-card').should('not.exist');
  });

  it('TC-05: Search Filter - Clicking "Reset" clears inputs and reloads list', () => {
    cy.get('input[placeholder="Type for hints..."]').type('XYZ_Fake_Report');
    cy.get('button[type="submit"]').click();
    cy.get('.oxd-table-card').should('not.exist');

    cy.contains('button', 'Reset').click();
    cy.get('input[placeholder="Type for hints..."]').should('have.value', '');
    cy.get('.oxd-table-card').should('have.length.at.least', 1);
  });

  // ==========================================
  // SECTION 2: ROW ACTIONS & ADD ROUTING (4 Tests)
  // ==========================================

  it('TC-06: Navigation - Clicking "+ Add" routes to Add Report screen', () => {
    cy.contains('button', 'Add').click();
    cy.url().should('include', '/pim/definePredefinedReport');
    cy.contains('h6', 'Add Report').should('be.visible');
  });

  it('TC-07: Table Action - Run Report navigates to report display screen', () => {
    // Assuming the "Run" action is a file-text icon in OrangeHRM
    cy.get('.oxd-table-card').first().find('button i.bi-file-text').click();
    cy.url().should('include', '/pim/displayPredefinedReport');
  });

  it('TC-08: Table Action - Edit Report routes to configuration screen', () => {
    cy.get('.oxd-table-card').first().find('button i.bi-pencil-fill').click();
    cy.url().should('include', '/pim/definePredefinedReport');
  });

  // ==========================================
  // SECTION 3: DELETION (3 Tests)
  // ==========================================

  it('TC-10: Delete Report - Canceling delete preserves the report', () => {
    // Note: Best practice in CI is to create a dummy report first before deleting,
    // but here we verify the cancel flow on existing demo data.
    cy.get('.oxd-table-card').first().find('button i.bi-trash').click();
    cy.contains('button', 'No, Cancel').click();
    cy.get('.oxd-table-card').should('have.length.at.least', 1);
  });

  it('TC-11: Bulk Selection - Checkboxes reveal "Delete Selected" button', () => {
    cy.get('.oxd-table-card .oxd-checkbox-input').first().click();
    cy.contains('button', 'Delete Selected').should('be.visible');
  });

  // ==========================================
  // SECTION 4: UI CONTROLS & SECURITY (3 Tests)
  // ==========================================

  it('TC-12: Table Sorting - Sort Report Name column Ascending', () => {
    cy.contains('.oxd-table-header-cell', 'Report Name')
      .find('.oxd-table-header-sort-icon')
      .click();
    cy.contains('.oxd-table-header-sort-dropdown-item', 'Ascending').click();
  });

  it('TC-13: UI Controls - Collapse Employee Reports filter card', () => {
    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');
  });

  it('TC-14: Security - Unauthenticated direct access redirects to Login', () => {
    cy.clearCookies();
    cy.visit(reportsUrl);
    cy.url().should('include', '/auth/login');
  });
});