describe('OrangeHRM Leave Module - Configure Holidays (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const holidaysUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewHolidayList';
  const uniqueHoliday = `QA Auto Holiday ${Date.now()}`;

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
  // SECTION 1: UI RENDERING & SEARCH FILTERS (3 Tests)
  // ====================================================

  it('TC-01: UI Elements - Holidays filters, + Add button, and table columns render properly', () => {
    cy.visit(holidaysUrl);
    cy.url().should('include', '/leave/viewHolidayList');

    cy.contains('h5', 'Holidays').should('be.visible');
    cy.get('.oxd-date-input input').eq(0).should('have.value', '2026-01-01');
    cy.get('.oxd-date-input input').eq(1).should('have.value', '2026-31-12');
    cy.contains('button', 'Reset').should('be.visible');
    cy.contains('button', 'Search').should('be.visible');
    cy.contains('button', 'Add').should('be.visible');

    // Verify table column headers
    cy.get('.oxd-table-header')
      .should('contain', 'Name')
      .and('contain', 'Date')
      .and('contain', 'Full Day/Half Day')
      .and('contain', 'Repeats Annually')
      .and('contain', 'Actions');
  });

  it('TC-02: Filter Search & Reset - Date filter searches records and Reset restores defaults', () => {
    cy.visit(holidaysUrl);

    // Modify To Date (yyyy-dd-mm format) and Search
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-30-06');
    cy.contains('h5', 'Holidays').click();
    cy.contains('button', 'Search').click();
    cy.get('.orangehrm-horizontal-padding').should('be.visible');

    // Click Reset and verify default To Date returns
    cy.contains('button', 'Reset').click();
    cy.get('.oxd-date-input input').eq(1).should('have.value', '2026-31-12');
  });

  it('TC-03: Validation - To Date earlier than From Date shows date range error', () => {
    cy.visit(holidaysUrl);

    cy.get('.oxd-date-input input').eq(0).clear().type('2026-15-10');
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-01-01');
    cy.contains('h5', 'Holidays').click();

    cy.contains('button', 'Search').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'To date should be after from date');
  });

  // ====================================================
  // SECTION 2: CRUD WORKFLOW & FORM VALIDATIONS (4 Tests)
  // ====================================================

  it('TC-04: Validation - Required errors trigger when submitting empty Add Holiday form', () => {
    cy.visit(holidaysUrl);
    cy.contains('button', 'Add').click();
    cy.url().should('include', '/leave/defineHoliday');

    cy.contains('button', 'Save').click();
    cy.get('.oxd-input-field-error-message').should('have.length.at.least', 2);
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-05: Positive (Create) - Add a new Holiday with Repeats Annually enabled', () => {
    cy.visit(holidaysUrl);
    cy.contains('button', 'Add').click();

    cy.get('.oxd-input').eq(1).type(uniqueHoliday);
    cy.get('.oxd-date-input input').clear().type('2026-25-11'); // yyyy-dd-mm format
    cy.contains('h6', 'Add Holiday').click();

    // Select Yes for Repeats Annually
    cy.contains('label', 'Yes').click();
    cy.contains('button', 'Save').click();

    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
    cy.contains(uniqueHoliday).should('be.visible');
  });

  it('TC-06: Positive (Update) - Edit the newly created Holiday name and day length', () => {
    cy.visit(holidaysUrl);

    cy.contains('.oxd-table-row', uniqueHoliday)
      .find('button .bi-pencil-fill')
      .click();

    cy.url().should('include', '/leave/defineHoliday');
    cy.get('.oxd-input').eq(1).clear().type(`${uniqueHoliday} Updated`);

    // Change Full Day to Half Day
    cy.get('.oxd-select-text').click();
    cy.contains('[role="option"]', 'Half Day').click();

    cy.contains('button', 'Save').click();
    cy.get('.oxd-toast').should('contain', 'Successfully Updated');
    cy.contains(`${uniqueHoliday} Updated`).should('be.visible');
  });

  it('TC-07: Positive (Delete) - Delete the test Holiday and verify removal', () => {
    cy.visit(holidaysUrl);

    cy.contains('.oxd-table-row', `${uniqueHoliday} Updated`)
      .find('button .bi-trash')
      .click();

    cy.contains('.oxd-dialog-container-default button', 'Yes, Delete').click();
    cy.get('.oxd-toast').should('contain', 'Successfully Deleted');
    cy.contains(`${uniqueHoliday} Updated`).should('not.exist');
  });

  // ====================================================
  // SECTION 3: SECURITY (1 Test)
  // ====================================================

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(holidaysUrl);
    cy.url().should('include', '/auth/login');
  });
});