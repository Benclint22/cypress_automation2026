describe('OrangeHRM Time Module - My Attendance Records (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const myAttendanceUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/attendance/viewMyAttendanceRecord';

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

  it('TC-01: UI Elements - My Attendance Records date input, View button, and table headers render properly', () => {
    cy.visit(myAttendanceUrl);
    cy.url().should('include', '/attendance/viewMyAttendanceRecord');

    cy.contains('h5', 'My Attendance Records').should('be.visible');
    cy.get('.oxd-date-input input').should('be.visible').and('not.have.value', '');
    cy.contains('button', 'View').should('be.visible');
    cy.contains(/Total Duration \(Hours\)/).should('be.visible');

    // Verify table column headers
    cy.get('.oxd-table-header')
      .should('contain', 'Punch In')
      .and('contain', 'Punch In Note')
      .and('contain', 'Punch Out')
      .and('contain', 'Punch Out Note')
      .and('contain', 'Duration (Hours)')
      .and('contain', 'Actions');
  });

  it('TC-02: Validation - Clearing Date field triggers "Required" error on View', () => {
    cy.visit(myAttendanceUrl);

    cy.get('.oxd-date-input input').clear();
    cy.contains('h5', 'My Attendance Records').click();
    cy.contains('button', 'View').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-03: Validation - Entering invalid date format triggers format error message', () => {
    cy.visit(myAttendanceUrl);

    cy.get('.oxd-date-input input').clear().type('2026-99-99');
    cy.contains('h5', 'My Attendance Records').click();
    cy.contains('button', 'View').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Should be a valid date');
  });

  // ====================================================
  // SECTION 2: SEARCH, DATEPICKER & ACTIONS (3 Tests)
  // ====================================================

  it('TC-04: Positive - Clicking View loads attendance records or "No Records Found" state', () => {
    cy.visit(myAttendanceUrl);
    cy.contains('button', 'View').click();

    cy.get('body').then(($body) => {
      if ($body.text().includes('No Records Found')) {
        cy.contains('No Records Found').should('be.visible');
      } else {
        cy.get('.oxd-table-body .oxd-table-card').should('have.length.at.least', 1);
      }
    });
  });

  it('TC-05: Date Selection - Enter valid date in yyyy-dd-mm format and search records', () => {
    cy.visit(myAttendanceUrl);

    // Instance uses yyyy-dd-mm format
    cy.get('.oxd-date-input input').clear().type('2026-01-11');
    cy.contains('h5', 'My Attendance Records').click();
    cy.contains('button', 'View').click();

    cy.get('.orangehrm-horizontal-padding').should('be.visible');
  });

  it('TC-06: Record Actions - Edit attendance punch record if available', () => {
    cy.visit(myAttendanceUrl);
    cy.contains('button', 'View').click();

    cy.get('body').then(($body) => {
      if ($body.find('.oxd-table-body .bi-pencil-fill').length > 0) {
        cy.get('.oxd-table-body .bi-pencil-fill').first().click();
        cy.url().should('include', '/attendance/editAttendanceRecord');
      } else {
        cy.contains('No Records Found').should('be.visible');
      }
    });
  });

  // ====================================================
  // SECTION 3: COLLAPSE TOGGLE & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: UI Toggle - Filter panel collapses and expands via chevron button', () => {
    cy.visit(myAttendanceUrl);

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('be.visible');
  });

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(myAttendanceUrl);
    cy.url().should('include', '/auth/login');
  });
});