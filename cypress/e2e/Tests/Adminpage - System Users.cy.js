// Ignore OrangeHRM's background Axios 304/401 rejections during session redirects
Cypress.on('uncaught:exception', () => false);

describe('OrangeHRM Admin - System Users Page (24-Test Suite)', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com';
  const usersUrl = `${baseUrl}/web/index.php/admin/viewSystemUsers`;

  const waitForTableLoad = () => {
    cy.get('.oxd-loading-spinner', { timeout: 20000 }).should('not.exist');
  };

  const createTempUser = (username) => {
    cy.contains('button', 'Add').click();
    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('.oxd-select-option', 'ESS').click();

    cy.get('input[placeholder="Type for hints..."]').type('a');
    cy.get('.oxd-autocomplete-option')
      .first()
      .should('not.contain.text', 'Searching')
      .click();

    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-option', 'Enabled').click();

    cy.get('input.oxd-input').eq(1).type(username);
    cy.get('input[type="password"]').eq(0).type('TestPass@123');
    cy.get('input[type="password"]').eq(1).type('TestPass@123');
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-toast--success', { timeout: 15000 }).should('be.visible');
    cy.url().should('include', '/admin/viewSystemUsers');
    waitForTableLoad();
  };

  beforeEach(() => {
    cy.session('orangehrm-admin-session', () => {
      cy.visit(`${baseUrl}/web/index.php/auth/login`);
      cy.get('input[name="username"]', { timeout: 20000 }).type('Admin');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard/index');
    });

    cy.visit(usersUrl);
    cy.url().should('include', '/admin/viewSystemUsers');
    waitForTableLoad();
  });

  // ==========================================
  // SECTION 1: PAGE LOAD & SEARCH FILTERS (11 Tests)
  // ==========================================

  it('TC-01: Verify System Users page loads with filter card and table headers', () => {
    cy.get('.oxd-topbar-header-breadcrumb').should('contain.text', 'Admin');
    cy.contains('.oxd-table-filter-title', 'System Users').should('be.visible');
    cy.get('.oxd-table-header')
      .should('contain.text', 'Username')
      .and('contain.text', 'User Role')
      .and('contain.text', 'Employee Name')
      .and('contain.text', 'Status');
  });

  it('TC-02: Search Filter - Filter by exact Username ("Admin")', () => {
    cy.get('.oxd-form-row input.oxd-input').type('Admin');
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('.oxd-table-card').should('have.length.at.least', 1);
    cy.contains('.oxd-table-card .oxd-table-cell', /^Admin$/).should('be.visible');
  });

  it('TC-03: Search Filter - Filter by User Role ("Admin")', () => {
    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('.oxd-select-option', 'Admin').click();
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('.oxd-table-card').should(($cards) => {
      expect($cards.length).to.be.at.least(1);
      $cards.each((_, el) => {
        expect(el.innerText).to.include('Admin');
      });
    });
  });

  it('TC-04: Search Filter - Filter by User Role ("ESS")', () => {
    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('.oxd-select-option', 'ESS').click();
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('body').then(($body) => {
      if ($body.find('.oxd-table-card').length > 0) {
        cy.get('.oxd-table-card').should(($cards) => {
          $cards.each((_, el) => {
            expect(el.innerText).to.include('ESS');
          });
        });
      } else {
        cy.contains('No Records Found').should('be.visible');
      }
    });
  });

  it('TC-05: Search Filter - Filter by Employee Name autocomplete', () => {
    cy.get('.oxd-table-card')
      .first()
      .find('.oxd-table-cell')
      .eq(3)
      .invoke('text')
      .then((empName) => {
        const firstName = empName.trim().split(' ')[0];
        cy.get('input[placeholder="Type for hints..."]').type(firstName);
        cy.get('.oxd-autocomplete-option')
          .first()
          .should('not.contain.text', 'Searching')
          .click();
        cy.get('button[type="submit"]').click();
        waitForTableLoad();

        cy.get('.oxd-table-card').should('have.length.at.least', 1);
      });
  });

  it('TC-06: Search Filter - Filter by Status ("Enabled")', () => {
    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-option', 'Enabled').click();
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('.oxd-table-card').should(($cards) => {
      expect($cards.length).to.be.at.least(1);
      $cards.each((_, el) => {
        expect(el.innerText).to.include('Enabled');
      });
    });
  });

  it('TC-07: Search Filter - Filter by Status ("Disabled")', () => {
    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-option', 'Disabled').click();
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('body').then(($body) => {
      if ($body.find('.oxd-table-card').length > 0) {
        cy.get('.oxd-table-card').should(($cards) => {
          $cards.each((_, el) => {
            expect(el.innerText).to.include('Disabled');
          });
        });
      } else {
        cy.contains('No Records Found').should('be.visible');
      }
    });
  });

  it('TC-08: Search Filter - Combined Username, Role, and Status filters', () => {
    cy.get('.oxd-form-row input.oxd-input').type('Admin');
    cy.get('.oxd-select-text').eq(0).click();
    cy.contains('.oxd-select-option', 'Admin').click();
    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-option', 'Enabled').click();
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('.oxd-table-card').should('have.length.at.least', 1);
  });

  it('TC-09: Search Filter - Non-existent Username displays "No Records Found"', () => {
    cy.get('.oxd-form-row input.oxd-input').type('NoSuchUser_99999');
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.contains('No Records Found').should('be.visible');
    cy.get('.oxd-table-card').should('not.exist');
  });

  it('TC-10: Search Filter - Unselected Employee Name text triggers "Invalid" validation', () => {
    cy.get('input[placeholder="Type for hints..."]').type('RandomUnselectedName');
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-input-field-error-message').should('contain.text', 'Invalid');
  });

  it('TC-11: Search Filter - Clicking "Reset" clears inputs and reloads full user list', () => {
    cy.get('.oxd-form-row input.oxd-input').type('NoSuchUser_99999');
    cy.get('button[type="submit"]').click();
    waitForTableLoad();
    cy.get('.oxd-table-card').should('not.exist');

    cy.contains('button', 'Reset').click();
    waitForTableLoad();
    cy.get('.oxd-form-row input.oxd-input').should('have.value', '');
    cy.get('.oxd-table-card').should('have.length.at.least', 1);
  });

  // ==========================================
  // SECTION 2: CREATE & VALIDATE USER (6 Tests)
  // ==========================================

  it('TC-12: Navigation - Clicking "+ Add" navigates to Add User screen', () => {
    cy.contains('button', 'Add').click();
    cy.url().should('include', '/admin/saveSystemUser');
    cy.contains('h6', 'Add User').should('be.visible');
  });

  it('TC-13: Create User - Successfully add a new ESS user', () => {
    createTempUser(`qa_create_${Date.now()}`);
  });

  it('TC-14: Validation - Submitting empty Add User form displays Required errors', () => {
    cy.contains('button', 'Add').click();
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-input-field-error-message').should('have.length.at.least', 5);
  });

  it('TC-15: Validation - Entering duplicate Username ("Admin") shows "Already exists"', () => {
    cy.contains('button', 'Add').click();
    cy.get('input.oxd-input').eq(1).type('Admin');

    cy.get('.oxd-input-field-error-message').should('contain.text', 'Already exists');
  });

  it('TC-16: Validation - Mismatched passwords show "Passwords do not match"', () => {
    cy.contains('button', 'Add').click();
    cy.get('input[type="password"]').eq(0).type('TestPass@123');
    cy.get('input[type="password"]').eq(1).type('DifferentPass@123');

    cy.get('.oxd-input-field-error-message').should('contain.text', 'Passwords do not match');
  });

  it('TC-17: Validation - Short password triggers minimum length error', () => {
    cy.contains('button', 'Add').click();
    cy.get('input[type="password"]').eq(0).type('123');

    cy.get('.oxd-input-field-error-message').should(
      'contain.text',
      'Should have at least 7 characters'
    );
  });

  // ==========================================
  // SECTION 3: EDIT, DELETE & SECURITY (7 Tests)
  // =====================================

  it('TC-18: Update User - Edit newly created user status to Disabled', () => {
    const tempUser = `qa_edit_${Date.now()}`;
    createTempUser(tempUser);

    cy.get('.oxd-form-row input.oxd-input').type(tempUser);
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('.oxd-table-card').first().find('button:has(i.bi-pencil-fill)').click();
    cy.url().should('include', '/admin/saveSystemUser/');

    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-option', 'Disabled').click();
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-toast--success', { timeout: 15000 }).should('be.visible');
  });

  it('TC-19: Delete User - Canceling delete confirmation preserves the record', () => {
    const tempUser = `qa_cancel_${Date.now()}`;
    createTempUser(tempUser);

    cy.get('.oxd-form-row input.oxd-input').type(tempUser);
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('.oxd-table-card').first().find('button:has(i.bi-trash)').click();
    cy.contains('button', 'No, Cancel').should('be.visible').click();

    cy.get('.oxd-table-card').should('contain.text', tempUser);
  });

  it('TC-20: Bulk Selection - Selecting row checkboxes reveals "Delete Selected" button', () => {
    const tempUser = `qa_bulk_${Date.now()}`;
    createTempUser(tempUser);

    cy.get('.oxd-form-row input.oxd-input').type(tempUser);
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('.oxd-table-card .oxd-checkbox-input').first().click();
    cy.contains('button', 'Delete Selected').should('be.visible');
  });

  it('TC-21: Delete User - Confirming delete removes the user record', () => {
    const tempUser = `qa_delete_${Date.now()}`;
    createTempUser(tempUser);

    cy.get('.oxd-form-row input.oxd-input').type(tempUser);
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.get('.oxd-table-card').first().find('button:has(i.bi-trash)').click();
    cy.contains('button', 'Yes, Delete').should('be.visible').click();

    cy.get('.oxd-toast--success', { timeout: 15000 }).should('be.visible');
  });

  it('TC-22: Security - Primary "Admin" account cannot be bulk-selected or deleted', () => {
    cy.get('.oxd-form-row input.oxd-input').type('Admin');
    cy.get('button[type="submit"]').click();
    waitForTableLoad();

    cy.contains('.oxd-table-card .oxd-table-cell', /^Admin$/)
      .parents('.oxd-table-card')
      .find('.oxd-checkbox-input')
      .should('not.exist');
  });

  it('TC-23: UI Controls - Collapse System Users filter panel and sort Username column', () => {
    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('be.visible');

    cy.contains('.oxd-table-header-cell', 'Username')
      .find('.oxd-table-header-sort-icon')
      .click();
    cy.contains('.oxd-table-header-sort-dropdown-item', 'Ascending').click();
    waitForTableLoad();
  });

  it('TC-24: Security - Direct URL access without session redirects to Login', () => {
    cy.clearCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visit(usersUrl);
    cy.url().should('include', '/auth/login');
  });
});