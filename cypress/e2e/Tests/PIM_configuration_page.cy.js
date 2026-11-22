describe('OrangeHRM PIM - Configuration Page (8-Test Suite)', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com';
  const configUrl = `${baseUrl}/web/index.php/pim/configurePim`;

  beforeEach(() => {
    // Standard Login
    cy.visit('/web/index.php/pim/configurePim');
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Navigate to PIM -> Configuration -> Optional Fields
    cy.contains('.oxd-main-menu-item', 'PIM').click();
    cy.contains('.oxd-topbar-body-nav-tab', 'Configuration').click();
    cy.contains('.oxd-dropdown-menu', 'Optional Fields').click();
    
    cy.url().should('include', '/pim/configurePim');
  });

  // ==========================================
  // SECTION 1: UI & NAVIGATION (3 Tests)
  // ==========================================

  it('TC-01: Page Load - Verify headers and layout', () => {
    cy.get('.oxd-topbar-header-breadcrumb').should('contain.text', 'PIM / Configuration');
    cy.contains('h6', 'Optional Fields').should('be.visible');
    cy.contains('p', 'Show Deprecated Fields').should('be.visible');
    cy.contains('p', 'Country Specific Information').should('be.visible');
  });

  it('TC-02: Navigation - Verify Top Menu Tabs', () => {
    cy.contains('.oxd-topbar-body-nav-tab', 'Employee List').click();
    cy.url().should('include', '/pim/viewEmployeeList');

    cy.go('back');
    cy.contains('.oxd-topbar-body-nav-tab', 'Add Employee').click();
    cy.url().should('include', '/pim/addEmployee');
  });

  it('TC-03: Navigation - Configuration dropdown reveals sub-options', () => {
    cy.contains('.oxd-topbar-body-nav-tab', 'Configuration').click();
    cy.get('.oxd-dropdown-menu').should('be.visible')
      .and('contain.text', 'Optional Fields')
      .and('contain.text', 'Custom Fields')
      .and('contain.text', 'Data Import');
  });

  // ==========================================
  // SECTION 2: TOGGLES & SAVING (4 Tests)
  // ==========================================

  it('TC-04: UI Toggles - Toggle "Show Deprecated Fields" switch', () => {
    // Locate the first switch and click it
    cy.get('.oxd-switch-input').eq(0).click();
    cy.get('.oxd-switch-input').eq(0).should('have.class', 'oxd-switch-input--active'); // Assuming active adds a class
  });

  it('TC-05: UI Toggles - Toggle all "Country Specific Information" switches', () => {
    // Click SSN, SIN, and US Tax switches
    cy.get('.oxd-switch-input').eq(1).click();
    cy.get('.oxd-switch-input').eq(2).click();
    cy.get('.oxd-switch-input').eq(3).click();
  });

  it('TC-06: Save Action - Clicking Save displays success toast', () => {
    // Toggle a field to ensure a change is registered, then Save
    cy.get('.oxd-switch-input').eq(0).click();
    cy.contains('button', 'Save').click();
    
    // Verify Toast message
    cy.get('.oxd-toast--success').should('be.visible').and('contain.text', 'Successfully Saved');
  });

  it('TC-07: State Persistence - Toggles retain state after saving and reloading', () => {
    // Ensure the first switch is ON
    cy.get('.oxd-switch-wrapper').eq(0).then(($wrapper) => {
      if (!$wrapper.find('.oxd-switch-input').hasClass('oxd-switch-input--active')) {
        cy.wrap($wrapper).click();
      }
    });
    
    cy.contains('button', 'Save').click();
    cy.get('.oxd-toast--success').should('be.visible');

    // Reload the page and verify it is still active
    cy.reload();
    cy.get('.oxd-switch-wrapper').eq(0).find('.oxd-switch-input').should('have.class', 'oxd-switch-input--active');
  });

  // ==========================================
  // SECTION 3: SECURITY (1 Test)
  // ==========================================

  it('TC-08: Security - Unauthenticated access redirects to login', () => {
    cy.clearCookies();
    cy.visit(configUrl);
    cy.url().should('include', '/auth/login');
  });
});