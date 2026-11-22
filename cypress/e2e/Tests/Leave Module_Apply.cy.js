describe('OrangeHRM Leave Module - Apply Leave & Entitlements (8-Test Suite)', () => {
  const loginUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
  const applyLeaveUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/applyLeave';
  const myLeaveUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewMyLeaveList';

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
  // SECTION 1: NAVIGATION & EMPTY BALANCE STATE (2 Tests)
  // ====================================================

  it('TC-01: Navigation - Leave sidebar menu opens Leave module', () => {
    cy.contains('.oxd-main-menu-item', 'Leave').click();
    cy.url().should('include', '/leave/');
    cy.get('.oxd-topbar-header-breadcrumb-module').should('contain', 'Leave');
  });

  it('TC-02: Apply Leave - Verify empty balance message or Apply Leave form loads', () => {
    cy.visit(applyLeaveUrl);
    cy.url().should('include', '/leave/applyLeave');

    cy.get('body').then(($body) => {
      if ($body.text().includes('No Leave Types with Leave Balance')) {
        cy.contains('No Leave Types with Leave Balance').should('be.visible');
      } else {
        cy.get('.oxd-select-text').should('be.visible');
      }
    });
  });

  // ====================================================
  // SECTION 2: ENTITLEMENTS & APPLY LEAVE WORKFLOW (2 Tests)
  // ====================================================

  it('TC-03: Entitlements - Add leave entitlement for manda user', () => {
    cy.contains('.oxd-main-menu-item', 'Leave').click();
    cy.contains('.oxd-topbar-body-nav-tab', 'Entitlements').click();
    cy.contains('.oxd-topbar-body-nav-tab-link', 'Add Entitlements').click();

    cy.get('input[placeholder="Type for hints..."]').type('manda');
    cy.get('.oxd-autocomplete-dropdown [role="option"]').should('be.visible').first().click();

    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'CAN - Vacation').click();

    cy.get('.oxd-input').last().clear().type('10');
    cy.get('button[type="submit"]').click();

    cy.get('body').then(($body) => {
      if ($body.find('.oxd-dialog-container-default').length > 0) {
        cy.contains('.oxd-dialog-container-default button', 'Confirm').click();
      }
    });

    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
  });

  it('TC-04: Positive - Submit valid leave application after entitlement is added', () => {
    cy.visit(applyLeaveUrl);

    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'CAN - Vacation').click();

    cy.get('.oxd-date-input input').eq(0).clear().type('2026-12-01');
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-12-03');
    cy.contains('h6', 'Apply Leave').click();

    cy.get('textarea').type('Automated E2E leave request test');
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-toast').should('contain', 'Successfully Saved');
  });

  // ====================================================
  // SECTION 3: FORM VALIDATION (2 Tests)
  // ====================================================

  it('TC-05: Validation - Required field errors on empty Apply Leave submission', () => {
    cy.visit(applyLeaveUrl);

    cy.get('body').then(($body) => {
      if (!$body.text().includes('No Leave Types with Leave Balance')) {
        cy.get('button[type="submit"]').click();
        cy.get('.oxd-input-field-error-message').should('contain', 'Required');
      }
    });
  });

  it('TC-06: Validation - To Date earlier than From Date shows validation error', () => {
    cy.visit(applyLeaveUrl);

    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('[role="option"]', 'CAN - Vacation').click();

    cy.get('.oxd-date-input input').eq(0).clear().type('2026-12-10');
    cy.get('.oxd-date-input input').eq(1).clear().type('2026-12-05');
    cy.contains('h6', 'Apply Leave').click();

    cy.get('.oxd-input-field-error-message').should('contain', 'To date should be after from date');
  });

  // ====================================================
  // SECTION 4: MY LEAVE & SECURITY (2 Tests)
  // ====================================================

  it('TC-07: My Leave - Verify submitted leave appears and can be cancelled', () => {
    cy.visit(myLeaveUrl);
    cy.url().should('include', '/leave/viewMyLeaveList');

    cy.get('.oxd-table-body .oxd-table-card').should('have.length.at.least', 1);
    cy.contains('button', 'Cancel').first().click();
    cy.get('.oxd-toast').should('contain', 'Successfully Updated');
  });

  it('TC-08: Security - Unauthenticated access redirects to login', () => {
    cy.clearCookies();
    cy.visit(applyLeaveUrl);
    cy.url().should('include', '/auth/login');
  });
});