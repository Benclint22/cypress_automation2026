describe('OrangeHRM Leave Module - Configure Leave Types (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const leaveTypesUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/leaveTypeList';
  const uniqueLeaveType = `QA Auto Leave ${Date.now()}`;

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
  // SECTION 1: UI RENDERING & BULK SELECTION (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - Leave Types header, + Add button, record count, and table render properly', () => {
    cy.visit(leaveTypesUrl);
    cy.url().should('include', '/leave/leaveTypeList');

    cy.contains('h6', 'Leave Types').should('be.visible');
    cy.contains('button', 'Add').should('be.visible');
    cy.contains(/\(\d+\) Records Found/).should('be.visible');

    cy.get('.oxd-table-header').should('contain', 'Name').and('contain', 'Actions');
    cy.contains('CAN - Vacation').should('be.visible');
    cy.contains('US - Vacation').should('be.visible');
  });

  it('TC-02: Bulk Selection - Master checkbox selects all rows and shows Delete Selected button', () => {
    cy.visit(leaveTypesUrl);

    cy.get('.oxd-table-header .oxd-checkbox-input').click();
    cy.contains('button', 'Delete Selected').should('be.visible');
  });

  // ====================================================
  // SECTION 2: CRUD WORKFLOW & VALIDATIONS (5 Tests)
  // ====================================================

  it('TC-03: Validation - Empty and duplicate Leave Type names show validation errors', () => {
    cy.visit(leaveTypesUrl);
    cy.contains('button', 'Add').click();
    cy.url().should('include', '/leave/defineLeaveType');

    // Empty submission
    cy.contains('button', 'Save').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');

    // Duplicate name validation
    cy.get('.oxd-input').last().type('CAN - Vacation');
    cy.get('.oxd-input-field-error-message').should('contain', 'Already exists');
  });

  it('TC-04: Positive (Create) - Add a new Leave Type successfully', () => {
    cy.visit(leaveTypesUrl);
    cy.contains('button', 'Add').click();

    cy.get('.oxd-input').last().type(uniqueLeaveType);
    cy.contains('button', 'Save').click();

    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
    cy.contains(uniqueLeaveType).should('be.visible');
  });

  it('TC-05: Positive (Update) - Edit the newly created Leave Type name', () => {
    cy.visit(leaveTypesUrl);

    cy.contains('.oxd-table-row', uniqueLeaveType)
      .find('button .bi-pencil-fill')
      .click();

    cy.url().should('include', '/leave/defineLeaveType');
    cy.get('.oxd-input').last().clear().type(`${uniqueLeaveType} Updated`);
    cy.contains('button', 'Save').click();

    cy.get('.oxd-toast').should('contain', 'Successfully Updated');
    cy.contains(`${uniqueLeaveType} Updated`).should('be.visible');
  });

  it('TC-06: Cancel Delete - Clicking No, Cancel keeps the Leave Type in the list', () => {
    cy.visit(leaveTypesUrl);

    cy.contains('.oxd-table-row', `${uniqueLeaveType} Updated`)
      .find('button .bi-trash')
      .click();

    cy.contains('.oxd-dialog-container-default button', 'No, Cancel').click();
    cy.contains(`${uniqueLeaveType} Updated`).should('be.visible');
  });

  it('TC-07: Positive (Delete) - Delete the test Leave Type and verify removal', () => {
    cy.visit(leaveTypesUrl);

    cy.contains('.oxd-table-row', `${uniqueLeaveType} Updated`)
      .find('button .bi-trash')
      .click();

    cy.contains('.oxd-dialog-container-default button', 'Yes, Delete').click();
    cy.get('.oxd-toast').should('contain', 'Successfully Deleted');
    cy.contains(`${uniqueLeaveType} Updated`).should('not.exist');
  });

  // ====================================================
  // SECTION 3: SECURITY (1 Test)
  // ====================================================

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(leaveTypesUrl);
    cy.url().should('include', '/auth/login');
  });
});