describe('OrangeHRM Time Module - My Timesheet (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const myTimesheetUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/time/viewMyTimesheet';

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
  // SECTION 1: UI RENDERING & PERIOD NAVIGATION (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - My Timesheet header, period selector, status, and buttons render properly', () => {
    cy.visit(myTimesheetUrl);
    cy.url().should('include', '/time/viewMyTimesheet');

    cy.contains('h6', 'My Timesheet').should('be.visible');
    cy.get('.oxd-date-input input').should('be.visible');
    cy.contains(/Status:/).should('be.visible');
    cy.contains('button', 'Edit').should('be.visible');
  });

  it('TC-02: Period Navigation - Left and right arrows switch between weekly timesheet periods', () => {
    cy.visit(myTimesheetUrl);

    cy.get('.oxd-date-input input').invoke('val').then((currentPeriod) => {
      // Click previous week arrow
      cy.get('.orangehrm-timeperiod-picker button').first().click();
      cy.get('.oxd-date-input input').invoke('val').should('not.eq', currentPeriod);

      // Click next week arrow to return
      cy.get('.orangehrm-timeperiod-picker button').last().click();
      cy.get('.oxd-date-input input').should('have.value', currentPeriod);
    });
  });

  // ====================================================
  // SECTION 2: EDIT TIMESHEET & VALIDATIONS (4 Tests)
  // ====================================================

  it('TC-03: Edit Mode - Clicking Edit opens editable timesheet and + Add Row adds a new entry row', () => {
    cy.visit(myTimesheetUrl);
    cy.contains('button', 'Edit').click();
    cy.url().should('include', '/time/editTimesheet');

    cy.get('.orangehrm-timesheet-table-body-row').then(($rows) => {
      const initialCount = $rows.length;
      cy.contains('button', 'Add Row').click();
      cy.get('.orangehrm-timesheet-table-body-row').should('have.length', initialCount + 1);
    });
  });

  it('TC-04: Validation - Entering hours > 24 or non-numeric characters triggers format error', () => {
    cy.visit(myTimesheetUrl);
    cy.contains('button', 'Edit').click();

    // Enter invalid value > 24 in first day time input
    cy.get('.orangehrm-timesheet-table-body-row')
      .first()
      .find('input.oxd-input')
      .first()
      .clear()
      .type('25:00');

    cy.contains('button', 'Save').click();
    cy.get('.oxd-input-field-error-message').should(
      'contain',
      'Should be less than 24 and in HH:MM or decimal format'
    );
  });

  it('TC-05: Validation - Saving hours without selecting Project triggers required validation', () => {
    cy.visit(myTimesheetUrl);
    cy.contains('button', 'Edit').click();

    // Clear project field if pre-populated or add a new row
    cy.contains('button', 'Add Row').click();
    cy.get('.orangehrm-timesheet-table-body-row')
      .last()
      .find('input.oxd-input')
      .first()
      .clear()
      .type('4:00');

    cy.contains('button', 'Save').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Select a Project');
  });

  it('TC-06: Positive (Save) - Log valid hours for a project activity and save timesheet', () => {
    cy.visit(myTimesheetUrl);
    cy.contains('button', 'Edit').click();

    // Type 'a' in the first Project autocomplete input to pick an available demo project
    cy.get('input[placeholder="Type for hints..."]').first().clear().type('a');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();

    // Select first available Activity
    cy.get('.oxd-select-text').first().click();
    cy.get('[role="option"]').eq(1).click();

    // Enter 8:00 for Monday
    cy.get('.orangehrm-timesheet-table-body-row')
      .first()
      .find('input.oxd-input')
      .first()
      .clear()
      .type('8:00');

    cy.contains('button', 'Save').click();
    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
  });

  // ====================================================
  // SECTION 3: SUBMIT WORKFLOW & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: Positive (Submit) - Submit saved timesheet and verify status updates', () => {
    cy.visit(myTimesheetUrl);

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Submit")').length > 0) {
        cy.contains('button', 'Submit').click();
        cy.get('.oxd-toast').should('contain', 'Successfully Submitted');
        cy.contains('Status: Submitted').should('be.visible');
      } else {
        cy.contains(/Status: (Submitted|Approved)/).should('be.visible');
      }
    });
  });

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(myTimesheetUrl);
    cy.url().should('include', '/auth/login');
  });
});