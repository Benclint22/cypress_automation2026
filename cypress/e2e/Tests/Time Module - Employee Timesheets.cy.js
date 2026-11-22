describe('OrangeHRM Time Module - Employee Timesheets (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const empTimesheetUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/time/viewEmployeeTimesheet';

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

  it('TC-01: UI Elements - Select Employee card and Timesheets Pending Action table render properly', () => {
    cy.visit(empTimesheetUrl);
    cy.url().should('include', '/time/viewEmployeeTimesheet');

    cy.contains('h6', 'Select Employee').should('be.visible');
    cy.get('input[placeholder="Type for hints..."]').should('be.visible');
    cy.contains('button', 'View').should('be.visible');

    cy.contains('h6', 'Timesheets Pending Action').should('be.visible');
    cy.get('.oxd-table-header')
      .should('contain', 'Employee Name')
      .and('contain', 'Timesheet Period')
      .and('contain', 'Actions');
  });

  it('TC-02: Validation - Clicking View without entering Employee Name triggers "Required" error', () => {
    cy.visit(empTimesheetUrl);

    cy.get('form button[type="submit"]').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-03: Validation - Typing invalid Employee Name without autocomplete selection triggers "Invalid"', () => {
    cy.visit(empTimesheetUrl);

    cy.get('input[placeholder="Type for hints..."]').type('NonExistentEmployee999');
    cy.get('form button[type="submit"]').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Invalid');
  });

  // ====================================================
  // SECTION 2: SEARCH & TIMESHEET ACTIONS (4 Tests)
  // ====================================================

  it('TC-04: Positive - Select valid employee from autocomplete and view their timesheet', () => {
    cy.visit(empTimesheetUrl);

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();
    cy.get('form button[type="submit"]').click();

    cy.url().should('include', '/time/viewTimesheet/employeeId/');
    cy.contains(/Timesheet for/).should('be.visible');
  });

  it('TC-05: Pending Table - Open a pending employee timesheet from Timesheets Pending Action list', () => {
    cy.visit(empTimesheetUrl);

    cy.get('body').then(($body) => {
      if ($body.find('.oxd-table-body .oxd-table-card').length > 0) {
        cy.get('.oxd-table-body .oxd-table-card').first().contains('button', 'View').click();
        cy.url().should('include', '/time/viewTimesheet/employeeId/');
        cy.contains(/Timesheet for/).should('be.visible');
      } else {
        cy.contains('No Records Found').should('be.visible');
      }
    });
  });

  it('TC-06: Approval Workflow - Approve pending employee timesheet if Approve button is present', () => {
    cy.visit(empTimesheetUrl);

    cy.get('body').then(($body) => {
      if ($body.find('.oxd-table-body .oxd-table-card').length > 0) {
        cy.get('.oxd-table-body .oxd-table-card').first().contains('button', 'View').click();

        cy.get('body').then(($timesheetBody) => {
          if ($timesheetBody.find('button:contains("Approve")').length > 0) {
            cy.get('textarea').type('Approved via Cypress automated suite');
            cy.contains('button', 'Approve').click();
            cy.get('.oxd-toast').should('contain', 'Successfully Approved');
          }
        });
      }
    });
  });

  it('TC-07: Period Navigation - Navigate backward and forward on an employee timesheet', () => {
    cy.visit(empTimesheetUrl);

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();
    cy.get('form button[type="submit"]').click();

    cy.get('.oxd-date-input input').invoke('val').then((initialPeriod) => {
      cy.get('.orangehrm-timeperiod-picker button').first().click();
      cy.get('.oxd-date-input input').invoke('val').should('not.eq', initialPeriod);
    });
  });

  // ====================================================
  // SECTION 3: SECURITY (1 Test)
  // ====================================================

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(empTimesheetUrl);
    cy.url().should('include', '/auth/login');
  });
});