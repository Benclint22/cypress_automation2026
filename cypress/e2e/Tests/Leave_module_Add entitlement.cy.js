describe('OrangeHRM Leave Module - Add Leave Entitlement (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const addEntitlementUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/addLeaveEntitlement';

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
  // SECTION 1: UI RENDERING & RADIO TOGGLE (2 Tests)
  // ====================================================

  it('TC-01: UI Elements - Add Leave Entitlement form fields and buttons render properly', () => {
    cy.visit(addEntitlementUrl);
    cy.url().should('include', '/leave/addLeaveEntitlement');

    cy.contains('h6', 'Add Leave Entitlement').should('be.visible');
    cy.get('input[type="radio"]').eq(0).should('be.checked'); // Individual Employee default
    cy.get('input[placeholder="Type for hints..."]').should('be.visible');
    cy.get('.oxd-select-text').eq(0).should('contain', '-- Select --');
    cy.get('.oxd-select-text').eq(1).should('contain', '2026-01-01 - 2026-31-12');
    cy.contains('button', 'Cancel').should('be.visible');
    cy.contains('button', 'Save').should('be.visible');
  });

  it('TC-02: Radio Toggle - Switching between Individual and Multiple Employees updates form fields', () => {
    cy.visit(addEntitlementUrl);

    // Switch to Multiple Employees
    cy.contains('label', 'Multiple Employees').click();
    cy.get('input[placeholder="Type for hints..."]').should('not.exist');
    cy.contains('label', 'Location').should('be.visible');
    cy.contains('label', 'Sub Unit').should('be.visible');

    // Switch back to Individual Employee
    cy.contains('label', 'Individual Employee').click();
    cy.get('input[placeholder="Type for hints..."]').should('be.visible');
  });

  // ====================================================
  // SECTION 2: POSITIVE WORKFLOW (1 Test)
  // ====================================================

  it('TC-03: Positive - Successfully add leave entitlement for an individual employee', () => {
    cy.visit(addEntitlementUrl);

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();

    cy.get('.oxd-select-text').eq(0).click();
    cy.get('[role="option"]').eq(1).click(); // Select first available leave type

    cy.get('.oxd-input').last().clear().type('10');
    cy.contains('button', 'Save').click();

    // Handle confirmation modal if employee already has existing balance
    cy.get('body').then(($body) => {
      if ($body.find('.oxd-dialog-container-default').length > 0) {
        cy.contains('.oxd-dialog-container-default button', 'Confirm').click();
      }
    });

    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
  });

  // ====================================================
  // SECTION 3: FORM VALIDATIONS & CANCEL (4 Tests)
  // ====================================================

  it('TC-04: Validation - Required errors trigger when submitting empty form', () => {
    cy.visit(addEntitlementUrl);
    cy.contains('button', 'Save').click();

    cy.get('.oxd-input-field-error-message').should('have.length.at.least', 3);
    cy.get('.oxd-input-field-error-message').should('contain', 'Required');
  });

  it('TC-05: Validation - Typing employee name without selecting autocomplete triggers "Invalid"', () => {
    cy.visit(addEntitlementUrl);

    cy.get('input[placeholder="Type for hints..."]').type('NonExistentEmployee999');
    cy.contains('button', 'Save').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'Invalid');
  });

  it('TC-06: Validation - Non-numeric input in Entitlement field shows format error', () => {
    cy.visit(addEntitlementUrl);

    cy.get('.oxd-input').last().type('abc');
    cy.contains('button', 'Save').click();

    cy.get('.oxd-input-field-error-message').should(
      'contain',
      'Should be a number with at most 2 decimal places'
    );
  });

  it('TC-07: Navigation - Cancel button exits Add Leave Entitlement page without saving', () => {
    cy.visit(addEntitlementUrl);
    cy.get('.oxd-input').last().type('5');
    cy.contains('button', 'Cancel').click();

    cy.url().should('not.include', '/leave/addLeaveEntitlement');
  });

  // ====================================================
  // SECTION 4: SECURITY (1 Test)
  // ====================================================

  it('TC-08: Security - Unauthenticated access redirects to login page', () => {
    cy.clearCookies();
    cy.visit(addEntitlementUrl);
    cy.url().should('include', '/auth/login');
  });
});