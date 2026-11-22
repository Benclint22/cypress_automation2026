describe('OrangeHRM Leave Module - Configure Leave Period (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const leavePeriodUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/defineLeavePeriod';

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
  // SECTION 1: UI RENDERING & READ-ONLY FIELDS (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - Leave Period dropdowns, labels, and buttons render properly', () => {
    cy.visit(leavePeriodUrl);
    cy.url().should('include', '/leave/defineLeavePeriod');

    cy.contains('h6', 'Leave Period').should('be.visible');
    cy.get('.oxd-select-text').eq(0).should('be.visible'); // Start Month*
    cy.get('.oxd-select-text').eq(1).should('be.visible'); // Start Date*
    cy.contains('label', 'End Date').should('be.visible');
    cy.contains('label', 'Current Leave Period').should('be.visible');
    cy.contains('button', 'Reset').should('be.visible');
    cy.contains('button', 'Save').should('be.visible');
  });

  it('TC-02: Read-Only Fields - End Date and Current Leave Period are non-editable text', () => {
    cy.visit(leavePeriodUrl);

    // Ensure there are no text <input> elements inside the Leave Period form card
    cy.get('.orangehrm-card-container input').should('not.exist');
    cy.get('.orangehrm-card-container').should('contain', 'End Date').and('contain', 'Current Leave Period');
  });

  // ====================================================
  // SECTION 2: DYNAMIC CALCULATION & VALIDATION (4 Tests)
  // ====================================================

  it('TC-03: Dynamic Calculation - Changing Start Month and Date recalculates End Date', () => {
    cy.visit(leavePeriodUrl);

    // Select March
    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'March').click();

    // Select 15
    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('[role="option"]', '15').click();

    cy.contains('March 14').should('be.visible');
  });

  it('TC-04: Month Boundary - Selecting February limits Start Date options to 28/29 days', () => {
    cy.visit(leavePeriodUrl);

    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'February').click();

    cy.get('.oxd-select-text').eq(1).click();
    cy.get('[role="option"]').should('not.contain', '30');
    cy.get('[role="option"]').should('not.contain', '31');
  });

  it('TC-05: Reset Button - Reverts unsaved Start Month and Date changes', () => {
    cy.visit(leavePeriodUrl);

    cy.get('.oxd-select-text').eq(0).invoke('text').then((initialMonth) => {
      // Change Start Month to July
      cy.get('.oxd-select-text').eq(0).click();
      cy.contains('[role="option"]', 'July').click();
      cy.get('.oxd-select-text').eq(0).should('contain', 'July');

      // Click Reset and verify original month returns
      cy.contains('button', 'Reset').click();
      cy.get('.oxd-select-text').eq(0).should('contain', initialMonth.trim());
    });
  });

  it('TC-06: Validation - Selecting 31st then switching to February clears Start Date and requires selection', () => {
    cy.visit(leavePeriodUrl);

    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'January').click();

    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('[role="option"]', '31').click();

    // Switch to February so day 31 becomes invalid/cleared
    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'February').click();

    cy.contains('button', 'Save').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  // ====================================================
  // SECTION 3: SAVE WORKFLOW & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: Positive - Save Leave Period configuration displays success toast', () => {
    cy.visit(leavePeriodUrl);

    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'January').click();

    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('[role="option"]', '01').click();

    cy.contains('button', 'Save').click();
    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
    cy.contains('December 31').should('be.visible');
  });

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(leavePeriodUrl);
    cy.url().should('include', '/auth/login');
  });
});