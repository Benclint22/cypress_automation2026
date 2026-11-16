describe('OrangeHRM PIM - Employee List Page (26-Test Suite)', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com';
  const empListUrl = `${baseUrl}/web/index.php/pim/viewEmployeeList`;
  const uniqueId = `${Math.floor(10000 + Math.random() * 90000)}`;
  const firstName = 'AutoQA';
  const lastName = `Tester_${uniqueId}`;

  beforeEach(() => {
    cy.visit(`${baseUrl}/web/index.php/auth/login`);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');

    // Navigate to PIM -> Employee List
    cy.contains('.oxd-main-menu-item', 'PIM').click();
    cy.url().should('include', '/pim/viewEmployeeList');
  });

  // ==========================================
  // SECTION 1: PAGE LOAD & SEARCH FILTERS (13 Tests)
  // ==========================================

  it('TC-01: Verify Employee List page loads with filter panel and table columns', () => {
    cy.get('.oxd-topbar-header-breadcrumb').should('contain.text', 'PIM');
    cy.contains('.oxd-table-filter-title', 'Employee Information').should('be.visible');
    cy.get('.oxd-table-header')
      .should('contain.text', 'Id')
      .and('contain.text', 'First (& Middle) Name')
      .and('contain.text', 'Last Name')
      .and('contain.text', 'Job Title')
      .and('contain.text', 'Employment Status')
      .and('contain.text', 'Sub Unit')
      .and('contain.text', 'Supervisor');
  });

  it('TC-02: Search Filter - Filter by Employee Name autocomplete', () => {
    cy.get('.oxd-table-card').first().find('.oxd-table-cell').eq(2).invoke('text').then((empFirst) => {
      const searchKey = empFirst.trim().split(' ')[0];
      cy.get('input[placeholder="Type for hints..."]').eq(0).type(searchKey);
      cy.get('.oxd-autocomplete-option').first().should('not.contain.text', 'Searching').click();
      cy.get('button[type="submit"]').click();

      cy.get('.oxd-table-card').should('have.length.at.least', 1);
    });
  });

  it('TC-03: Search Filter - Filter by exact Employee Id', () => {
    cy.get('.oxd-table-card').first().find('.oxd-table-cell').eq(1).invoke('text').then((empId) => {
      const cleanId = empId.trim();
      if (cleanId) {
        cy.get('.oxd-form-row input.oxd-input').type(cleanId);
        cy.get('button[type="submit"]').click();

        cy.get('.oxd-table-card').first().should('contain.text', cleanId);
      }
    });
  });

  it('TC-04: Search Filter - Filter by Employment Status dropdown', () => {
    cy.get('.oxd-select-text').eq(0).click();
    cy.get('.oxd-select-option').eq(1).click();
    cy.get('button[type="submit"]').click();

    cy.get('body').should('contain.text', 'Record');
  });

  it('TC-05: Search Filter - Include dropdown ("Current Employees Only")', () => {
    cy.get('.oxd-select-text').eq(1).should('contain.text', 'Current Employees Only');
    cy.get('button[type="submit"]').click();
    cy.get('.oxd-table-card').should('have.length.at.least', 1);
  });

  it('TC-06: Search Filter - Include dropdown ("Current and Past Employees")', () => {
    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-option', 'Current and Past Employees').click();
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-table-card').should('have.length.at.least', 1);
  });

  it('TC-07: Search Filter - Include dropdown ("Past Employees Only")', () => {
    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-option', 'Past Employees Only').click();
    cy.get('button[type="submit"]').click();

    cy.get('body').then(($body) => {
      if ($body.find('.oxd-table-card').length > 0) {
        cy.get('.oxd-table-card').should('have.length.at.least', 1);
      } else {
        cy.contains('No Records Found').should('be.visible');
      }
    });
  });

  it('TC-08: Search Filter - Filter by Supervisor Name autocomplete', () => {
    cy.get('input[placeholder="Type for hints..."]').eq(1).type('a');
    cy.get('body').then(($body) => {
      if ($body.find('.oxd-autocomplete-option').length > 0) {
        cy.get('.oxd-autocomplete-option').first().click();
        cy.get('button[type="submit"]').click();
      }
    });
  });

  it('TC-09: Search Filter - Filter by Job Title dropdown', () => {
    cy.get('.oxd-select-text').eq(2).click();
    cy.get('.oxd-select-option').eq(1).click();
    cy.get('button[type="submit"]').click();

    cy.get('body').should('contain.text', 'Record');
  });

  it('TC-10: Search Filter - Filter by Sub Unit dropdown', () => {
    cy.get('.oxd-select-text').eq(3).click();
    cy.get('.oxd-select-option').eq(1).click();
    cy.get('button[type="submit"]').click();

    cy.get('body').should('contain.text', 'Record');
  });

  it('TC-11: Search Filter - Combined multi-criteria filter execution', () => {
    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-option', 'Current and Past Employees').click();
    cy.get('.oxd-select-text').eq(0).click();
    cy.get('.oxd-select-option').eq(1).click();
    cy.get('button[type="submit"]').click();

    cy.get('body').should('contain.text', 'Record');
  });

  it('TC-12: Search Filter - Non-existent Employee Id displays "No Records Found"', () => {
    cy.get('.oxd-form-row input.oxd-input').type('99999999');
    cy.get('button[type="submit"]').click();

    cy.contains('No Records Found').should('be.visible');
    cy.get('.oxd-table-card').should('not.exist');
  });

  it('TC-13: Search Filter - Clicking "Reset" clears all filter inputs and reloads list', () => {
    cy.get('.oxd-form-row input.oxd-input').type('99999999');
    cy.get('button[type="submit"]').click();
    cy.get('.oxd-table-card').should('not.exist');

    cy.contains('button', 'Reset').click();
    cy.get('.oxd-form-row input.oxd-input').should('have.value', '');
    cy.get('.oxd-select-text').eq(1).should('contain.text', 'Current Employees Only');
    cy.get('.oxd-table-card').should('have.length.at.least', 1);
  });

  // ==========================================
  // SECTION 2: ADD & VALIDATE EMPLOYEE (5 Tests)
  // ==========================================

  it('TC-14: Navigation - Clicking "+ Add" redirects to Add Employee screen', () => {
    cy.contains('button', 'Add').click();
    cy.url().should('include', '/pim/addEmployee');
    cy.contains('h6', 'Add Employee').should('be.visible');
  });

  it('TC-15: Create Employee - Add a new employee with basic details', () => {
    cy.contains('button', 'Add').click();

    cy.get('input[name="firstName"]').type(firstName);
    cy.get('input[name="middleName"]').type('Cypress');
    cy.get('input[name="lastName"]').type(lastName);

    // Clear auto-generated ID and enter unique ID
    cy.get('.oxd-grid-2 input.oxd-input').clear().type(uniqueId);
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-toast--success').should('be.visible');
    cy.url().should('include', '/pim/viewPersonalDetails/empNumber/');
  });

  it('TC-16: Create Employee - Toggle "Create Login Details" reveals login fields', () => {
    cy.contains('button', 'Add').click();
    cy.get('.oxd-switch-input').click();

    cy.contains('label', 'Username').should('be.visible');
    cy.contains('label', 'Password').should('be.visible');
    cy.contains('label', 'Confirm Password').should('be.visible');
  });

  it('TC-17: Validation - Submitting empty Add Employee form shows Required errors', () => {
    cy.contains('button', 'Add').click();
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-input-field-error-message')
      .should('have.length', 2)
      .each(($el) => {
        expect($el.text()).to.equal('Required');
      });
  });

  it('TC-18: Validation - Duplicate Employee Id triggers "Employee Id already exists"', () => {
    // Grab an existing Employee ID first
    cy.get('.oxd-table-card').first().find('.oxd-table-cell').eq(1).invoke('text').then((existingId) => {
      const cleanId = existingId.trim();
      if (cleanId) {
        cy.contains('button', 'Add').click();
        cy.get('input[name="firstName"]').type('DupCheck');
        cy.get('input[name="lastName"]').type('User');
        cy.get('.oxd-grid-2 input.oxd-input').clear().type(cleanId);

        cy.get('.oxd-input-field-error-message').should('contain.text', 'Employee Id already exists');
      }
    });
  });

  // ==========================================
  // SECTION 3: EDIT, DELETE, SORT & SECURITY (8 Tests)
  // ==========================================

  it('TC-19: Edit Employee - Clicking Pencil icon opens Personal Details for editing', () => {
    cy.get('.oxd-form-row input.oxd-input').type(uniqueId);
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-table-card').first().find('button i.bi-pencil-fill').click();
    cy.url().should('include', '/pim/viewPersonalDetails/empNumber/');
    cy.get('input[name="firstName"]').should('have.value', firstName);
  });

  it('TC-20: Navigation - Clicking directly on employee row opens Personal Details', () => {
    cy.get('.oxd-table-card').first().find('.oxd-table-cell').eq(2).click();
    cy.url().should('include', '/pim/viewPersonalDetails/empNumber/');
  });

  it('TC-21: Delete Employee - Canceling delete modal keeps employee record', () => {
    cy.get('.oxd-form-row input.oxd-input').type(uniqueId);
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-table-card').first().find('button i.bi-trash').click();
    cy.contains('button', 'No, Cancel').click();

    cy.get('.oxd-table-card').should('contain.text', uniqueId);
  });

  it('TC-22: Delete Employee - Confirming delete removes employee record', () => {
    cy.get('.oxd-form-row input.oxd-input').type(uniqueId);
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-table-card').first().find('button i.bi-trash').click();
    cy.contains('button', 'Yes, Delete').click();

    cy.get('.oxd-toast--success').should('be.visible');
  });

  it('TC-23: Bulk Selection - Checking row checkboxes displays "Delete Selected" button', () => {
    cy.get('.oxd-table-card .oxd-checkbox-input').first().click();
    cy.contains('button', 'Delete Selected').should('be.visible');
  });

  it('TC-24: Table Sorting - Sort Employee List by "Last Name" Ascending', () => {
    cy.contains('.oxd-table-header-cell', 'Last Name')
      .find('.oxd-table-header-sort-icon')
      .click();
    cy.contains('.oxd-table-header-sort-dropdown-item', 'Ascending').click();
  });

  it('TC-25: UI Controls - Collapse and expand "Employee Information" filter card', () => {
    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('not.be.visible');

    cy.get('.oxd-table-filter-header-options button').click();
    cy.get('.oxd-table-filter-area').should('be.visible');
  });

  it('TC-26: Security - Unauthenticated direct access redirects to Login page', () => {
    cy.clearCookies();
    cy.visit(empListUrl);
    cy.url().should('include', '/auth/login');
  });
});