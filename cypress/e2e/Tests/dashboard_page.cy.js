describe('OrangeHRM Dashboard - Full 30-Test Automation Suite', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com';

  // Log in before each test so every test case runs independently
  beforeEach(() => {
    cy.visit(`${baseUrl}/web/index.php/auth/login`);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/web/index.php/dashboard/index');
  });

  // ==========================================
  // SECTION 1: LEFT NAVIGATION SIDEBAR (14 Tests)
  // ==========================================

  it('TC-01: Sidebar Search - Valid exact keyword match ("Leave")', () => {
    cy.get('input[placeholder="Search"]').type('Leave');
    cy.get('.oxd-main-menu-item').should('have.length', 1).and('contain.text', 'Leave');
  });

  it('TC-02: Sidebar Search - Case-insensitive partial keyword ("admin")', () => {
    cy.get('input[placeholder="Search"]').type('admin');
    cy.get('.oxd-main-menu-item').should('have.length', 1).and('contain.text', 'Admin');
  });

  it('TC-03: Sidebar Search - Non-existent keyword hides all menu items', () => {
    cy.get('input[placeholder="Search"]').type('InvalidModuleXYZ');
    cy.get('.oxd-main-menu-item').should('not.exist');
  });

  it('TC-04: Sidebar Toggle - Collapse and expand navigation panel', () => {
    cy.get('.oxd-sidepanel').should('not.have.class', 'toggled');
    cy.get('button.oxd-main-menu-button').click();
    cy.get('.oxd-sidepanel').should('have.class', 'toggled');
    cy.get('button.oxd-main-menu-button').click();
    cy.get('.oxd-sidepanel').should('not.have.class', 'toggled');
  });

  // Data-driven loop generating TC-05 through TC-15 (11 Sidebar Navigation Links)
  const sidebarModules = [
    { id: 'TC-05', name: 'Admin', urlPath: '/admin/viewSystemUsers' },
    { id: 'TC-06', name: 'PIM', urlPath: '/pim/viewEmployeeList' },
    { id: 'TC-07', name: 'Leave', urlPath: '/leave/viewLeaveList' },
    { id: 'TC-08', name: 'Time', urlPath: '/time/viewEmployeeTimesheet' },
    { id: 'TC-09', name: 'Recruitment', urlPath: '/recruitment/viewCandidates' },
    { id: 'TC-10', name: 'My Info', urlPath: '/pim/viewPersonalDetails' },
    { id: 'TC-11', name: 'Performance', urlPath: '/performance/searchEvaluatePerformanceReview' },
    { id: 'TC-12', name: 'Directory', urlPath: '/directory/viewDirectory' },
    { id: 'TC-13', name: 'Maintenance', urlPath: '/maintenance/purgeEmployee' },
    { id: 'TC-14', name: 'Claim', urlPath: '/claim/viewAssignClaim' },
    { id: 'TC-15', name: 'Buzz', urlPath: '/buzz/viewBuzz' }
  ];

  sidebarModules.forEach((module) => {
    it(`${module.id}: Sidebar Navigation - Clicking "${module.name}" routes to ${module.urlPath}`, () => {
      cy.contains('.oxd-main-menu-item', module.name).click();
      cy.url().should('include', module.urlPath);
    });
  });

  // ==========================================
  // SECTION 2: TOP HEADER BAR (4 Tests)
  // ==========================================

  it('TC-16: Header - "Upgrade" button is visible and clickable', () => {
    cy.contains('button', 'Upgrade')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('TC-17: Header - Help (?) icon button is displayed and interactive', () => {
    cy.get('button[title="Help"]').should('be.visible').click();
  });

  it('TC-18: Header - User Profile dropdown displays About, Support, and Change Password', () => {
    cy.get('.oxd-userdropdown-tab').click();
    cy.get('.oxd-dropdown-menu').should('be.visible');
    cy.contains('.oxd-userdropdown-link', 'About').should('be.visible');
    cy.contains('.oxd-userdropdown-link', 'Support').should('be.visible');
    cy.contains('.oxd-userdropdown-link', 'Change Password').should('be.visible');
  });

  it('TC-19: Header - Clicking "Logout" terminates session and returns to login page', () => {
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('.oxd-userdropdown-link', 'Logout').click();
    cy.url().should('include', '/auth/login');
  });

  // ==========================================
  // SECTION 3: DASHBOARD WIDGETS (9 Tests)
  // ==========================================

  it('TC-20: Widget [Time at Work] - Displays punch status and daily/weekly hours', () => {
    cy.contains('.orangehrm-dashboard-widget', 'Time at Work').within(() => {
      cy.get('.orangehrm-attendance-card-state').should('be.visible');
      cy.get('.orangehrm-attendance-card-fulltime').should('contain.text', 'Today');
      cy.contains('This Week').should('be.visible');
    });
  });

  it('TC-21: Widget [Time at Work] - Stopwatch icon redirects to Attendance Punch In/Out', () => {
    cy.contains('.orangehrm-dashboard-widget', 'Time at Work')
      .find('button.orangehrm-attendance-card-action')
      .click();
    cy.url().should('include', '/attendance/punchIn');
  });

  it('TC-22: Widget [My Actions] - Clicking pending action navigates to target module', () => {
    cy.contains('.orangehrm-dashboard-widget', 'My Actions').within(() => {
      cy.get('.orangehrm-todo-list-item').first().click();
    });
    cy.url().should('not.include', '/dashboard/index');
  });

  // Data-driven loop generating TC-23 through TC-28 (6 Quick Launch Shortcuts)
  const quickLaunchShortcuts = [
    { id: 'TC-23', title: 'Assign Leave', expectedUrl: '/leave/assignLeave' },
    { id: 'TC-24', title: 'Leave List', expectedUrl: '/leave/viewLeaveList' },
    { id: 'TC-25', title: 'Timesheets', expectedUrl: '/time/viewEmployeeTimesheet' },
    { id: 'TC-26', title: 'Apply Leave', expectedUrl: '/leave/applyLeave' },
    { id: 'TC-27', title: 'My Leave', expectedUrl: '/leave/viewMyLeaveList' },
    { id: 'TC-28', title: 'My Timesheet', expectedUrl: '/time/viewMyTimesheet' }
  ];

  quickLaunchShortcuts.forEach((shortcut) => {
    it(`${shortcut.id}: Widget [Quick Launch] - Clicking "${shortcut.title}" routes to ${shortcut.expectedUrl}`, () => {
      cy.contains('.orangehrm-dashboard-widget', 'Quick Launch')
        .find(`button[title="${shortcut.title}"]`)
        .click();
      cy.url().should('include', shortcut.expectedUrl);
    });
  });

  it('TC-29: Widget [Buzz, Leave & Sub Unit] - Bottom row widgets render accurately', () => {
    cy.contains('.orangehrm-dashboard-widget-name', 'Buzz Latest Posts').should('be.visible');
    cy.contains('.orangehrm-dashboard-widget-name', 'Employees on Leave Today').should('be.visible');
    cy.contains('.orangehrm-dashboard-widget-name', 'Employee Distribution by Sub Unit').should('be.visible');
    
    // Verify chart canvas renders inside Sub Unit widget
    cy.contains('.orangehrm-dashboard-widget', 'Employee Distribution by Sub Unit')
      .find('canvas')
      .should('be.visible');
  });

  // ==========================================
  // SECTION 4: SECURITY & RESPONSIVENESS (1 Test)
  // ==========================================

  it('TC-30: Security & Viewport - Mobile layout adapts cleanly & unauthenticated access is blocked', () => {
    // 1. Check mobile viewport responsiveness (iPhone X dimensions)
    cy.viewport(375, 812);
    cy.get('.oxd-topbar-header-hamburger').should('be.visible');

    // 2. Clear session cookies and attempt direct dashboard access
    cy.clearCookies();
    cy.visit(`${baseUrl}/web/index.php/dashboard/index`);
    cy.url().should('include', '/auth/login');
  });
});