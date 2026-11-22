describe('OrangeHRM Leave Module - Configure Work Week (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const workWeekUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/defineWorkWeek';

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
  // SECTION 1: UI RENDERING & DROPDOWN OPTIONS (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - Work Week title, all 7 day dropdowns, and Save button render properly', () => {
    cy.visit(workWeekUrl);
    cy.url().should('include', '/leave/defineWorkWeek');

    cy.contains('h6', 'Work Week').should('be.visible');
    cy.get('.oxd-select-text').should('have.length', 7);

    // Verify Mon-Fri default to Full Day and Sat-Sun default to Non-working Day
    cy.get('.oxd-select-text').eq(0).should('contain', 'Full Day'); // Monday
    cy.get('.oxd-select-text').eq(4).should('contain', 'Full Day'); // Friday
    cy.get('.oxd-select-text').eq(5).should('contain', 'Non-working Day'); // Saturday
    cy.get('.oxd-select-text').eq(6).should('contain', 'Non-working Day'); // Sunday

    cy.contains('button', 'Save').should('be.visible');
  });

  it('TC-02: Dropdown Options - Day selector contains Full Day, Half Day, and Non-working Day', () => {
    cy.visit(workWeekUrl);

    cy.get('.oxd-select-text').eq(0).click();
    cy.get('[role="option"]').should('contain', 'Full Day')
      .and('contain', 'Half Day')
      .and('contain', 'Non-working Day');
  });

  // ====================================================
  // SECTION 2: VALIDATION, SAVE & PERSISTENCE (5 Tests)
  // ====================================================

  it('TC-03: Validation - Selecting "-- Select --" for a day triggers "Required" error on Save', () => {
    cy.visit(workWeekUrl);

    // Select '-- Select --' for Friday (index 4)
    cy.get('.oxd-select-text').eq(4).click();
    cy.contains('[role="option"]', '-- Select --').click();

    cy.contains('button', 'Save').click();
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-04: Positive - Update Friday to Half Day and save successfully', () => {
    cy.visit(workWeekUrl);

    cy.get('.oxd-select-text').eq(4).click();
    cy.contains('[role="option"]', 'Half Day').click();

    cy.contains('button', 'Save').click();
    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
  });

  it('TC-05: State Persistence - Updated Work Week schedule persists after page reload', () => {
    cy.visit(workWeekUrl);

    cy.get('.oxd-select-text').eq(4).should('contain', 'Half Day');
    cy.reload();
    cy.get('.oxd-select-text').eq(4).should('contain', 'Half Day');
  });

  it('TC-06: Positive - Configure Saturday as Half Day and save', () => {
    cy.visit(workWeekUrl);

    cy.get('.oxd-select-text').eq(5).click();
    cy.contains('[role="option"]', 'Half Day').click();

    cy.contains('button', 'Save').click();
    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
  });

  it('TC-07: Cleanup - Restore standard Mon-Fri Full Day and Sat-Sun Non-working Day schedule', () => {
    cy.visit(workWeekUrl);

    // Restore Friday (index 4) to Full Day
    cy.get('.oxd-select-text').eq(4).click();
    cy.contains('[role="option"]', 'Full Day').click();

    // Restore Saturday (index 5) to Non-working Day
    cy.get('.oxd-select-text').eq(5).click();
    cy.contains('[role="option"]', 'Non-working Day').click();

    cy.contains('button', 'Save').click();
    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
  });

  // ====================================================
  // SECTION 3: SECURITY (1 Test)
  // ====================================================

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(workWeekUrl);
    cy.url().should('include', '/auth/login');
  });
});