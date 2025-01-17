/*
 *    Copyright 2018 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
import { goToTab, isActiveTab, setTokenUserViewPort, setTokenUserViewPortCurator } from '../../support/commands';

describe('Dropdown test', () => {
  // TODO: GitLab tests are commented out
  setTokenUserViewPortCurator();

  beforeEach(() => {
    cy.server().route({
      method: 'GET',
      url: /extended/,
      response: { canChangeUsername: true },
    });

    cy.visit('');

    // Select dropdown
    cy.get('[data-cy=dropdown-main]:visible').click();
  });

  describe('Go to starred page', () => {
    beforeEach(() => {
      // Select dropdown tokens
      cy.get('#dropdown-starred').click();
    });

    it('Should have nothing starred', () => {
      cy.get('#starCountButton').should('not.exist');
      cy.get('#starringButton').should('not.exist');
    });

    it('cy.should - assert that <title> is correct', () => {
      cy.title().should('include', 'Dockstore');
    });
  });

  describe('Go to accounts page', () => {
    beforeEach(() => {
      // Select dropdown accounts
      cy.get('#dropdown-accounts').click();
    });

    it('Should show all accounts as linked (except GitLab and Bitbucket)', () => {
      everythingOk();
    });
    setTokenUserViewPort();
    // Check that changing the tab changes the url
    it('should default to accounts tab', () => {
      cy.visit('/accounts');
      cy.url().should('eq', Cypress.config().baseUrl + '/accounts?tab=accounts');
    });
    it('should default to accounts tab when tab name misspelled', () => {
      cy.visit('/accounts?tab=abcd');
      cy.url().should('eq', Cypress.config().baseUrl + '/accounts?tab=accounts');
    });
    it('Change tab to Dockstore Account & Preferences', () => {
      goToTab('Dockstore Account & Preferences');
      cy.url().should('eq', Cypress.config().baseUrl + '/accounts?tab=dockstore%20account%20and%20preferences');
    });
    it('Change tab to requests', () => {
      goToTab('Requests');
      cy.url().should('eq', Cypress.config().baseUrl + '/accounts?tab=requests');
    });
    // Check that changing the url changes the tab
    it('Link to accounts tab', () => {
      cy.visit('/accounts?tab=accounts');
      isActiveTab('Accounts');
    });
    it('Link to Dockstore Account & Preferences tab', () => {
      cy.visit('/accounts?tab=dockstore%20account%20and%20preferences');
      isActiveTab('Dockstore Account & Preferences');
    });
    it('Link to requests tab', () => {
      cy.visit('/accounts?tab=requests');
      isActiveTab('Requests');
    });
  });

  describe('Go to requests page', () => {
    beforeEach(() => {
      // Pending orgs starts with two
      const pendingOrganizations = [
        { id: 1000, name: 'OrgOne', status: 'PENDING' },
        { id: 1001, name: 'OrgTwo', status: 'PENDING' },
      ];

      cy.server().route({
        method: 'GET',
        url: '*/organizations/all?type=pending',
        response: pendingOrganizations,
      });

      // Logged in user has two memberships, one is not accepted
      const memberships = [
        {
          id: 1,
          role: 'MAINTAINER',
          accepted: false,
          organization: { id: 1000, status: 'PENDING', name: 'orgOne', displayName: 'orgOne' },
        },
        {
          id: 2,
          role: 'MAINTAINER',
          accepted: true,
          organization: { id: 1001, status: 'PENDING', name: 'orgTwo', displayName: 'orgTwo' },
        },
        {
          id: 3,
          role: 'MAINTAINER',
          accepted: true,
          organization: { id: 1002, status: 'REJECTED', name: 'orgThree', displayName: 'orgThree' },
        },
      ];
      cy.server().route({
        method: 'GET',
        url: '*/users/user/memberships',
        response: memberships,
      });
      // Choose dropdown
      cy.get('#dropdown-accounts').click();
      cy.contains('Requests').click();
    });

    it('Should have one rejected org', () => {
      // Mock request re-review
      cy.server().route({
        method: 'POST',
        url: '*/organizations/1002/request',
        response: { id: 1002, name: 'OrgThree', status: 'PENDING' },
      });

      // Mock new pending orgs
      const pendingOrganizations = [
        { id: 1000, name: 'OrgOne', status: 'PENDING' },
        { id: 1001, name: 'OrgTwo', status: 'PENDING' },
        { id: 1002, name: 'OrgThree', status: 'PENDING' },
      ];

      cy.server().route({
        method: 'GET',
        url: '*/organizations/all?type=pending',
        response: pendingOrganizations,
      });

      // Mock new my pending orgs
      const memberships = [
        { id: 1, role: 'MAINTAINER', accepted: false, organization: { id: 1000, status: 'PENDING', name: 'orgOne' } },
        { id: 2, role: 'MAINTAINER', accepted: true, organization: { id: 1001, status: 'PENDING', name: 'orgTwo' } },
        { id: 3, role: 'MAINTAINER', accepted: true, organization: { id: 1002, status: 'PENDING', name: 'orgThree' } },
      ];
      cy.server().route({
        method: 'GET',
        url: '*/users/user/memberships',
        response: memberships,
      });

      // Ensure that there is one org
      cy.get('#my-rejected-org-card-0').should('be.visible');
      cy.get('#my-rejected-org-card-1').should('not.exist');

      // Request re-review
      cy.get('#request-re-review-0').should('be.visible').click();
      cy.get('#my-rejected-org-card-0').should('not.exist');

      // Should now have org in pending (3 Total)
      cy.get('#pending-org-card-0').should('be.visible');
      cy.get('#pending-org-card-1').should('be.visible');
      cy.get('#pending-org-card-2').should('be.visible');

      // Should now have org in my pending (2 Total)
      cy.get('#my-pending-org-card-0').should('be.visible');
      cy.get('#my-pending-org-card-1').should('be.visible');
    });

    it('Should have two pending orgs', () => {
      // Endpoint should return only one pending organization after approval
      const pendingOrganizations = [{ id: 1001, name: 'OrgTwo', status: 'PENDING' }];
      cy.server().route({
        method: 'GET',
        url: '*/organizations/all?type=pending',
        response: pendingOrganizations,
      });

      // Stub approve response
      cy.server().route({
        method: 'POST',
        url: '*/organizations/1000/approve',
        response: [],
      });

      // Ensure that there are two orgs
      cy.get('#pending-org-card-0').should('be.visible');
      cy.get('#pending-org-card-1').should('be.visible');

      // Accept first org
      cy.get('#reject-pending-org-0').should('be.visible');
      cy.get('#approve-pending-org-0').should('be.visible').click();
      cy.get('#approve-pending-org-dialog').should('be.visible').click();

      // Ensure that only one org exists now
      cy.get('#pending-org-card-0').should('be.visible');
      cy.get('#pending-org-card-1').should('not.exist');
    });

    it('Should have a pending invite', () => {
      // Stub the accept invite response
      cy.server().route({
        method: 'POST',
        url: '*/organizations/1000/invitation?accept=true',
        response: [],
      });

      // Membership should have two accepted entries
      const memberships = [
        { id: 1, role: 'MAINTAINER', accepted: true, organization: { id: 1000, status: 'PENDING', name: 'orgOne' } },
        { id: 2, role: 'MAINTAINER', accepted: true, organization: { id: 1001, status: 'PENDING', name: 'orgTwo' } },
      ];
      cy.server().route({
        method: 'GET',
        url: '*/users/user/memberships',
        response: memberships,
      });

      // One invite should be visible
      cy.get('#my-org-invites-card-0').should('be.visible');

      // Accept org invite
      cy.get('#reject-invite-org-0').should('be.visible');
      cy.get('#accept-invite-org-0').should('be.visible').click();
      cy.get('#accept-pending-org-dialog').should('be.visible').click();

      // Should have two orgs in pending list
      cy.get('#my-pending-org-card-0').should('be.visible');
      cy.get('#my-pending-org-card-1').should('be.visible');
    });

    it('Should have a pending org request', () => {
      // One pending org request should be visible
      cy.get('#my-pending-org-card-0').should('be.visible');
    });

    it('Should be able to delete pending/reject org request', () => {
      // Both pending and rejected orgs should be visible
      cy.get('#my-pending-org-card-0').should('be.visible');
      cy.get('#my-rejected-org-card-0').should('be.visible');

      // JSON object for the membership that is not affiliated with the user
      const nonAffiliatedMembership = {
        id: 1,
        role: 'MAINTAINER',
        accepted: false,
        organization: { id: 1000, status: 'PENDING', name: 'orgOne', displayName: 'orgOne' },
      };

      // New mocked memberships after deleting the rejected organization
      const membershipsAfterFirstDeletion = [
        nonAffiliatedMembership,
        { id: 2, role: 'MAINTAINER', accepted: true, organization: { id: 1001, status: 'PENDING', name: 'orgTwo', displayName: 'orgTwo' } },
      ];

      // Route all DELETE API calls to organizations respond with with an empty JSON object
      cy.server().route({
        method: 'DELETE',
        url: '*/organizations/*',
        response: [],
      });

      // Route GET API call to user/membership with the mocked membership JSON object after first deletion
      cy.server().route({
        method: 'GET',
        url: '*/users/user/memberships',
        response: membershipsAfterFirstDeletion,
      });

      // Delete the rejected organization
      // Should result with the rejected organization no longer existing, and only the pending and non-affiliated org existing
      cy.get('#delete-my-rejected-org-0').should('be.visible').click();
      cy.contains('div', 'Delete Organization').within(() => {
        cy.contains('button', 'Delete').click();
      });
      cy.get('#my-pending-org-card-0').should('be.visible');
      cy.get('#my-rejected-org-card-0').should('not.exist');

      // Route GET API call to user/memberships to respond with the membership JSON object that the user is not affiliated with
      cy.server().route({
        method: 'GET',
        url: '*/users/user/memberships',
        response: [nonAffiliatedMembership],
      });

      // Route all GET requests to organizations/all?type=pending to the non affiliated organization
      cy.server().route({
        method: 'GET',
        url: '*/organizations/all?type=pending',
        response: [nonAffiliatedMembership],
      });

      // Delete the pending organization
      // Should result with the organization no longer existing and the request page empty of rejected/pending orgs
      cy.get('#delete-my-pending-org-0').should('be.visible').click();
      cy.contains('div', 'Delete Organization').within(() => {
        cy.contains('button', 'Delete').click();
      });
      cy.get('#my-pending-org-card-0').should('not.exist');
      cy.get('#my-rejected-org-card-0').should('not.exist');
    });
  });

  describe('Go to enabled Dockstore Account & Preferences', () => {
    beforeEach(() => {
      // Select dropdown accounts
      cy.server().route({
        method: 'DELETE',
        url: '*/users/user',
        response: 'true',
      });
      cy.get('#dropdown-accounts').click();
      cy.contains('Dockstore Account & Preferences').click();
    });
    it('Should have the danger alert', () => {
      cy.get('.alert-danger').should('be.visible');
    });
    it('Should have the delete button enabled', () => {
      cy.contains('Delete Dockstore Account').should('not.be.disabled').click();
      cy.contains('Yes, delete my account').should('be.disabled');
      cy.get('#deleteUserUsernameInput').type('potato');
      cy.contains('Yes, delete my account').should('be.disabled');
      cy.get('#deleteUserUsernameInput').clear().type('user_curator');
      cy.contains('Yes, delete my account').should('not.be.disabled').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/logout');
    });
    it('Should have the change username button disabled for current username', () => {
      cy.contains('Edit Dockstore Username').click();
      cy.contains('Save').should('be.disabled');
    });
  });
  const everythingOk = () => {
    cy.get('#unlink-GitHub').should('be.visible');
    cy.get('#unlink-Quay').should('be.visible');
    cy.get('#link-Bitbucket').should('be.visible');
    cy.get('#link-GitLab').should('be.visible');
  };

  const goToAccountsOnboarding = () => {
    cy.visit('/accounts');
  };
  describe('Go to setup page', () => {
    beforeEach(() => {
      // Select dropdown setup
      cy.get('#dropdown-onboarding').click();
    });

    it('Should let you change your username if possible', () => {
      cy.get('#updateUsername').should('not.be.disabled');
      cy.get('#username').type('-');
      cy.get('#updateUsername').should('be.disabled');
      cy.get('#username').type('a');
      cy.get('#updateUsername').should('not.be.disabled');
      cy.get('#username').type('@');
      cy.get('#updateUsername').should('be.disabled');
    });

    it('Should show all accounts as linked (except GitLab and Bitbucket)', () => {
      // everythingOk();
      // goToAccountsOnboarding();
      // cy.visit( '/auth/gitlab.com?code=somefakeid', {'failOnStatusCode': false}).then((resp) => {
      //     expect(resp.status).to.eq('')
      // })
      // goToAccountsOnboarding();
      // TODO: Gitlab is being very slow, hopefully one day we can remove this
      // cy.wait(10000);

      goToAccountsOnboarding();
      everythingOk();
      goToAccountsOnboarding();
      cy.visit('/auth/bitbucket.org?code=somefakeid', { failOnStatusCode: false }).then((resp) => {
        expect(resp.status).to.eq('');
      });
      goToAccountsOnboarding();
      everythingOk();
      goToAccountsOnboarding();
      cy.visit('/auth/potato.com?code=somefakeid', { failOnStatusCode: false }).then((resp) => {
        expect(resp.status).to.eq('');
      });
      goToAccountsOnboarding();
      everythingOk();
      goToAccountsOnboarding();
      cy.visit('/auth/github.com?code=somefakeid', { failOnStatusCode: false }).then((resp) => {
        expect(resp.status).to.eq('');
      });
      goToAccountsOnboarding();
      everythingOk();
      goToAccountsOnboarding();
      cy.visit('/auth/quay.io?code=somefakeid', { failOnStatusCode: false }).then((resp) => {
        expect(resp.status).to.eq('');
      });
      goToAccountsOnboarding();
      everythingOk();
    });
    // TODO: this part of the wizard has been reworked
    // it('Go through steps', () => {
    //     // Should start on step 1
    //     cy
    //         .get('h3').contains('Step 1')
    //         .should('be.visible')
    //     cy
    //         .get('h3').contains('Step 2')
    //         .should('not.exist')
    //     cy
    //         .get('h3').contains('Step 3')
    //         .should('not.exist')
    //     cy
    //         .get('#next_step')
    //         .click()
    //
    //     // Should now be on step 2
    //     cy
    //         .get('h3').contains('Step 1')
    //         .should('not.exist')
    //     cy
    //         .get('h3').contains('Step 2')
    //         .should('be.visible')
    //     cy
    //         .get('h3').contains('Step 3')
    //         .should('not.exist')
    //     cy
    //         .get('#next_step')
    //         .click()
    //
    //     // Should now be on step 3
    //     cy
    //         .get('h3').contains('Step 1')
    //         .should('not.exist')
    //     cy
    //         .get('h3').contains('Step 2')
    //         .should('not.exist')
    //     cy
    //         .get('h3').contains('Step 3')
    //         .should('be.visible')
    //     cy
    //         .get('#finish_step')
    //         .click()
    // });
  });
});
