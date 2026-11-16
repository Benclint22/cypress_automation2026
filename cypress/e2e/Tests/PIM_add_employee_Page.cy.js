describe('OrangeHRM PIM - Add Employee Page (14-Test Suite)', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com';
  const addEmpUrl = `${baseUrl}/web/index.php/pim/addEmployee`;
  const uniqueId = `ID${Math.floor(1000 + Math.random() * 9000)}`;
  const loginUsername = `QAUser_${Date.now()}`;

  beforeEach(() => {
    // Standard Login
    cy.visit(`${baseUrl}/web/index.php/auth/login`);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Navigate directly to Add Employee
    cy.visit(addEmpUrl);
    cy.url().should('include', '/pim/addEmployee');
  });

  // ==========================================
  // SECTION 1: UI & VALIDATION (4 Tests)
  // ==========================================

  it('TC-01: Page Load - Verify layout and top tabs', () => {
    cy.get('.oxd-topbar-header-breadcrumb').should('contain.text', 'PIM');
    cy.contains('h6', 'Add Employee').should('be.visible');
    cy.get('.orangehrm-employee-image').should('be.visible'); // Avatar uploader
    cy.get('input[name="firstName"]').should('be.visible');
    cy.get('input[name="lastName"]').should('be.visible');
  });

  it('TC-02: Validation - Submitting empty form triggers "Required" errors', () => {
    cy.contains('button', 'Save').click();

    // Verify errors appear for First and Last Name
    cy.get('.oxd-input-field-error-message').should('have.length', 2)
      .each(($error) => {
        expect($error.text()).to.equal('Required');
      });
  });

  it('TC-03: Validation - Duplicate Employee Id triggers error', () => {
    // Enter dummy names
    cy.get('input[name="firstName"]').type('Duplicate');
    cy.get('input[name="lastName"]').type('Test');
    
    // Enter an ID that usually exists in demo data (e.g., 0001, 0002)
    cy.get('.oxd-grid-2 input.oxd-input').clear().type('0001');
    
    // Unfocus the field to trigger validation, or click Save
    cy.contains('button', 'Save').click();
    cy.get('.oxd-input-field-error-message').should('contain.text', 'Employee Id already exists');
  });

  it('TC-12: Navigation - Clicking Cancel routes back to Employee List', () => {
    cy.get('input[name="firstName"]').type('WillBeCanceled');
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/pim/viewEmployeeList');
  });

  // ==========================================
  // SECTION 2: CREATE EMPLOYEE WORKFLOWS (3 Tests)
  // ==========================================

  it('TC-04: Positive - Add Employee with basic mandatory fields', () => {
    cy.get('input[name="firstName"]').type('Basic');
    cy.get('input[name="lastName"]').type('User');
    cy.get('.oxd-grid-2 input.oxd-input').clear().type(uniqueId);
    
    cy.contains('button', 'Save').click();
    
    cy.get('.oxd-toast--success').should('be.visible');
    cy.url().should('include', '/pim/viewPersonalDetails/empNumber/');
  });

  it('TC-06 & TC-08: UI Toggle - "Create Login Details" expands fields & validates empty inputs', () => {
    cy.get('input[name="firstName"]').type('Login');
    cy.get('input[name="lastName"]').type('Test');
    
    // Toggle the switch
    cy.get('.oxd-switch-input').click();
    
    // Assert new fields are visible
    cy.contains('label', 'Username').should('be.visible');
    cy.contains('label', 'Password').should('be.visible');
    
    // Click save with empty login fields to test validation
    cy.contains('button', 'Save').click();
    cy.get('.oxd-input-field-error-message').should('have.length.at.least', 2);
  });

  it('TC-07: Positive - Add Employee with linked Login Details', () => {
    cy.get('input[name="firstName"]').type('Advanced');
    cy.get('input[name="lastName"]').type('Account');
    cy.get('.oxd-grid-2 input.oxd-input').clear().type(uniqueId + 'A');
    
    cy.get('.oxd-switch-input').click();
    
    // Target the newly expanded fields (Username, Pass, Confirm Pass)
    cy.get('label').contains('Username').parent().parent().find('input').type(loginUsername);
    cy.get('label').contains('Password').parent().parent().find('input[type="password"]').type('StrongPass@123!');
    cy.get('label').contains('Confirm Password').parent().parent().find('input[type="password"]').type('StrongPass@123!');
    
    cy.contains('button', 'Save').click();
    
    cy.get('.oxd-toast--success').should('be.visible');
    cy.url().should('include', '/pim/viewPersonalDetails/empNumber/');
  });

  // ==========================================
  // SECTION 3: IMAGE UPLOAD (1 Test)
  // ==========================================

  it('TC-09: Upload - Attach a valid profile picture', () => {
    // Requires cypress-file-upload plugin OR native selectFile (Cypress 9.3+)
    // Assume valid_avatar.jpg exists in cypress/fixtures/
    
    cy.get('input[type="file"]').selectFile('cypress/fixtures/valid_avatar.jpg', { force: true });
    
    // Fill required fields so we can save it
    cy.get('input[name="firstName"]').type('Photo');
    cy.get('input[name="lastName"]').type('User');
    cy.contains('button', 'Save').click();
    
    cy.get('.oxd-toast--success').should('be.visible');
  });

  // ==========================================
  // SECTION 4: SECURITY (1 Test)
  // ==========================================

  it('TC-14: Security - Unauthenticated access redirects to login', () => {
    cy.clearCookies();
    cy.visit(addEmpUrl);
    cy.url().should('include', '/auth/login');
  });
});